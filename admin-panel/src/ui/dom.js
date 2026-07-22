// Tiny hyperscript helper. h('div.card', {onclick}, [children]) -> HTMLElement.
export function h(tag, props = null, children = null) {
  // Allow h(tag, children) shorthand
  if (Array.isArray(props) || typeof props === 'string' || props instanceof Node) {
    children = props;
    props = null;
  }

  let tagName = 'div';
  const classes = [];
  let id = null;
  // Parse "tag.class1.class2#id"
  const m = /^([a-zA-Z0-9]+)?((?:\.[^.#]+)*)?(?:#([^.]+))?$/.exec(tag);
  if (m) {
    tagName = m[1] || 'div';
    if (m[2]) classes.push(...m[2].split('.').filter(Boolean));
    if (m[3]) id = m[3];
  } else {
    tagName = tag;
  }

  const el = document.createElement(tagName);
  if (id) el.id = id;
  if (classes.length) el.classList.add(...classes);

  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (val === null || val === undefined || val === false) continue;
      if (key === 'class' || key === 'className') {
        String(val).split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
      } else if (key === 'dataset') {
        Object.assign(el.dataset, val);
      } else if (key === 'style' && typeof val === 'object') {
        Object.assign(el.style, val);
      } else if (key.startsWith('on') && typeof val === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (key === 'html') {
        el.innerHTML = val;
      } else if (key in el && key !== 'list' && key !== 'type') {
        try {
          el[key] = val;
        } catch (e) {
          el.setAttribute(key, val);
        }
      } else {
        el.setAttribute(key, val === true ? '' : val);
      }
    }
  }

  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  if (children === null || children === undefined || children === false) return;
  if (Array.isArray(children)) {
    children.forEach((c) => appendChildren(el, c));
  } else if (children instanceof Node) {
    el.appendChild(children);
  } else {
    el.appendChild(document.createTextNode(String(children)));
  }
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function mount(el, node) {
  clear(el);
  appendChildren(el, node);
  return el;
}
