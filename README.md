# Situs Olyuno (olyuno.my.id)

Situs statis + Cloudflare Pages Functions. Tanpa build step.

```
public/            halaman, CSS, JS, ikon (folder output Pages)
functions/
  download.js      /download   -> mengalirkan APK rilis terbaru dari GitHub Releases
  api/latest.js    /api/latest -> versi + ukuran APK untuk tombol unduh
  api/releases.js  /api/releases -> daftar rilis untuk halaman /changelog
  _lib/github.js   nama repo, pemilih file APK, cache
```

## Deploy ke Cloudflare Pages

1. Push folder ini ke repo GitHub (boleh repo terpisah dari repo aplikasi).
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git.
3. Pengaturan build: Framework preset **None**, Build command **kosong**, Build output directory **public**.
4. Setelah deploy: Custom domains > tambahkan `olyuno.my.id` (pindahkan nameserver domain ke Cloudflare).
5. Opsional: Settings > Variables and Secrets > tambahkan `GITHUB_TOKEN` (token GitHub tanpa scope apa pun) supaya batas API GitHub naik.

## Cara merilis versi baru

1. Di repo `Alfin-Olyuno/olyuno`: Releases > Draft a new release, isi tag (misal `v1.0.0`).
2. Lampirkan file APK. Nama bebas, asal berakhiran `.apk` dan tidak mengandung "debug".
   Disarankan juga ada satu file bernama persis `Olyuno.apk` sebagai cadangan.
3. Tulis catatan rilis (markdown) di deskripsi release. Isinya otomatis tampil di `/changelog`.

Tombol unduh, versi, dan ukuran file di situs ikut berubah sendiri, tanpa deploy ulang
(cache sekitar 5 menit).

## Ganti repo

Ubah `REPO` di `functions/_lib/github.js` dan tautan GitHub di `public/*.html`.
