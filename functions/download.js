// GET /download
// Mengambil APK rilis terbaru dari GitHub Releases lalu mengalirkannya ke pengunjung.
// Pengunjung tetap berada di olyuno.my.id dan tidak pernah diarahkan ke GitHub.
import { REPO, FALLBACK_APK, ghJson, pickApk } from "./_lib/github.js";

const APK_TYPE = "application/vnd.android.package-archive";

function safeName(tag) {
  return String(tag || "").replace(/[^\w.\-]+/g, "");
}

export async function onRequestGet({ request, env }) {
  let url = `https://github.com/${REPO}/releases/latest/download/${FALLBACK_APK}`;
  let filename = FALLBACK_APK;
  let size = null;

  try {
    const release = await ghJson("/latest", env);
    const apk = pickApk(release);
    if (apk) {
      url = apk.browser_download_url;
      size = apk.size;
      const tag = safeName(release.tag_name);
      filename = tag ? `Olyuno-${tag}.apk` : apk.name;
    }
  } catch (_) {
    // API gagal: lanjut pakai URL cadangan di atas.
  }

  // Teruskan Range supaya unduhan bisa dilanjutkan kalau terputus.
  const upstreamHeaders = new Headers();
  const range = request.headers.get("Range");
  if (range) upstreamHeaders.set("Range", range);

  const upstream = await fetch(url, {
    headers: upstreamHeaders,
    cf: { cacheEverything: true, cacheTtl: 3600 },
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(
      "File Olyuno belum tersedia. Coba lagi beberapa saat lagi.",
      { status: 502, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const out = new Headers({
    "Content-Type": APK_TYPE,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  });
  const length = upstream.headers.get("Content-Length") || (size && !range ? String(size) : null);
  if (length) out.set("Content-Length", length);
  const contentRange = upstream.headers.get("Content-Range");
  if (contentRange) out.set("Content-Range", contentRange);

  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export const onRequestHead = onRequestGet;
