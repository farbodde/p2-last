// Read-only record inspector, built from a list row (no extra fetch). Used by
// list-only resources like Feedback and User Reports.
import { h } from '../ui/dom.js';
import { openDialog } from '../ui/dialog.js';
import { badge } from '../ui/components.js';
import { fmtDate, absUrl, boolBadge } from '../ui/format.js';
import { prettyLabel } from './shared.js';

export function openRecordDialog(resource, row) {
  const fields = resource.fields || [];
  const rows = [];

  fields.forEach((f) => {
    if (f.name === resource.detailImages) return; // images rendered separately
    const v = row[f.name];
    rows.push(h('div.rec__row', [h('div.rec__k', f.label || prettyLabel(f.name)), h('div.rec__v', renderValue(f, v))]));
  });

  const body = h('div.rec', rows);

  // Images (feedback screenshots: [{id,image}] ; report image_urls: [url])
  const imgKey = resource.detailImages;
  if (imgKey && Array.isArray(row[imgKey]) && row[imgKey].length) {
    const imgs = row[imgKey].map((it) => {
      const url = typeof it === 'string' ? it : it.image;
      return h('a.rec__img', { href: absUrl(url), target: '_blank', rel: 'noopener' }, h('img', { src: absUrl(url), alt: '', loading: 'lazy' }));
    });
    body.appendChild(h('div.rec__row', [h('div.rec__k', 'Images'), h('div.rec__imgs', imgs)]));
  }

  openDialog({
    title: `${singular(resource.label)} #${row.id ?? ''}`,
    body,
    size: 'md',
    actions: [{ label: 'Close', kind: 'ghost', onClick: ({ close }) => close() }],
  });
}

function renderValue(f, v) {
  if (v === null || v === undefined || v === '') return h('span.muted', '—');
  switch (f.type) {
    case 'boolean':
      return boolBadge(v);
    case 'datetime':
    case 'date':
      return fmtDate(v) || String(v);
    case 'choice':
      return badge(String(v), { kind: 'info' });
    case 'list':
      return Array.isArray(v) ? (v.length ? v.join(', ') : h('span.muted', '—')) : String(v);
    case 'text':
      return h('div.rec__text', String(v));
    default:
      return String(v);
  }
}

function singular(label) {
  return label.replace(/s$/, '');
}
