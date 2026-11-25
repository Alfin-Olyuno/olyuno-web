(function () {
  "use strict";

  /* ---------- Info rilis terbaru (versi dan ukuran file) ---------- */
  function formatSize(bytes) {
    return "Ukuran " + (bytes / 1048576).toFixed(1).replace(".", ",") + " MB";
  }

  function initLatest() {
    var versionEls = document.querySelectorAll("[data-version]");
    var sizeEls = document.querySelectorAll("[data-size]");
    if (!versionEls.length) return;

    fetch("/api/latest")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.available) return;
        if (d.tag) {
          var tag = /^\d/.test(d.tag) ? "v" + d.tag : d.tag;
          versionEls.forEach(function (el) { el.textContent = tag; });
        }
        if (d.size) {
          sizeEls.forEach(function (el) {
            el.textContent = formatSize(d.size);
            el.hidden = false;
          });
        }
      })
      .catch(function () { /* tetap pakai teks bawaan */ });
  }

  /* ---------- Changelog ---------- */
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  // Penyaji markdown kecil: judul, daftar, paragraf, tebal, kode, tautan. Teks di-escape dulu.
  function renderNotes(md) {
    var out = [];
    var inList = false;
    function closeList() { if (inList) { out.push("</ul>"); inList = false; } }

    md.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      var item = /^[-*]\s+(.*)$/.exec(line);
      var head = /^#{1,6}\s+(.*)$/.exec(line);
      if (item) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + inline(item[1]) + "</li>");
      } else if (head) {
        closeList();
        out.push("<h3>" + inline(head[1]) + "</h3>");
      } else if (line) {
        closeList();
        out.push("<p>" + inline(line) + "</p>");
      } else {
        closeList();
      }
    });
    closeList();
    return out.join("");
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) { return ""; }
  }

  function initChangelog() {
    var box = document.querySelector("[data-releases]");
    if (!box) return;

    fetch("/api/releases")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.releases || !d.releases.length) return; // biarkan isi bawaan
        box.innerHTML = d.releases.map(function (r) {
          var notes = r.notes && r.notes.trim()
            ? renderNotes(r.notes)
            : '<p class="empty">Belum ada catatan untuk versi ini.</p>';
          return '<article class="release"><header><h2>' + esc(r.name || r.tag) + "</h2>" +
            (r.prerelease ? '<span class="tag">Beta</span>' : "") +
            (r.published ? '<time datetime="' + esc(r.published) + '">' + formatDate(r.published) + "</time>" : "") +
            '</header><div class="notes">' + notes + "</div></article>";
        }).join("");
      })
      .catch(function () { /* tetap pakai isi bawaan */ });
  }

  initLatest();
  initChangelog();
})();
