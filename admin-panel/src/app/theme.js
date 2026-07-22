// Theme controller: light/dark with system default + persistence.
import { STORAGE } from '../config.js';

export function getTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return prefersDark() ? 'dark' : 'light';
}

export function isExplicit() {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark';
}

export function setTheme(theme) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.removeItem(STORAGE.theme);
    } catch (e) {}
  } else {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE.theme, theme);
    } catch (e) {}
  }
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  return getTheme();
}

function prefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
