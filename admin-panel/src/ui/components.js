// Base reusable UI components. All keyboard-accessible; ARIA where relevant.
import { h } from './dom.js';
import { icon } from './icons.js';

let uid = 0;
const nextId = (p = 'f') => `${p}-${++uid}`;

// ---- Button ----------------------------------------------------------------
export function button(label, { kind = 'primary', size = 'md', onClick, type = 'button', disabled = false, iconName = null, loading = false, full = false, ariaLabel = null } = {}) {
  const btn = h(
    'button.btn',
    {
      class: `btn--${kind} btn--${size}${full ? ' btn--full' : ''}${loading ? ' btn--loading' : ''}`,
      type,
      disabled: disabled || loading,
      onclick: onClick,
      'aria-label': ariaLabel || undefined,
    },
    [
      loading ? h('span.btn__spinner', { 'aria-hidden': 'true' }) : iconName ? h('span.btn__icon', icon(iconName, { size: 16 })) : null,
      label ? h('span', label) : null,
    ]
  );
  return btn;
}

// ---- Field wrapper ---------------------------------------------------------
export function field({ label, input, hint = null, error = null, required = false, id = null }) {
  const fid = id || (input && input.id) || nextId();
  if (input && !input.id) input.id = fid;
  return h('div.field', { class: error ? 'field--error' : '' }, [
    label ? h('label.field__label', { for: fid }, [label, required ? h('span.field__req', { 'aria-hidden': 'true' }, ' *') : null]) : null,
    input,
    error ? h('div.field__error', { role: 'alert' }, error) : hint ? h('div.field__hint', hint) : null,
  ]);
}

// ---- Inputs ----------------------------------------------------------------
export function input({ type = 'text', value = '', placeholder = '', name = null, disabled = false, oninput = null, onchange = null, autofocus = false, min = null, max = null, step = null, autocomplete = null } = {}) {
  return h('input.input', {
    type,
    value: value ?? '',
    placeholder,
    name,
    disabled,
    autofocus,
    min,
    max,
    step,
    autocomplete,
    oninput,
    onchange,
  });
}

export function textarea({ value = '', placeholder = '', name = null, rows = 4, disabled = false, oninput = null } = {}) {
  return h('textarea.input.textarea', { placeholder, name, rows, disabled, oninput }, value ?? '');
}

export function select({ options = [], value = '', name = null, disabled = false, onchange = null, placeholder = null } = {}) {
  const sel = h('select.input.select', { name, disabled, onchange });
  if (placeholder !== null) sel.appendChild(h('option', { value: '' }, placeholder));
  options.forEach((o) => {
    const opt = typeof o === 'object' ? o : { value: o, label: o };
    const optionEl = h('option', { value: opt.value }, opt.label ?? String(opt.value));
    if (String(opt.value) === String(value)) optionEl.selected = true;
    sel.appendChild(optionEl);
  });
  return sel;
}

export function checkbox({ checked = false, name = null, onchange = null, label = null, disabled = false } = {}) {
  const box = h('input.checkbox', { type: 'checkbox', name, checked, disabled, onchange });
  if (!label) return box;
  return h('label.checkbox-wrap', [box, h('span', label)]);
}

// ---- Badge -----------------------------------------------------------------
export function badge(text, { kind = 'neutral' } = {}) {
  return h('span.badge', { class: `badge--${kind}` }, text);
}

// ---- Skeleton --------------------------------------------------------------
export function skeleton({ width = '100%', height = '1rem', radius = '6px' } = {}) {
  return h('span.skeleton', { style: { width, height, borderRadius: radius } });
}

export function skeletonTable(rows = 6, cols = 4) {
  const body = [];
  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < cols; c++) cells.push(h('td', skeleton({ width: c === 0 ? '40%' : '70%' })));
    body.push(h('tr', cells));
  }
  return h('table.table.table--skeleton', h('tbody', body));
}

// ---- Spinner ---------------------------------------------------------------
export function spinner({ size = 20 } = {}) {
  return h('span.spinner', { style: { width: `${size}px`, height: `${size}px` }, role: 'status', 'aria-label': 'Loading' });
}

// ---- Empty state -----------------------------------------------------------
export function emptyState({ title = 'Nothing here', message = '', iconName = 'inbox', action = null } = {}) {
  return h('div.empty', [
    h('div.empty__icon', icon(iconName, { size: 40 })),
    h('h3.empty__title', title),
    message ? h('p.empty__msg', message) : null,
    action || null,
  ]);
}

