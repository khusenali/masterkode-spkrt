(async () => {
  const REPO = 'khusenali/masterkode-spkrt';
  const BRANCH = 'main';
  const PATH = 'sumber/spkrt.db.gz';
  const KEY = 'kodeSpkrtGhToken';
  try {
    if (!location.href.includes('/master/config.js')) {
      alert('Buka https://spkrt.web.bps.go.id/master/config.js dulu. Tutup semua tab app Master. Lalu klik bookmark ini lagi.');
      return;
    }
    try { localStorage.removeItem(KEY); } catch (e) {}
    const tok = (prompt('Tempel GitHub fine-grained token (tidak disimpan, hanya dipakai untuk unggah ini):') || '').trim();
    if (!tok) return;
    const handles = [];
    const walk = async (d) => {
      for await (const [, h] of d.entries()) {
        if (h.kind === 'directory') await walk(h); else handles.push(h);
      }
    };
    await walk(await navigator.storage.getDirectory());
    let best = null, off = 0;
    for (const h of handles) {
      const f = await h.getFile();
      if (f.size < 8192) continue;
      const sig = async (o) => new TextDecoder().decode(await f.slice(o, o + 15).arrayBuffer());
      const o = (await sig(4096)) === 'SQLite format 3' ? 4096 : (await sig(0)) === 'SQLite format 3' ? 0 : -1;
      if (o >= 0 && (!best || f.size > best.size)) { best = f; off = o; }
    }
    if (!best) { alert('Database tidak ditemukan. Buka app Master sampai data tampil, tutup tabnya, lalu coba lagi.'); return; }
    const gz = new Uint8Array(await new Response(best.slice(off).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    const head = new TextEncoder().encode('blob ' + gz.length + '\0');
    const all = new Uint8Array(head.length + gz.length); all.set(head); all.set(gz, head.length);
    const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-1', all))].map(b => b.toString(16).padStart(2, '0')).join('');
    const api = 'https://api.github.com/repos/' + REPO + '/contents/' + PATH;
    const hdr = { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json' };
    const cek = await fetch(api + '?ref=' + BRANCH, { headers: hdr });
    if (cek.status === 401) { alert('Token ditolak atau kedaluwarsa. Buat token baru lalu klik lagi.'); return; }
    const lama = cek.ok ? (await cek.json()).sha : undefined;
    if (lama === sha) { alert('Data pusat sama dengan yang sudah ada di app. Tidak ada yang diunggah.'); return; }
    const b64 = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result.split(',')[1]); r.onerror = no; r.readAsDataURL(new Blob([gz])); });
    const put = await fetch(api, { method: 'PUT', headers: hdr, body: JSON.stringify({ message: 'Unggah database master pusat', content: b64, branch: BRANCH, sha: lama }) });
    if (!put.ok) { alert('Gagal unggah: ' + put.status + ' ' + (await put.text()).slice(0, 200)); return; }
    alert('Berhasil diunggah (' + (gz.length / 1048576).toFixed(1) + ' MB). App akan diperbarui otomatis dalam 1-3 menit.');
  } catch (e) {
    alert(e && e.name === 'NoModificationAllowedError'
      ? 'File database sedang dipakai. Tutup semua tab app Master, lalu klik lagi.'
      : 'Error: ' + (e && e.message ? e.message : e));
  }
})();
