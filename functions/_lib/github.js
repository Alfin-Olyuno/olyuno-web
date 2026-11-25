// Pengaturan dan helper GitHub yang dipakai semua Function.
// Ganti REPO kalau repo Olyuno pindah.
export const REPO = "Alfin-Olyuno/olyuno";

// Nama file cadangan kalau GitHub API sedang kena batas. Upload APK rilis dengan nama ini
// supaya https://github.com/<repo>/releases/latest/download/Olyuno.apk selalu valid.
export const FALLBACK_APK = "Olyuno.apk";

const API = `https://api.github.com/repos/${REPO}/releases`;

function headers(env) {
  const h = {
    Accept: "application/vnd.github+json",
    "User-Agent": "olyuno-site",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Opsional: isi secret GITHUB_TOKEN di Cloudflare supaya batas API naik jauh.
  if (env && env.GITHUB_TOKEN) h.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return h;
}

// Ambil JSON dari GitHub, di-cache di edge Cloudflare supaya tidak menembak API tiap request.
export async function ghJson(path, env, ttl = 300) {
  const res = await fetch(API + path, {
    headers: headers(env),
    cf: { cacheEverything: true, cacheTtl: ttl },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

// Pilih file APK dari satu rilis: utamakan yang bernama Olyuno dan bukan debug.
export function pickApk(release) {
  const apks = (release.assets || []).filter((a) => /\.apk$/i.test(a.name));
  return (
    apks.find((a) => /olyuno/i.test(a.name) && !/debug/i.test(a.name)) ||
    apks.find((a) => !/debug/i.test(a.name)) ||
    apks[0] ||
    null
  );
}

export function json(data, status = 200, maxAge = 300) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}
