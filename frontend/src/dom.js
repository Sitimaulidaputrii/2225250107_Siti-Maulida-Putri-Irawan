/** Pembantu kecil untuk membuat elemen DOM tanpa innerHTML (aman dari XSS). */
export function el(tag, atribut = {}, ...anak) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(atribut)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  node.append(...anak.flat().filter((a) => a != null && a !== false));
  return node;
}
