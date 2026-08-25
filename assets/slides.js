/* ============================================================
   CSC 413 — slide deck navigation
   Shared by every lecture deck. No dependencies, no network.

   Keys:  → ↓ space PgDn  next        ← ↑ PgUp  previous
          Home / End      first / last
          F               fullscreen
          S               speaker notes
          D               dark mode (washed-out projectors)
          B               black the screen
          ?               help
   Also: click right/left half, swipe on touch, and deep links (#7).
   ============================================================ */

(function () {
    'use strict';

    const slides = Array.from(document.querySelectorAll('.slide'));
    if (!slides.length) return;

    let current = 0;
    let blanked = false;

    // --- chrome -------------------------------------------------
    const progress = el('div', 'progress');
    const counter = el('div', 'counter');
    document.body.append(progress, counter);

    const help = el('div', 'help');
    help.innerHTML = `<table>
        <tr><th colspan="2">Keyboard</th></tr>
        <tr><td><kbd>&rarr;</kbd> <kbd>space</kbd></td><td>Next slide</td></tr>
        <tr><td><kbd>&larr;</kbd></td><td>Previous slide</td></tr>
        <tr><td><kbd>Home</kbd> / <kbd>End</kbd></td><td>First / last</td></tr>
        <tr><td><kbd>F</kbd></td><td>Fullscreen</td></tr>
        <tr><td><kbd>S</kbd></td><td>Speaker notes</td></tr>
        <tr><td><kbd>D</kbd></td><td>Dark mode</td></tr>
        <tr><td><kbd>B</kbd></td><td>Blank screen</td></tr>
        <tr><td><kbd>?</kbd></td><td>This help</td></tr>
    </table>`;
    document.body.appendChild(help);

    function el(tag, cls) {
        const n = document.createElement(tag);
        n.className = cls;
        return n;
    }

    // --- navigation ---------------------------------------------
    function show(i, push) {
        current = Math.max(0, Math.min(i, slides.length - 1));

        slides.forEach((s, n) => s.classList.toggle('active', n === current));

        // Only the current slide's notes are visible when notes are on.
        document.querySelectorAll('.notes').forEach(n => {
            n.classList.toggle('active-note', n.closest('.slide') === slides[current]);
        });

        progress.style.width = ((current + 1) / slides.length * 100) + '%';
        counter.textContent = (current + 1) + ' / ' + slides.length;

        if (push !== false) {
            history.replaceState(null, '', '#' + (current + 1));
        }
    }

    const next = () => show(current + 1);
    const prev = () => show(current - 1);

    // --- keyboard ------------------------------------------------
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        switch (e.key) {
            case 'ArrowRight': case 'ArrowDown': case ' ':
            case 'PageDown': case 'n':
                e.preventDefault(); next(); break;

            case 'ArrowLeft': case 'ArrowUp':
            case 'PageUp': case 'p':
                e.preventDefault(); prev(); break;

            case 'Home': e.preventDefault(); show(0); break;
            case 'End':  e.preventDefault(); show(slides.length - 1); break;

            case 'f': case 'F':
                e.preventDefault();
                if (document.fullscreenElement) document.exitFullscreen();
                else document.documentElement.requestFullscreen().catch(() => {});
                break;

            case 's': case 'S':
                e.preventDefault();
                document.body.classList.toggle('show-notes');
                show(current, false);
                break;

            case 'd': case 'D':
                e.preventDefault();
                document.body.classList.toggle('dark-slides');
                try {
                    localStorage.setItem('csc413-slides-dark',
                        document.body.classList.contains('dark-slides') ? '1' : '0');
                } catch (_) {}
                break;

            case 'b': case 'B':
                e.preventDefault();
                blanked = !blanked;
                document.body.style.visibility = blanked ? 'hidden' : '';
                break;

            case '?': case '/':
                e.preventDefault();
                help.classList.toggle('open');
                break;

            case 'Escape':
                help.classList.remove('open');
                break;
        }
    });

    // --- click and touch -----------------------------------------
    document.addEventListener('click', e => {
        if (e.target.closest('a, pre, .help')) return;
        if (help.classList.contains('open')) { help.classList.remove('open'); return; }
        (e.clientX > window.innerWidth * 0.5 ? next : prev)();
    });

    let touchX = null;
    document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; },
        { passive: true });
    document.addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX = null;
    }, { passive: true });

    // --- start ----------------------------------------------------
    try {
        if (localStorage.getItem('csc413-slides-dark') === '1') {
            document.body.classList.add('dark-slides');
        }
    } catch (_) {}

    const fromHash = parseInt(location.hash.slice(1), 10);
    show(Number.isFinite(fromHash) && fromHash > 0 ? fromHash - 1 : 0, false);
})();
