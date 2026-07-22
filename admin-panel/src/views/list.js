// Generic resource LIST view: table, search, filters, client-side sort of the
// current page, server pagination, row selection + bulk delete, "New" button.
import { h, mount, clear } from '../ui/dom.js';
import { breadcrumb, button, table, pagination, skeletonTable, emptyState, input, select, badge } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { renderCell } from '../ui/format.js';
import { toast } from '../ui/toast.js';
import { confirmDialog } from '../ui/dialog.js';
import { listResource, bulkDeleteResource, deleteResource } from '../data/api.js';
import { prettyLabel, rowId } from './shared.js';
import { openRecordDialog } from './detail-dialog.js';

export function renderList(outletEl, resource, { router }) {
  const state = {
    page: 1,
    pageSize: 10,
    search: '',
    filters: {},
    sort: null,
    loading: true,
    data: { items: [], count: 0, pageCount: null, hasNext: false, hasPrev: false },
    selected: new Set(),
  };
  let reqToken = 0;

  const root = h('div.page');
  mount(outletEl, root);

  const canCreate = resource.capabilities?.create;
  const canDelete = resource.capabilities?.delete;
  const supportsSearch = !!resource.listParams?.search;
  const filterDefs = resource.listParams?.filters || [];

  async function load() {
    const my = ++reqToken;
    state.loading = true;
    render();
    try {
      const data = await listResource(resource, {
        page: state.page,
        pageSize: state.pageSize,
        search: state.search || null,
        filters: state.filters,
      });
      if (my !== reqToken) return; // stale
      state.data = data;
      state.selected.clear();
    } catch (e) {
      if (my !== reqToken) return;
      state.data = { items: [], count: 0, pageCount: null, hasNext: false, hasPrev: false, error: e };
    } finally {
      if (my === reqToken) {
        state.loading = false;
        render();
      }
    }
  }

  function applySort(items) {
    if (!state.sort) return items;
    const { key, dir } = state.sort;
    const sorted = [...items].sort((a, b) => {
      const av = key.split('.').reduce((o, k) => (o == null ? o : o[k]), a);
      const bv = key.split('.').reduce((o, k) => (o == null ? o : o[k]), b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv), undefined, { numeric: true });
    });
    return dir === 'desc' ? sorted.reverse() : sorted;
  }

  function toolbar() {
    const left = [];
    if (supportsSearch) {
      const box = input({ type: 'search', placeholder: `Search ${resource.label.toLowerCase()}…`, value: state.search });
      let t;
      box.addEventListener('input', (e) => {
        clearTimeout(t);
        const v = e.target.value;
        t = setTimeout(() => {
          state.search = v;
          state.page = 1;
          load();
        }, 350);
      });
      left.push(h('div.toolbar__search', [h('span.toolbar__searchicon', icon('grid', { size: 16 })), box]));
    }
    filterDefs.forEach((fd) => {
      const opts = fd.choices ? fd.choices.map((c) => ({ value: c, label: c })) : [];
      const sel = select({ value: state.filters[fd.key] || '', placeholder: fd.label, options: opts, onchange: (e) => { state.filters[fd.key] = e.target.value; state.page = 1; load(); } });
      left.push(sel);
    });

    const right = [];
    if (canDelete && state.selected.size > 0) {
      right.push(button(`Delete ${state.selected.size}`, { kind: 'danger', size: 'sm', iconName: 'x', onClick: onBulkDelete }));
    }
    if (canCreate) {
      right.push(button('New', { kind: 'primary', size: 'sm', iconName: 'check', onClick: () => router.navigate(`/r/${resource.key}/new`) }));
    }

    return h('div.toolbar', [h('div.toolbar__left', left), h('div.toolbar__right', right)]);
  }

  async function onBulkDelete() {
    const ids = [...state.selected];
    const ok = await confirmDialog({ title: `Delete ${ids.length} ${resource.label}?`, message: 'This action cannot be undone.', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      const res = await bulkDeleteResource(resource, ids);
      if (res && res.failed && res.failed.length) {
        toast.error(`${res.ok} deleted, ${res.failed.length} failed.`);
      } else {
        toast.success(`Deleted ${ids.length} ${resource.label.toLowerCase()}.`);
      }
      load();
    } catch (e) {
      toast.error(e.message || 'Bulk delete failed.');
    }
  }

  async function onRowDelete(row) {
    const label = rowId(resource, row);
    const ok = await confirmDialog({ title: `Delete this ${singular(resource.label)}?`, message: `“${displayName(row)}” will be permanently removed.`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await deleteResource(resource, label);
      toast.success('Deleted.');
      load();
    } catch (e) {
      toast.error(e.message || 'Delete failed.');
    }
  }

  function buildColumns() {
    const cols = (resource.columns || Object.keys(state.data.items[0] || {})).map((key) => ({
      key,
      label: prettyLabel(key),
      sortable: true,
      render: (row) => renderCell(row, key),
    }));
    // actions column
    const canEdit = resource.capabilities?.update || resource.capabilities?.retrieve;
    cols.push({
      key: '__actions',
      label: '',
      align: 'end',
      sortable: false,
      render: (row) =>
        h('div.rowactions', [
          resource.rowDetail ? button('View', { kind: 'ghost', size: 'sm', onClick: (e) => { e.stopPropagation(); openRecordDialog(resource, row); } }) : null,
          canEdit ? button('Edit', { kind: 'ghost', size: 'sm', onClick: (e) => { e.stopPropagation(); router.navigate(`/r/${resource.key}/${encodeURIComponent(rowId(resource, row))}`); } }) : null,
          canDelete ? button('', { kind: 'ghost', size: 'sm', iconName: 'x', ariaLabel: 'Delete', onClick: (e) => { e.stopPropagation(); onRowDelete(row); } }) : null,
        ]),
    });
    return cols;
  }

  function render() {
    clear(root);
    root.append(
      breadcrumb([{ label: 'Overview', href: '/' }, { label: resource.label }]),
      h('div.page__head', [
        h('div', [h('h1.page__title', resource.label), resource.note ? h('p.page__sub', resource.note) : null]),
      ]),
      toolbar()
    );

    if (state.loading) {
      root.appendChild(h('div.table-wrap', skeletonTable(state.pageSize, (resource.columns?.length || 4) + 1)));
      return;
    }
    if (state.data.error) {
      root.appendChild(errorPanel(state.data.error, load));
      return;
    }
    if (!state.data.items.length) {
      root.appendChild(
        emptyState({
          title: `No ${resource.label.toLowerCase()} yet`,
          message: state.search || Object.keys(state.filters).length ? 'No results match your filters.' : 'Get started by creating one.',
          iconName: resource.icon || 'inbox',
          action: canCreate ? button('New ' + singular(resource.label), { kind: 'primary', onClick: () => router.navigate(`/r/${resource.key}/new`) }) : null,
        })
      );
      return;
    }

    const canEdit = resource.capabilities?.update || resource.capabilities?.retrieve;
    root.appendChild(
      table({
        columns: buildColumns(),
        rows: applySort(state.data.items),
        sort: state.sort,
        onSort: (key) => {
          if (state.sort && state.sort.key === key) state.sort = { key, dir: state.sort.dir === 'asc' ? 'desc' : 'asc' };
          else state.sort = { key, dir: 'asc' };
          render();
        },
        rowKey: (r) => rowId(resource, r),
        selectable: !!canDelete,
        selected: state.selected,
        onToggle: (key, on) => { on ? state.selected.add(key) : state.selected.delete(key); render(); },
        onToggleAll: (on) => { state.selected = on ? new Set(state.data.items.map((r) => rowId(resource, r))) : new Set(); render(); },
        onRowClick: canEdit
          ? (row) => router.navigate(`/r/${resource.key}/${encodeURIComponent(rowId(resource, row))}`)
          : resource.rowDetail
          ? (row) => openRecordDialog(resource, row)
          : null,
      })
    );

    root.appendChild(
      pagination({
        page: state.page,
        pageCount: state.data.pageCount,
        count: state.data.count,
        hasNext: state.data.hasNext,
        hasPrev: state.data.hasPrev || state.page > 1,
        pageSize: state.pageSize,
        onPage: (p) => { state.page = p; load(); },
        onPageSize: (n) => { state.pageSize = n; state.page = 1; load(); },
      })
    );
  }

  load();
}

function singular(label) {
  return label.replace(/s$/, '');
}
function displayName(row) {
  return row.title || row.display_name || row.username || row.email || row.name || `#${row.id}`;
}
function errorPanel(error, retry) {
  const is403 = error && error.status === 403;
  return emptyState({
    title: is403 ? 'Access denied' : 'Could not load',
    message: is403 ? 'Your account lacks the required permission for this resource.' : error?.message || 'Something went wrong.',
    iconName: is403 ? 'lock' : 'alert',
    action: is403 ? null : button('Retry', { kind: 'primary', onClick: retry }),
  });
}
