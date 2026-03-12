/* =============================================
   EMA LO SISTEMA – Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile nav burger ----
  const burger = document.getElementById('burger');
  const nav = document.getElementById('main-nav');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Sticky header shadow ----
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (header) {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,.10)'
        : 'none';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- Portfolio filter ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      portfolioItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // ---- Contact form ----
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('form-notice');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome     = form.nome.value.trim();
      const cognome  = form.cognome.value.trim();
      const telefono = form.telefono.value.trim();
      const email    = form.email.value.trim();

      if (!nome || !cognome || !telefono || !email) {
        showNotice('error', 'Compila tutti i campi obbligatori (*).');
        return;
      }

      if (!isValidEmail(email)) {
        showNotice('error', 'Inserisci un indirizzo email valido.');
        return;
      }

      // Build mailto link as fallback (no backend)
      const servizio  = form.servizio.value;
      const messaggio = form.messaggio.value.trim();
      const subject   = encodeURIComponent(`Richiesta da ${nome} ${cognome} – Ema Lo Sistema`);
      const body      = encodeURIComponent(
        `Nome: ${nome} ${cognome}\nTelefono: ${telefono}\nEmail: ${email}\nServizio: ${servizio || 'Non specificato'}\n\n${messaggio}`
      );

      window.location.href = `mailto:emanuele.tasso94@gmail.com?subject=${subject}&body=${body}`;

      showNotice('success', 'Grazie! Il tuo client email si aprirà con la richiesta precompilata.');
      form.reset();
    });
  }

  function showNotice(type, text) {
    if (!notice) return;
    notice.textContent = text;
    notice.className = `form-notice ${type}`;
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
      notice.className = 'form-notice';
      notice.textContent = '';
    }, 6000);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ---- Intersection Observer – fade-in on scroll ----
  const fadeEls = document.querySelectorAll(
    '.service-card, .value-card, .portfolio-item, .about-content, .contact-info'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeEls.forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
