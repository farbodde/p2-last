// Error / edge-case views.
import { h, mount } from '../ui/dom.js';
import { emptyState, button, breadcrumb } from '../ui/components.js';

export function renderForbidden(outletEl, { router } = {}) {
  mount(
    outletEl,
    h('div.page', [
      breadcrumb([{ label: 'Overview', href: '/' }, { label: 'Access denied' }]),
      emptyState({
        title: 'Access denied',
        message: 'Your account is missing the permission required for this section (Group "admin" or is_staff).',
        iconName: 'lock',
        action: button('Back to overview', { kind: 'primary', onClick: () => router && router.navigate('/') }),
      }),
    ])
  );
}

export function renderNotFound(outletEl, { router } = {}) {
  mount(
    outletEl,
    h('div.page', [
      emptyState({
        title: 'Page not found',
        message: "The page you're looking for doesn't exist.",
        iconName: 'alert',
        action: button('Back to overview', { kind: 'primary', onClick: () => router && router.navigate('/') }),
      }),
    ])
  );
}
