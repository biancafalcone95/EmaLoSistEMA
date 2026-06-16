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

  // ---- Portfolio lightbox / gallery ----
  const pGrid = document.getElementById('portfolio-grid');
  if (pGrid) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
      '<button class="lb-close" aria-label="Chiudi">&times;</button>' +
      '<button class="lb-prev" aria-label="Foto precedente">&#8249;</button>' +
      '<figure class="lb-figure">' +
        '<img class="lb-img" src="" alt="" />' +
        '<figcaption class="lb-caption"><span class="lb-title"></span><span class="lb-counter"></span></figcaption>' +
      '</figure>' +
      '<button class="lb-next" aria-label="Foto successiva">&#8250;</button>';
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('.lb-img');
    const lbTitle = lb.querySelector('.lb-title');
    const lbCounter = lb.querySelector('.lb-counter');
    const lbPrev = lb.querySelector('.lb-prev');
    const lbNext = lb.querySelector('.lb-next');

    let gallery = [], idx = 0, title = '';

    const render = () => {
      lbImg.src = gallery[idx];
      lbImg.alt = title + ' – foto ' + (idx + 1);
      lbTitle.textContent = title;
      const multi = gallery.length > 1;
      lbCounter.textContent = multi ? (idx + 1) + ' / ' + gallery.length : '';
      lbPrev.style.display = multi ? '' : 'none';
      lbNext.style.display = multi ? '' : 'none';
    };
    const open = (imgs, t) => {
      gallery = imgs; title = t; idx = 0;
      render();
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-open');
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-open');
    };
    const go = (d) => { idx = (idx + d + gallery.length) % gallery.length; render(); };

    pGrid.querySelectorAll('.portfolio-item').forEach(item => {
      const data = item.dataset.gallery;
      const imgs = data ? data.split('|') : [item.querySelector('img').getAttribute('src')];
      const t = (item.querySelector('h4') ? item.querySelector('h4').textContent : '');
      if (imgs.length > 1) {
        const badge = document.createElement('span');
        badge.className = 'gallery-badge';
        badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="13" height="13" rx="2"/><path d="M8 21h11a2 2 0 0 0 2-2V8"/></svg>' + imgs.length;
        item.appendChild(badge);
      }
      item.addEventListener('click', () => open(imgs, t));
    });

    lbPrev.addEventListener('click', (e) => { e.stopPropagation(); go(-1); });
    lbNext.addEventListener('click', (e) => { e.stopPropagation(); go(1); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.classList.contains('lb-figure')) close();
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
    let tx = 0;
    lb.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 45 && gallery.length > 1) go(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

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
