// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Current Year
  const year = document.getElementById('y');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Theme Toggle
  const themeBtn = document.getElementById('themeToggle');

  function setTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      if (themeBtn) themeBtn.innerHTML = '🌙 Dark';
    } else {
      document.body.classList.remove('light-mode');
      if (themeBtn) themeBtn.innerHTML = '☀️ Light';
    }

    localStorage.setItem('theme', theme);
  }

  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      if (document.body.classList.contains('light-mode')) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    });
  }

  // Smooth Scroll
  document
    .querySelectorAll('a[href^="services@domwebsolutions.online"]')
    .forEach((link) => {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });

  // Active Navigation
  const sections = document.querySelectorAll('section');

  const navLinks = document.querySelectorAll('.menu a');

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach((section) => {
      const top = section.offsetTop - 120;

      if (pageYOffset >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');

      if (
        link.getAttribute('href') ===
        'services@domwebsolutions.online' + current
      ) {
        link.classList.add('active');
      }
    });
  });

  // Reveal Animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';

          entry.target.style.transform = 'translateY(0)';

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    },
  );

  document.querySelectorAll('.card, section, .hero').forEach((item) => {
    item.style.opacity = '0';

    item.style.transform = 'translateY(30px)';

    item.style.transition = 'all .8s ease';

    observer.observe(item);
  });

  // Button Ripple Effect
  document.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('click', function () {
      this.style.transform = 'scale(.97)';

      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });

  // Lazy Loading Images
  document.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }

    if (!img.hasAttribute('decoding')) {
      img.decoding = 'async';
    }
  });

  // Back To Top Button
  const topBtn = document.createElement('button');

  topBtn.innerHTML = '↑';

  topBtn.id = 'topBtn';

  Object.assign(topBtn.style, {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    background: '#2e52a0',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'none',
    zIndex: '999',
    boxShadow: '0 5px 15px rgba(0,0,0,.25)',
  });

  document.body.appendChild(topBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      topBtn.style.display = 'block';
    } else {
      topBtn.style.display = 'none';
    }
  });

  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });
});

// Email fallback
const emailButton = document.getElementById('emailButton');

if (emailButton) {
  emailButton.addEventListener('click', function (e) {
    e.preventDefault();

    const email = 'services@domwebsolutions.online';

    const subject = 'Website Development Inquiry';

    const body = `Hello Dom Web Solutions,

I am interested in your services. Kindly tell me more about your services


Name:                  
Phone:                  
Email:

`;

    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    setTimeout(() => {
      window.open(gmail, '_blank');
    }, 700);
  });
}
