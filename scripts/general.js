const html = document.documentElement;

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('i');

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navMenu = document.getElementById('nav-menu');
const menuIcon = mobileMenuBtn?.querySelector('i');

const emailLinks = document.querySelectorAll('#email-link, #footer-email-link');

const emailFormWrapper = document.getElementById('email-form-wrapper');
const emailForm = document.getElementById('email-form');
const closeEmailForm = document.getElementById('close-email-form');
const emailSuccess = document.getElementById('email-success');

const submitButton = document.getElementById('email-submit');
const senderEmail = document.getElementById('sender-email');
const replyTo = document.getElementById('reply-to');



// Theme
const savedTheme = localStorage.getItem('theme');

// Dark mode
const initialTheme = savedTheme || 'light';

function updateThemeIcon(theme) {
  if (!themeIcon || !themeToggle) return;

  if (theme === 'dark') {
    // Dark mode is active
    themeIcon.className = 'fa-solid fa-sun';

    themeToggle.setAttribute('aria-label', 'Switch to light mode');

    themeToggle.setAttribute('title', 'Switch to light mode');
  } else {
    // Light mode is active
    themeIcon.className = 'fa-solid fa-moon';

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
  const currentTheme = html.getAttribute('data-theme') || 'light';

  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  setTheme(newTheme);
});

// Mobile menu

function closeMobileMenu() {
  if (!navMenu) return;

  navMenu.classList.remove('active');

  if (menuIcon) {
    menuIcon.className = 'fa-solid fa-bars';
  }

  mobileMenuBtn?.setAttribute('aria-expanded', 'false');
}

mobileMenuBtn?.setAttribute('aria-expanded', 'false');

mobileMenuBtn?.addEventListener('click', (event) => {
  event.stopPropagation();

  if (!navMenu) return;

  const isOpen = navMenu.classList.toggle('active');

  if (menuIcon) {
    menuIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  }

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
const THANK_YOU_MS = 3000;
const emailError = document.getElementById('email-error');
let thankYouTimer;

function resetSubmitButton() {
  if (!submitButton) return;
  submitButton.disabled = false;
  submitButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send message';
}

function openEmailForm() {
  if (!emailFormWrapper) return;
  clearTimeout(thankYouTimer);
  emailFormWrapper.hidden = false;
  if (emailSuccess) emailSuccess.hidden = true;
  if (emailError) emailError.hidden = true;
  setTimeout(() => {
    emailFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
  setTimeout(() => {
    emailForm?.querySelector('input[name="name"]')?.focus();
  }, 350);
}

function closeEmailFormPanel() {
  if (!emailFormWrapper) return;
  emailFormWrapper.hidden = true;
  emailForm?.reset();
  if (emailSuccess) emailSuccess.hidden = true;
  if (emailError) emailError.hidden = true;
  resetSubmitButton();
}

emailLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    openEmailForm();
  });
});

closeEmailForm?.addEventListener('click', closeEmailFormPanel);

function showThankYou() {
  emailFormWrapper.hidden = true;
  emailForm.reset();
  resetSubmitButton();
  emailSuccess.hidden = false;
  emailSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

  clearTimeout(thankYouTimer);
  thankYouTimer = setTimeout(() => {
    emailSuccess.hidden = true;
  }, THANK_YOU_MS);
}

const formSubmitFrame = document.getElementById('formsubmit-frame');
let formWasSubmitted = false;
let failTimer;

emailForm?.addEventListener('submit', (event) => {
  if (!emailForm.checkValidity()) {
    event.preventDefault();
    emailForm.reportValidity();
    return;
  }

  // Let the browser post the form into the hidden iframe
  if (senderEmail && replyTo) replyTo.value = senderEmail.value.trim();
  if (emailError) emailError.hidden = true;

  formWasSubmitted = true;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

  clearTimeout(failTimer);
  failTimer = setTimeout(() => {
    if (!formWasSubmitted) return;
    formWasSubmitted = false;
    resetSubmitButton();
    const detail = document.getElementById('email-error-detail');
    if (detail) detail.textContent = 'The mail service took too long to respond.';
    if (emailError) emailError.hidden = false;
  }, 25000);
});

formSubmitFrame?.addEventListener('load', () => {
  if (!formWasSubmitted) return;
  formWasSubmitted = false;
  clearTimeout(failTimer);
  showThankYou();
});

// Escape key
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (emailFormWrapper && !emailFormWrapper.hidden) closeEmailFormPanel();
  closeMobileMenu();
});
