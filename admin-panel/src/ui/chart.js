// Minimal, dependency-free, theme-aware SVG charts. Colors come from CSS
// classes so they follow light/dark automatically.
const NS = 'http://www.w3.org/2000/svg';
function el(name, attrs = {}, children = []) {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  (Array.isArray(children) ? children : [children]).forEach((c) => c != null && n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return n;
}

/**
 * Horizontal bar chart.
 * @param {{label,value}[]} data
 */
export function barChart(data, { width = 560, barHeight = 26, gap = 12, labelWidth = 130 } = {}) {
  const max = Math.max(1, ...data.map((d) => d.value || 0));
  const chartW = width - labelWidth - 56;
  const height = data.length * (barHeight + gap) - gap + 8;

  const rows = data.map((d, i) => {
    const y = i * (barHeight + gap) + 4;
    const w = Math.max(2, Math.round(((d.value || 0) / max) * chartW));
    return el('g', {}, [
      el('text', { x: labelWidth - 10, y: y + barHeight / 2 + 4, 'text-anchor': 'end', class: 'chart__label' }, String(d.label)),
      el('rect', { x: labelWidth, y, width: chartW, height: barHeight, rx: 5, class: 'chart__track' }),
      el('rect', { x: labelWidth, y, width: w, height: barHeight, rx: 5, class: 'chart__bar' }),
      el('text', { x: labelWidth + w + 8, y: y + barHeight / 2 + 4, class: 'chart__value' }, (d.value ?? 0).toLocaleString()),
    ]);
  });

  return el('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height, role: 'img', 'aria-label': 'Counts by resource', class: 'chart' }, rows);
}
