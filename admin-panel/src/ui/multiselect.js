// Searchable multi-select (for M2M relations like game platforms).
// Returns { el, getValue, setValue }. Values are the option `value`s (ids).
import { h, clear } from './dom.js';
import { icon } from './icons.js';

export function multiSelect({ options = [], value = [], placeholder = 'Select…', emptyText = 'No options' } = {}) {
  let selected = new Set(value.map(String));

  const search = h('input.input.ms__search', { type: 'text', placeholder });
  const list = h('div.ms__list', { role: 'listbox', 'aria-multiselectable': 'true' });
  const chips = h('div.ms__chips');

  function renderChips() {
    clear(chips);
    if (!selected.size) {
      chips.appendChild(h('span.muted', 'None selected'));
      return;
    }
    options
      .filter((o) => selected.has(String(o.value)))
      .forEach((o) => {
        chips.appendChild(
          h('span.chip', [
            h('span', o.label),
            h('button.chip__x', { type: 'button', 'aria-label': `Remove ${o.label}`, onclick: () => toggle(o.value, false) }, icon('x', { size: 12 })),
          ])
        );
      });
  }

  function renderList() {
    clear(list);
    const q = search.value.trim().toLowerCase();
    const filtered = options.filter((o) => !q || o.label.toLowerCase().includes(q));
    if (!filtered.length) {
      list.appendChild(h('div.ms__empty', emptyText));
      return;
    }
    filtered.forEach((o) => {
      const isSel = selected.has(String(o.value));
      const row = h(
        'div.ms__opt',
        { role: 'option', 'aria-selected': String(isSel), class: isSel ? 'is-sel' : '', tabindex: '0', onclick: () => toggle(o.value, !isSel), onkeydown: (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(o.value, !isSel)) },
        [h('span.ms__check', isSel ? icon('check', { size: 14 }) : ''), h('span', o.label)]
      );
      list.appendChild(row);
    });
  }

  function toggle(val, on) {
    const k = String(val);
    if (on) selected.add(k);
    else selected.delete(k);
    renderChips();
    renderList();
  }

  search.addEventListener('input', renderList);
  renderChips();
  renderList();

  const el = h('div.ms', [chips, search, list]);

  return {
    el,
    getValue: () => options.filter((o) => selected.has(String(o.value))).map((o) => o.value),
    setValue: (vals) => {
      selected = new Set((vals || []).map(String));
      renderChips();
      renderList();
    },
  };
}