// ---- Breadcrumb ------------------------------------------------------------
export function breadcrumb(items = []) {
  const nodes = [];
  items.forEach((it, i) => {
    if (i > 0) nodes.push(h('span.crumb__sep', { 'aria-hidden': 'true' }, '/'));
    if (it.href && i < items.length - 1) {
      nodes.push(h('a.crumb__link', { href: it.href, 'data-link': '' }, it.label));
    } else {
      nodes.push(h('span.crumb__current', { 'aria-current': 'page' }, it.label));
    }
  });
  return h('nav.crumbs', { 'aria-label': 'Breadcrumb' }, nodes);
}

// ---- Table -----------------------------------------------------------------
/**
 * table({ columns:[{key,label,render?,sortable?,align?}], rows, sort:{key,dir},
 *         onSort, rowKey, selectable, selected:Set, onToggle, onToggleAll,
 *         onRowClick })
 */
export function table({ columns = [], rows = [], sort = null, onSort = null, rowKey = (r) => r.id, selectable = false, selected = new Set(), onToggle = null, onToggleAll = null, onRowClick = null } = {}) {
  const allSelected = selectable && rows.length > 0 && rows.every((r) => selected.has(rowKey(r)));

  const headCells = [];
  if (selectable) {
    headCells.push(
      h('th.table__check', checkbox({ checked: allSelected, onchange: (e) => onToggleAll && onToggleAll(e.target.checked), label: null }))
    );
  }
  columns.forEach((col) => {
    const sortable = col.sortable && onSort;
    const active = sort && sort.key === col.key;
    const th = h(
      'th',
      {
        class: `${col.align ? 'ta-' + col.align : ''} ${sortable ? 'th--sortable' : ''}`.trim(),
        onclick: sortable ? () => onSort(col.key) : null,
        'aria-sort': active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined,
        tabindex: sortable ? '0' : undefined,
        onkeydown: sortable ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSort(col.key)) : null,
      },
      [col.label, sortable ? h('span.th__sort', { class: active ? `is-${sort.dir}` : '' }, active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕') : null]
    );
    headCells.push(th);
  });

  const bodyRows = rows.map((row) => {
    const key = rowKey(row);
    const cells = [];
    if (selectable) {
      cells.push(
        h('td.table__check', checkbox({ checked: selected.has(key), onchange: (e) => { e.stopPropagation(); onToggle && onToggle(key, e.target.checked); } }))
      );
    }
    columns.forEach((col) => {
      const content = col.render ? col.render(row) : valueOf(row, col.key);
      cells.push(h('td', { class: col.align ? 'ta-' + col.align : '' }, content instanceof Node || Array.isArray(content) ? content : content == null || content === '' ? h('span.muted', '—') : String(content)));
    });
    return h('tr', { class: onRowClick ? 'tr--click' : '', onclick: onRowClick ? () => onRowClick(row) : null }, cells);
  });

  return h('div.table-wrap', h('table.table', [h('thead', h('tr', headCells)), h('tbody', bodyRows)]));
}

function valueOf(row, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), row);
}

// ---- Pagination ------------------------------------------------------------
export function pagination({ page = 1, pageCount = null, count = null, hasNext = false, hasPrev = false, onPage = null, pageSize = null, onPageSize = null } = {}) {
  const info = count != null
    ? `${count.toLocaleString()} item${count === 1 ? '' : 's'}${pageCount ? ` · Page ${page} of ${pageCount}` : ''}`
    : `Page ${page}`;

  const controls = [
    button('Prev', { kind: 'ghost', size: 'sm', disabled: !(hasPrev || page > 1), onClick: () => onPage && onPage(page - 1) }),
    pageCount ? h('span.pager__pages', numberedPages(page, pageCount, onPage)) : null,
    button('Next', { kind: 'ghost', size: 'sm', disabled: !hasNext, onClick: () => onPage && onPage(page + 1) }),
  ];

  return h('div.pager', [
    h('div.pager__info', info),
    h('div.pager__controls', [
      onPageSize ? select({ value: String(pageSize || 10), options: [10, 20, 50, 100].map((n) => ({ value: n, label: `${n} / page` })), onchange: (e) => onPageSize(Number(e.target.value)) }) : null,
      ...controls,
    ]),
  ]);
}

function numberedPages(page, pageCount, onPage) {
  const nodes = [];
  const window = 1;
  const pages = new Set([1, pageCount, page, page - window, page + window]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  let prev = 0;
  sorted.forEach((p) => {
    if (p - prev > 1) nodes.push(h('span.pager__gap', '…'));
    nodes.push(
      h('button.pager__num', { class: p === page ? 'is-active' : '', type: 'button', 'aria-current': p === page ? 'page' : undefined, onclick: () => onPage && onPage(p) }, String(p))
    );
    prev = p;
  });
  return nodes;
}
