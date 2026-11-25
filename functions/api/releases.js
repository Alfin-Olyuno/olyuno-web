// GET /api/releases
// Daftar rilis (maksimal 12) untuk halaman changelog. Catatan rilis diambil dari deskripsi
// release di GitHub, jadi cukup tulis di sana saat membuat rilis baru.
import { ghJson, json } from "../_lib/github.js";

export async function onRequestGet({ env }) {
  try {
    const list = await ghJson("?per_page=12", env);
    const releases = list
      .filter((r) => !r.draft)
      .map((r) => ({
        tag: r.tag_name,
        name: r.name || r.tag_name,
        published: r.published_at,
        prerelease: r.prerelease,
        notes: r.body || "",
      }));
    return json({ releases });
  } catch (_) {
    return json({ releases: [] }, 502, 60);
  }
}
