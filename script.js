/* Simple interactive behavior:
 - theme toggle
 - reduce motion checkbox respects prefers-reduced-motion
 - project filters
 - open/close project modals (accessible)
 - small nav toggle for mobile
 - sets current year
*/

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const reduceMotion = document.getElementById('reduce-motion');
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  const yearEl = document.getElementById('year');

  // set year
  yearEl.textContent = new Date().getFullYear();

  // theme (persist in localStorage)
  const savedTheme = localStorage.getItem('site-theme');
  if (savedTheme) body.className = savedTheme;

  themeToggle.addEventListener('click', () => {
    const next = body.classList.contains('dark') ? 'light' : 'dark';
    body.className = next;
    localStorage.setItem('site-theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  });

  // reduce motion
  // Respect system preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.documentElement.dataset.reducedMotion = 'true';
    reduceMotion.checked = true;
  }
  reduceMotion.addEventListener('change', (e) => {
    document.documentElement.dataset.reducedMotion = e.target.checked ? 'true' : 'false';
  });

  // mobile nav toggle
  navToggle.addEventListener('click', () => {
    const open = navList.style.display !== 'flex';
    navList.style.display = open ? 'flex' : 'none';
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // project filters
  const projectGrid = document.getElementById('projects-grid');
  document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      const items = projectGrid.querySelectorAll('.project');
      items.forEach(it => {
        const cats = it.dataset.category.split(/\s+/);
        if (val === 'all' || cats.includes(val)) {
          it.style.display = '';
        } else {
          it.style.display = 'none';
        }
      });
    });
  });

  // modals
  const openButtons = document.querySelectorAll('[data-open]');
  const modals = document.querySelectorAll('[data-modal]');
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open');
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = 'flex';
      modal.querySelector('.modal').focus();
      modal.setAttribute('aria-hidden', 'false');
      trapFocus(modal.querySelector('.modal'));
    });
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const backdrop = btn.closest('.modal-backdrop');
      if (backdrop) closeModal(backdrop);
    });
  });

  modals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(m);
    });
    m.querySelector('.modal').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal(m);
    });
  });

  function closeModal(backdrop) {
    backdrop.style.display = 'none';
    backdrop.setAttribute('aria-hidden', 'true');
  }

  // basic focus trap (simple)
  function trapFocus(modalEl) {
    const focusable = modalEl.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length-1];
    modalEl.addEventListener('keydown', function guard(e){
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }, {once:true});
  }

  // tiny intersection animation (skip if reduced motion)
  if (document.documentElement.dataset.reducedMotion !== 'true') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) en.target.classList.add('reveal');
      });
    }, {threshold: 0.08});
    document.querySelectorAll('.section, .card').forEach(el => io.observe(el));
  }
});
