// Value formatting helpers for table cells and detail views.
import { h } from './dom.js';
import { badge } from './components.js';
import { API_BASE } from '../config.js';

export function absUrl(u) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return API_BASE + (u.startsWith('/') ? '' : '/') + u;
}

export function fmtDate(v, { withTime = true } = {}) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  if (!withTime) return date;
  return `${date}, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
}

export function boolBadge(v) {
  return v ? badge('Yes', { kind: 'success' }) : badge('No', { kind: 'neutral' });
}

export function thumb(url, alt = '') {
  const u = absUrl(url);
  if (!u) return h('span.muted', '—');
  return h('img.thumb', { src: u, alt, loading: 'lazy' });
}

export function truncate(s, n = 60) {
  s = String(s ?? '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// Render a table cell based on a column key + resource field hints.
export function renderCell(row, key) {
  const v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), row);
  if (v === null || v === undefined || v === '') return h('span.muted', '—');

  // Image-ish keys
  if (/(image|cover|logo|icon|avatar)$/i.test(key) && typeof v === 'string') return thumb(v, key);
  // Boolean
  if (typeof v === 'boolean') return boolBadge(v);
  // Dates
  if (/(_at|date|last_login|last_activity|created|updated)/i.test(key) && (typeof v === 'string' || v instanceof Date)) {
    const f = fmtDate(v);
    return f || String(v);
  }
  // Arrays
  if (Array.isArray(v)) return v.length ? truncate(v.join(', '), 50) : h('span.muted', '—');
  // Objects
  if (typeof v === 'object') return truncate(JSON.stringify(v), 50);
  // Role/type as badge
  if (key === 'role' || key === 'type') return badge(String(v), { kind: 'info' });

  return truncate(String(v), 80);
}
