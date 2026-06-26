// app.js — interactive behaviors for the welcome guide
// - Inject SVG decorations into [data-deco] slots
// - TOC click → jump to slide
// - Copy buttons (code, password)
// - WhatsApp links
// - Header logo / page numbers / footer phone updates from a single source

(() => {
  // ── 1. Inject decorations ────────────────────────────────────────────
  document.querySelectorAll('[data-deco]').forEach((el) => {
    const name = el.getAttribute('data-deco');
    if (window.Deco && window.Deco[name]) {
      el.innerHTML = window.Deco[name]({ width: '100%', height: '100%' });
    }
  });

  // ── 2. Wait for deck-stage to be ready, then bind TOC ────────────────
  const deck = document.querySelector('deck-stage');

  function jumpTo(idx) {
    if (deck && typeof deck.goTo === 'function') {
      deck.goTo(idx);
    }
  }

  document.querySelectorAll('[data-jump]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Do NOT preventDefault — preserves the href as a real anchor link
      // so PDF export generates proper internal navigation links.
      const idx = parseInt(el.getAttribute('data-jump'), 10);
      if (!isNaN(idx)) jumpTo(idx);
    });
  });

  // ── 2b. Flat selection + "Voltar ao índice" button on every page ──
  const FLAT_TOCS = { '201': 2, '202': 3, '301': 4 };
  let selectedFlat = localStorage.getItem('dimare-flat') || '201';
  function getTocIndex() { return FLAT_TOCS[selectedFlat] || 2; }

  // Flat selection buttons (flat-pick-btn on slide-select)
  document.querySelectorAll('[data-select-flat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedFlat = btn.getAttribute('data-select-flat');
      localStorage.setItem('dimare-flat', selectedFlat);
      jumpTo(FLAT_TOCS[selectedFlat]);
    });
  });

  document.querySelectorAll('section.page').forEach((sec) => {
    const label = sec.getAttribute('data-label') || '';
    const id = sec.id || '';
    // Skip: cover, flat select page, and all 3 TOC pages
    if (
      sec.classList.contains('page-cover') ||
      id === 'slide-select' ||
      /[ÍI]ndice/i.test(label)
    ) return;

    const makeBtn = () => {
      const b = document.createElement('a');
      b.className = 'btn-index';
      b.href = '#slide-select';
      b.innerHTML = '<span aria-hidden="true">↩</span> Índice';
      b.addEventListener('click', (e) => { jumpTo(getTocIndex()); });
      return b;
    };

    const hdr = sec.querySelector('.hdr');
    if (hdr) {
      const pg = hdr.querySelector('.hdr-pg');
      const right = document.createElement('div');
      right.className = 'hdr-right';
      const btn = makeBtn();
      if (pg) { hdr.insertBefore(right, pg); right.appendChild(btn); right.appendChild(pg); }
      else { hdr.appendChild(btn); }
    } else {
      const btn = makeBtn();
      btn.classList.add('btn-index-float');
      sec.appendChild(btn);
    }
  });

  // ── 3. Copy buttons ──────────────────────────────────────────────────
  document.querySelectorAll('[data-copy], [data-copy-id]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      let text = btn.getAttribute('data-copy');
      const id = btn.getAttribute('data-copy-id');
      if (id) {
        const el = document.getElementById(id);
        if (el) text = el.innerText.trim();
      }
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for non-https
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
      }
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Copiado';
      btn.classList.add('copied');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1600);
    });
  });

  // ── 4. WhatsApp links — read live from any [data-edit] containing phone
  // We just keep them as visual; real wa.me links would need the number.
  document.querySelectorAll('[data-wpp]').forEach((el) => {
    el.setAttribute('href', '#');
    el.addEventListener('click', (e) => {
      e.preventDefault();
      // Try to extract a phone from the same element
      const m = el.innerText.match(/[\d\s\-\(\)]{8,}/);
      if (!m) return;
      const num = m[0].replace(/\D/g, '');
      if (num.length >= 10) {
        const wa = `https://wa.me/55${num}`;
        window.open(wa, '_blank');
      }
    });
  });

  // ── 5. Map button placeholder ────────────────────────────────────────
  document.querySelectorAll('[data-action="map"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Aberto';
      btn.classList.add('copied');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1600);
    });
  });

  // ── 6. Live-update logo + phone in headers/footers when one is edited ─
  // When user edits any [data-edit] with hospedagens-style text, propagate
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement) || !t.hasAttribute('data-edit')) return;
    const txt = t.innerText.trim();

    // Brand name (HOSPEDAGENS in caps)
    if (/HOSPEDAGENS$/i.test(txt)) {
      document.querySelectorAll('[data-edit]').forEach((el) => {
        if (el !== t && /HOSPEDAGENS$/i.test(el.innerText.trim())) {
          el.innerText = txt;
        }
      });
    }
    // Instagram handle
    if (/^@/.test(txt)) {
      document.querySelectorAll('[data-edit]').forEach((el) => {
        if (el !== t && /^@/.test(el.innerText.trim())) {
          el.innerText = txt;
        }
      });
    }
    // Phone number
    if (/\(\d{2}\).*\d{4}/.test(txt)) {
      document.querySelectorAll('[data-edit]').forEach((el) => {
        if (el !== t && /\(\d{2}\).*\d{4}/.test(el.innerText.trim())) {
          el.innerText = txt;
        }
      });
    }
  });
})();
