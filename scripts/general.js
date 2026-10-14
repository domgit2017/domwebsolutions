const html = document.documentElement;

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('use');

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');
const menuIcon = mobileMenuBtn?.querySelector('use');

// Icons are inline SVG symbols (see the sprite at the top of index.html)
function setIcon(useEl, name) {
  useEl?.setAttribute('href', '#i-' + name);
}

function iconMarkup(name, extra = '') {
  return `<svg class="icon ${extra}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

const emailLinks = document.querySelectorAll('#email-link');

const emailFormWrapper = document.getElementById('email-form-wrapper');
const emailForm = document.getElementById('email-form');
const closeEmailForm = document.getElementById('close-email-form');
const emailSuccess = document.getElementById('email-success');

const submitButton = document.getElementById('email-submit');
const senderEmail = document.getElementById('sender-email');
const replyTo = document.getElementById('reply-to');

const emailError = document.getElementById('email-error');

let isSending = false;
let successTimer;

// Theme
const savedTheme = localStorage.getItem('theme');

// Dark mode
const initialTheme = savedTheme || 'dark';

function updateThemeIcon(theme) {
  if (!themeIcon || !themeToggle) return;

  if (theme === 'dark') {
    // Dark mode is active
    setIcon(themeIcon, 'sun');

    themeToggle.setAttribute('aria-label', 'Switch to light mode');

    themeToggle.setAttribute('title', 'Switch to light mode');
  } else {
    // Light mode is active
    setIcon(themeIcon, 'moon');

    themeToggle.setAttribute('aria-label', 'Switch to dark mode');

    themeToggle.setAttribute('title', 'Switch to dark mode');
  }
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);

  // User's preference
  localStorage.setItem('theme', theme);

  updateThemeIcon(theme);
}

// Apply saved / default theme
setTheme(initialTheme);

// Theme toggle
themeToggle?.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme') || 'dark';

  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  setTheme(newTheme);
});

// Mobile menu

function closeMobileMenu() {
  if (!navMenu) return;

  navMenu.classList.remove('active');

  setIcon(menuIcon, 'bars');

  mobileMenuBtn?.setAttribute('aria-expanded', 'false');
}

mobileMenuBtn?.setAttribute('aria-expanded', 'false');

mobileMenuBtn?.addEventListener('click', (event) => {
  event.stopPropagation();

  if (!navMenu) return;

  const isOpen = navMenu.classList.toggle('active');

  setIcon(menuIcon, isOpen ? 'xmark' : 'bars');

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

// Email form
function hideEmailError() {
  if (emailError) emailError.hidden = true;
}

function openEmailForm() {
  if (!emailFormWrapper) return;

  clearTimeout(successTimer);

  emailFormWrapper.hidden = false;

  if (emailForm) emailForm.hidden = false;
  if (emailSuccess) emailSuccess.hidden = true;
  hideEmailError();

  setTimeout(() => {
    emailFormWrapper.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 50);

  setTimeout(() => {
    emailForm?.querySelector('input[name="name"]')?.focus();
  }, 350);
}

function closeEmailFormPanel() {
  if (!emailFormWrapper) return;

  clearTimeout(successTimer);

  emailFormWrapper.hidden = true;

  emailForm?.reset();

  if (emailForm) emailForm.hidden = false;
  if (emailSuccess) emailSuccess.hidden = true;
  hideEmailError();

  setSending(false);
}

emailLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    openEmailForm();
  });
});

closeEmailForm?.addEventListener('click', closeEmailFormPanel);

// Send button
function setSending(sending) {
  isSending = sending;

  if (!submitButton) return;

  submitButton.disabled = sending;

  submitButton.innerHTML = sending
    ? iconMarkup('spinner', 'spin') + ' Sending...'
    : iconMarkup('paper-plane') + ' Send Message';
}

// Form submission (FormSubmit AJAX endpoint, so we know if it really worked)
function showEmailSuccess() {
  emailForm?.reset();

  if (emailForm) emailForm.hidden = true;
  if (emailSuccess) {
    emailSuccess.hidden = false;
    emailSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Clear the thank-you message (and close the panel) after 2 seconds
  clearTimeout(successTimer);
  successTimer = setTimeout(closeEmailFormPanel, 2000);
}

emailForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (isSending) return;

  if (!emailForm.checkValidity()) {
    emailForm.reportValidity();
    return;
  }

  if (senderEmail && replyTo) {
    replyTo.value = senderEmail.value.trim();
  }

  hideEmailError();
  setSending(true);

  const endpoint = emailForm.action.replace(
    'formsubmit.co/',
    'formsubmit.co/ajax/',
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(emailForm),
      signal: controller.signal,
    });

    const result = await response.json().catch(() => ({}));

    if (
      !response.ok ||
      result.success === false ||
      result.success === 'false'
    ) {
      throw new Error(result.message || 'Message could not be sent');
    }

    showEmailSuccess();
  } catch (error) {
    console.error('Email form error:', error);

    if (emailError) emailError.hidden = false;
  } finally {
    clearTimeout(timeout);
    setSending(false);
  }
});

// Escape key
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (emailFormWrapper && !emailFormWrapper.hidden) {
    closeEmailFormPanel();
  }

  closeMobileMenu();
});

// Padlock / "secure" notes: only shown when the page is really served over HTTPS
if (location.protocol === 'https:') {
  document.querySelectorAll('[data-https-only]').forEach((el) => {
    el.hidden = false;
  });
}
