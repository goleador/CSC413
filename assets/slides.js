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

   Step-through: any element inside a slide with class "reveal" starts
   hidden and appears on the next keypress, one at a time, before the
   deck moves on. Use it to put a question up alone, then bring in the
   answers. Going back hides them again in reverse.
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
        <tr><td><kbd>&rarr;</kbd> <kbd>space</kbd></td><td>Next step, then next slide</td></tr>
        <tr><td><kbd>&larr;</kbd></td><td>Previous step, then previous slide</td></tr>
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
    function fragments(slide) {
        return Array.from(slide.querySelectorAll('.reveal'));
    }

    // revealAll: true when arriving from the slide after this one, so the
    // slide appears in its finished state rather than replaying.
    function show(i, push, revealAll) {
        current = Math.max(0, Math.min(i, slides.length - 1));

        slides.forEach((s, n) => s.classList.toggle('active', n === current));
        fragments(slides[current]).forEach(f => f.classList.toggle('shown', !!revealAll));

        syncNotes();

        progress.style.width = ((current + 1) / slides.length * 100) + '%';
        counter.textContent = (current + 1) + ' / ' + slides.length;

        if (push !== false) {
            history.replaceState(null, '', '#' + (current + 1));
        }
    }

    // Only the current slide's notes are visible when notes are on.
    function syncNotes() {
        document.querySelectorAll('.notes').forEach(n => {
            n.classList.toggle('active-note', n.closest('.slide') === slides[current]);
        });
    }

    function next() {
        const pending = fragments(slides[current]).find(f => !f.classList.contains('shown'));
        if (pending) pending.classList.add('shown');
        else if (current < slides.length - 1) show(current + 1);
    }

    function prev() {
        const shown = fragments(slides[current]).filter(f => f.classList.contains('shown'));
        if (shown.length) shown[shown.length - 1].classList.remove('shown');
        else if (current > 0) show(current - 1, true, true);
    }

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
            case 'End':  e.preventDefault(); show(slides.length - 1, true, true); break;

            case 'f': case 'F':
                e.preventDefault();
                if (document.fullscreenElement) document.exitFullscreen();
                else document.documentElement.requestFullscreen().catch(() => {});
                break;

            case 's': case 'S':
                e.preventDefault();
                document.body.classList.toggle('show-notes');
                syncNotes();   // not show(): that would reset this slide's reveals
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
