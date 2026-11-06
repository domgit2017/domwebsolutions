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

// Email composer: opens the visitor's own email app or webmail with the message ready to send
const TO = 'domwebservices@gmail.com';
const composeWrap = document.getElementById('compose');
const composeForm = document.getElementById('compose-form');
const composeOpen = document.getElementById('email-link');
const composeClose = document.getElementById('compose-close');

function buildLinks(name, topic, message) {
  const subject = topic + ' enquiry from ' + name;
  const body = 'Hello DomWebSolutions,\r\n\r\n' + message + '\r\n\r\nRegards,\r\n' + name;
  const s = encodeURIComponent(subject);
  const b = encodeURIComponent(body);
  const to = encodeURIComponent(TO);
  return {
    text: 'To: ' + TO + '\r\nSubject: ' + subject + '\r\n\r\n' + body,
    mailto: 'mailto:' + TO + '?subject=' + s + '&body=' + b,
    gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=' + to + '&su=' + s + '&body=' + b,
    outlook: 'https://outlook.live.com/mail/0/deeplink/compose?to=' + to + '&subject=' + s + '&body=' + b,
    yahoo: 'https://compose.mail.yahoo.com/?to=' + to + '&subject=' + s + '&body=' + b,
  };
}

function currentLinks() {
  const name = document.getElementById('c-name').value.trim();
  const message = document.getElementById('c-message').value.trim();
  if (!name || !message) {
    composeForm.reportValidity();
    return null;
  }
  const topic = document.getElementById('c-topic').value;
  return buildLinks(name, topic, message);
}

let resetTimer;

// Back to the default state: empty form, first send option, no message
function resetCompose() {
  composeForm?.reset();
  setStep(0);
  setStatus('');
  if (sendBtn) sendBtn.disabled = false;
}

function setComposeOpen(open) {
  if (!composeWrap) return;
  clearTimeout(resetTimer);
  composeWrap.hidden = !open;
  composeOpen?.setAttribute('aria-expanded', String(open));
  if (!open) resetCompose();
  if (!open) resetCompose();
  if (open) {
    composeWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('c-name')?.focus(), 350);
  }
}

composeOpen?.addEventListener('click', () => setComposeOpen(composeWrap.hidden));
composeClose?.addEventListener('click', () => setComposeOpen(false));

// One button that tries each option in turn until one works
const sendBtn = document.getElementById('compose-send');
const sendLabel = document.getElementById('compose-send-label');
const statusEl = document.getElementById('compose-status');

const STEPS = [
  { key: 'mailto', label: 'Send', done: 'Your email app should now show the message, ready to send.' },
  { key: 'gmail', label: 'Send', done: 'Gmail opened in a new tab with your message ready to send.' },
  { key: 'outlook', label: 'Send', done: 'Outlook opened in a new tab with your message ready to send.' },
  { key: 'yahoo', label: 'Send', done: 'Yahoo Mail opened in a new tab with your message ready to send.' },
  { key: 'copy', label: 'Copy message', done: 'Message copied. Paste it into a new email to ' + TO + '.' },
];
let stepIdx = 0;

function setStep(i) {
  stepIdx = i;
  sendLabel.textContent = STEPS[i].label;
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

// Opens the default mail app. Browsers give no direct signal, so if the page
// is not hidden or blurred within 2 seconds we treat it as not opened.
function tryMailApp(url) {
  return new Promise((resolve) => {
    let left = false;
    const onLeave = () => { left = true; };
    const cleanup = () => {
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('pagehide', onLeave);
      document.removeEventListener('visibilitychange', onLeave);
    };
    window.addEventListener('blur', onLeave);
    window.addEventListener('pagehide', onLeave);
    document.addEventListener('visibilitychange', onLeave);
    window.location.href = url;
    setTimeout(() => { cleanup(); resolve(left); }, 2000);
  });
}

function copyText(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(area);
  return ok;
}

async function launch(links) {
  const key = STEPS[stepIdx].key;
  if (key === 'mailto') return tryMailApp(links.mailto);
  if (key === 'copy') {
    try { await navigator.clipboard.writeText(links.text); return true; }
    catch (e) { return copyText(links.text); }
  }
  const win = window.open(links[key], '_blank');
  if (win) { win.opener = null; return true; }
  return false;
}

const thanksEl = document.getElementById('compose-thanks');
const THANKS_MS = 3000;
let thanksTimer;

// Back to the state it had before "Email us" was clicked
function resetCompose() {
  clearTimeout(thanksTimer);
  composeForm?.reset();
  if (composeForm) composeForm.hidden = false;
  if (thanksEl) thanksEl.hidden = true;
  setStep(0);
  setStatus('');
  if (sendBtn) sendBtn.disabled = false;
}

function showThanks() {
  setStatus('');
  composeForm.hidden = true;
  thanksEl.hidden = false;
  clearTimeout(thanksTimer);
  thanksTimer = setTimeout(() => setComposeOpen(false), THANKS_MS);
}

async function runCompose() {
  const links = currentLinks();
  if (!links) return;

  sendBtn.disabled = true;
  setStatus('Opening…');

  const ok = await launch(links);

  if (ok) {
    showThanks();
  } else if (stepIdx < STEPS.length - 1) {
    // Did not open: the same button now offers the next option
    setStep(stepIdx + 1);
    setStatus('Press Send once more to open your email.');
  } else {
    setStatus('Please copy our address: ' + TO);
  }
  sendBtn.disabled = false;
}

composeForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  runCompose();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeMobileMenu();
  if (composeWrap && !composeWrap.hidden) setComposeOpen(false);
});
