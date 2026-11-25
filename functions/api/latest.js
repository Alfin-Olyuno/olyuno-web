// GET /api/latest
// Info rilis terbaru untuk ditampilkan di halaman: versi, ukuran APK, tanggal.
import { ghJson, pickApk, json } from "../_lib/github.js";

export async function onRequestGet({ env }) {
  try {
    const release = await ghJson("/latest", env);
    const apk = pickApk(release);
    return json({
      tag: release.tag_name,
      name: release.name || release.tag_name,
      published: release.published_at,
      size: apk ? apk.size : null,
      available: Boolean(apk),
    });
  } catch (_) {
    return json({ available: false }, 502, 60);
  }
}
