/* ============================================================
   FAWCETT BUILDS - site behaviour
   ============================================================ */

/* ------------------------------------------------------------
   >>> EDIT ME <<<
   Everything the site needs that only Fawcett Builds can supply.
   Leave a value as an empty string and the element that uses it
   is REMOVED from the page - the site never shows a blank or a
   placeholder claim. Fill it in and it switches on automatically.
   ------------------------------------------------------------ */
const SITE = {
  /* --- already known --- */
  phone:      '(705) 875-0343',
  phoneHref:  '+17058750343',
  email:      'fawcettbuilds@gmail.com',

  /* --- NEEDED: credentials --- */
  esaLicence:  '',   // ECRA/ESA contractor licence no. e.g. '7012345'
  masterCode:  '',   // Master Electrician licence no.
  wsib:        '',   // WSIB clearance no. (or leave blank, chip just says "Insured")
  liability:   '',   // liability coverage, e.g. '$2M'

  /* --- NEEDED: numbers for the spec plate --- */
  yearsActive: '',   // e.g. '15'
  projectCount:'',   // e.g. '200'
  warrantyYrs: '',   // workmanship warranty in years, e.g. '2'

  /* --- NEEDED: reviews. Add as many as you like. --- */
  // { quote:'...', name:'First L.', town:'Bobcaygeon, ON', stars:5 }
  testimonials: [],

  /* --- NEEDED: photos. Drop files in /gallery/img/ then list here. --- */
  // { src:'/gallery/img/panel-01.jpg', title:'200A service upgrade',
  //   category:'electrical', alt:'New 200 amp panel with labelled breakers' }
  // categories: electrical | carpentry | construction
  projects: []
};

