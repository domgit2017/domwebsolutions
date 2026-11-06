const html = document.documentElement;

// Theme
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {}
  if (!themeIcon || !themeToggle) return;
  const dark = theme === 'dark';
  themeIcon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
}

let savedTheme = 'light';
try {
  savedTheme = localStorage.getItem('theme') || 'light';
} catch (e) {}
setTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
  setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Mobile menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');
const menuIcon = mobileMenuBtn?.querySelector('i');

function closeMobileMenu() {
  if (!navMenu) return;
  navMenu.classList.remove('active');
  if (menuIcon) menuIcon.className = 'fa-solid fa-bars';
  mobileMenuBtn?.setAttribute('aria-expanded', 'false');
}

mobileMenuBtn?.setAttribute('aria-expanded', 'false');

mobileMenuBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!navMenu) return;
  const isOpen = navMenu.classList.toggle('active');
  if (menuIcon) menuIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

document.addEventListener('click', (event) => {
  if (!navMenu || !mobileMenuBtn) return;
  if (
    navMenu.classList.contains('active') &&
    !navMenu.contains(event.target) &&
    !mobileMenuBtn.contains(event.target)
  ) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileMenu();
});

// Copy email address (fallback when no email app is set up)
const copyBtn = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
let copyTimer;

function showCopyStatus(text) {
  if (!copyStatus) return;
  copyStatus.textContent = text;
  copyStatus.hidden = false;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copyStatus.hidden = true;
  }, 3000);
}

function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {}
  document.body.removeChild(area);
  return ok;
}

copyBtn?.addEventListener('click', async () => {
  const email = copyBtn.dataset.email;
  let ok = false;
  try {
    await navigator.clipboard.writeText(email);
    ok = true;
  } catch (e) {
    ok = legacyCopy(email);
  }
  showCopyStatus(ok ? 'Email address copied: ' + email : 'Please copy it manually: ' + email);
});
