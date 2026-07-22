// Login view.
import { h, mount } from '../ui/dom.js';
import { field, input, button } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/toast.js';
import { login, isAdmin } from '../auth/auth.js';
import { APP_NAME } from '../config.js';

export function renderLogin(appEl, { router }) {
  let submitting = false;
  const form = h('form.login__form', { novalidate: true });

  const emailInput = input({ type: 'email', placeholder: 'you@example.com', autocomplete: 'username', autofocus: true });
  const passInput = input({ type: 'password', placeholder: '••••••••', autocomplete: 'current-password' });
  const emailField = field({ label: 'Email', input: emailInput, required: true });
  const passField = field({ label: 'Password', input: passInput, required: true });
  const submitBtn = button('Sign in', { type: 'submit', full: true });
  const errorBox = h('div.login__error', { role: 'alert', hidden: true });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting) return;
    errorBox.hidden = true;

    const email = emailInput.value.trim();
    const password = passInput.value;
    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    submitting = true;
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!isAdmin()) {
        // Authenticated but not an admin — refuse entry to the panel.
        const { logout } = await import('../auth/auth.js');
        logout();
        showError('This account does not have admin access.');
        return;
      }
      toast.success(`Welcome, ${user?.display_name || user?.email || 'admin'}`);
      const next = new URLSearchParams(location.search).get('next') || '/';
      router.navigate(next.startsWith('/') ? next : '/');
    } catch (err) {
      showError(err?.message || 'Sign in failed.');
    } finally {
      submitting = false;
      setLoading(false);
    }
  });

  function setLoading(v) {
    submitBtn.disabled = v;
    submitBtn.classList.toggle('btn--loading', v);
  }
  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  form.append(emailField, passField, errorBox, submitBtn);

  const card = h('div.login__card', [
    h('div.login__brand', [h('span.login__logo', '🎮'), h('span.login__brandname', APP_NAME)]),
    h('h1.login__title', 'Sign in'),
    h('p.login__sub', 'Admin access only.'),
    form,
  ]);

  mount(appEl, h('div.login', h('div.login__inner', card)));
  appEl.setAttribute('aria-busy', 'false');
}