/* ------------------------------------------------------------
   No edits needed below this line.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  // progressive enhancement: reveal styles only apply once JS is running,
  // so a script failure or a no-JS visitor still sees the whole page
  document.documentElement.classList.add('js');

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- force https (kept from the old site) ---------- */
  if (location.protocol !== 'https:' && !['localhost', '127.0.0.1', ''].includes(location.hostname)) {
    location.replace('https:' + location.href.substring(location.protocol.length));
  }

  /* ---------- config-driven content ----------
     [data-val="key"]  -> textContent = SITE[key]
     [data-req="key"]  -> element removed when SITE[key] is empty
     [data-req="a|b"]  -> removed only when BOTH are empty          */
  function applyConfig() {
    $$('[data-req]').forEach(el => {
      const ok = el.dataset.req.split('|').some(k => String(SITE[k] ?? '').trim() !== '');
      if (!ok) el.remove();
    });
    $$('[data-val]').forEach(el => {
      const v = String(SITE[el.dataset.val] ?? '').trim();
      if (v) el.textContent = v;
    });
    // any section left with no surviving items disappears too
    $$('[data-drop-if-empty]').forEach(el => {
      if (!$(el.dataset.dropIfEmpty, el)) el.remove();
    });
  }

  /* ---------- nav ---------- */
  function nav() {
    const bar = $('.nav');
    const burger = $('.burger');
    const drawer = $('.drawer');
    if (!bar) return;

    const onScroll = () => bar.classList.toggle('stuck', scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });

    if (!burger || !drawer) return;
    const setOpen = open => {
      burger.setAttribute('aria-expanded', String(open));
      drawer.dataset.open = String(open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
    $$('a', drawer).forEach(a => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
  }

  /* ---------- circuit spine + mobile call bar ---------- */
  function scrollFx() {
    const spine = $('.spine');
    const callbar = $('.callbar');
    let ticking = false;

    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (spine) spine.style.setProperty('--scroll', p.toFixed(4));
      if (callbar) callbar.dataset.show = String(scrollY > innerHeight * 0.6);
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    const els = $$('[data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

    // stagger siblings that share a parent
    els.forEach(el => {
      if (!el.style.getPropertyValue('--d')) {
        const sibs = Array.from(el.parentElement.children).filter(c => c.hasAttribute('data-reveal'));
        const i = sibs.indexOf(el);
        if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
      }
      io.observe(el);
    });

    // failsafe: if the observer never fires, show everything anyway
    setTimeout(() => els.forEach(el => el.classList.add('in')), 2500);
  }

  /* ---------- testimonials ---------- */
  function testimonials() {
    const host = $('#quotes');
    const section = $('#reviews');
    if (!host) return;
    if (!SITE.testimonials.length) { if (section) section.remove(); return; }

    const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';
    host.innerHTML = SITE.testimonials.map(t => {
      const n = Math.max(0, Math.min(5, Number(t.stars) || 5));
      return `<figure class="quote" data-reveal>
        <div class="stars" role="img" aria-label="${n} out of 5 stars">${star.repeat(n)}</div>
        <blockquote>&ldquo;${esc(t.quote)}&rdquo;</blockquote>
        <figcaption><b>${esc(t.name)}</b>${t.town ? ' &middot; ' + esc(t.town) : ''}</figcaption>
      </figure>`;
    }).join('');
  }

  /* ---------- work / gallery ---------- */
  function work() {
    const host = $('#work-grid');
    if (!host) return;

    const limit = Number(host.dataset.limit) || Infinity;
    const empty = $('#work-empty');
    const filters = $('#work-filters');
    const all = SITE.projects;

    if (!all.length) {
      host.remove();
      if (filters) filters.remove();
      return;
    }
    if (empty) empty.remove();

    let active = 'all';
    const render = () => {
      const list = (active === 'all' ? all : all.filter(p => p.category === active)).slice(0, limit);
      host.innerHTML = list.map((p, i) => `
        <figure class="shot" data-reveal data-i="${all.indexOf(p)}" tabindex="0" role="button"
                aria-label="View ${esc(p.title)}">
          <img src="${esc(p.src)}" alt="${esc(p.alt || p.title)}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">
          <figcaption><span>${esc(p.category)}</span><b>${esc(p.title)}</b></figcaption>
        </figure>`).join('');
      reveal();
    };

    if (filters) {
      const cats = ['all', ...new Set(all.map(p => p.category))];
      filters.innerHTML = cats.map(c =>
        `<button type="button" aria-pressed="${c === 'all'}" data-cat="${esc(c)}">${c === 'all' ? 'All work' : esc(c)}</button>`
      ).join('');
      filters.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        active = b.dataset.cat;
        $$('button', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        render();
      });
    }
    render();
    lightbox(host, all);
  }

  /* ---------- lightbox ---------- */
  function lightbox(host, list) {
    const box = $('#lb');
    if (!box) return;
    const img = $('#lb-img', box);
    const label = $('#lb-label', box);
    let i = 0, opener = null;

    const show = () => {
      const p = list[i];
      img.src = p.src;
      img.alt = p.alt || p.title;
      label.textContent = `${p.title} (${i + 1} of ${list.length})`;
    };
    const open = idx => {
      i = idx; opener = document.activeElement; show();
      box.dataset.open = 'true';
      document.body.style.overflow = 'hidden';
      $('.lb-close', box).focus();
    };
    const close = () => {
      box.dataset.open = 'false';
      document.body.style.overflow = '';
      if (opener) opener.focus();
    };
    const step = d => { i = (i + d + list.length) % list.length; show(); };

    host.addEventListener('click', e => {
      const f = e.target.closest('.shot');
      if (f) open(Number(f.dataset.i));
    });
    host.addEventListener('keydown', e => {
      const f = e.target.closest('.shot');
      if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(Number(f.dataset.i)); }
    });

    $('.lb-close', box).addEventListener('click', close);
    $('.lb-prev', box).addEventListener('click', () => step(-1));
    $('.lb-next', box).addEventListener('click', () => step(1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    addEventListener('keydown', e => {
      if (box.dataset.open !== 'true') return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ---------- multi-step quote form ---------- */
  function quoteForm() {
    const form = $('#quote-form');
    if (!form) return;

    const steps = $$('fieldset[data-step]', form);
    const bars = $$('#progress div', form);
    let at = 0;

    const paint = () => {
      steps.forEach((f, i) => { f.hidden = i !== at; });
      bars.forEach((b, i) => { b.dataset.done = String(i <= at); });
      $$('[data-back]', form).forEach(b => { b.hidden = at === 0; });
      const first = steps[at].querySelector('input:not([type=hidden]):not([type=radio]), textarea, select');
      if (first && at > 0) first.focus({ preventScroll: true });
    };

    const valid = () => {
      const fields = $$('input, select, textarea', steps[at]);
      // radio group: at least one checked
      const radios = fields.filter(f => f.type === 'radio');
      if (radios.length && radios.some(r => r.required) && !radios.some(r => r.checked)) {
        radios[0].focus();
        return false;
      }
      for (const f of fields) {
        if (f.type === 'radio') continue;
        if (!f.checkValidity()) { f.reportValidity(); return false; }
      }
      return true;
    };

    form.addEventListener('click', e => {
      if (e.target.closest('[data-next]')) {
        if (!valid()) return;
        at = Math.min(at + 1, steps.length - 1);
        paint();
      }
      if (e.target.closest('[data-back]')) {
        at = Math.max(at - 1, 0);
        paint();
      }
    });

    // Enter should advance, not submit, until the last step
    form.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && at < steps.length - 1) {
        e.preventDefault();
        if (valid()) { at++; paint(); }
      }
    });

    // picking a service auto-advances - one less tap on a phone
    $$('.pick input', form).forEach(r => r.addEventListener('change', () => {
      if (at !== 0) return;
      setTimeout(() => { at = 1; paint(); }, 220);
    }));

    // roll the chosen service into the email subject line
    form.addEventListener('submit', () => {
      const svc = $('input[name="Service"]:checked', form);
      const subj = $('input[name="_subject"]', form);
      if (svc && subj) subj.value = `Quote request: ${svc.value} (fawcettbuilds.ca)`;
    });

    paint();
  }

  /* ---------- keep section numbers contiguous ----------
     sections can be removed (no testimonials yet), so 01..0n is
     recomputed over whatever actually survived                    */
  function renumber() {
    $$('.tag[data-num]').forEach((el, i) => {
      el.textContent = String(i + 1).padStart(2, '0') + ' / ' + el.dataset.num;
    });
  }

  /* ---------- misc ---------- */
  function misc() {
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

    // mark the current page in the nav
    const here = location.pathname.replace(/index\.html$/, '');
    $$('.nav-links a, .drawer a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#') || href === '/') return;
      if (here.startsWith(href.replace(/index\.html$/, ''))) a.setAttribute('aria-current', 'page');
    });
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- go ---------- */
  const boot = () => {
    applyConfig();
    nav(); scrollFx(); testimonials(); work(); quoteForm(); renumber(); misc(); reveal();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
