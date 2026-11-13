/**
 * Router hash sederhana: "#/modul/M4" -> { nama: "modul", param: ["M4"] }.
 * Hash dipilih (bukan history API) agar aman di semua hosting statis dan offline.
 */
export function parseRute(hash) {
  const bersih = (hash || '').replace(/^#\/?/, '').replace(/\/+$/, '');
  if (!bersih) return { nama: 'beranda', param: [] };
  const [nama, ...param] = bersih.split('/').map(decodeURIComponent);
  return { nama, param };
}

export function buatRouter(tabelRute, wadah) {
  function tampilkan() {
    const { nama, param } = parseRute(location.hash);
    const render = tabelRute[nama] || tabelRute.tidakDitemukan;
    wadah.replaceChildren(render(...param));
    wadah.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', tampilkan);
  tampilkan();
}
