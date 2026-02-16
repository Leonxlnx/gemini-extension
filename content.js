/**
 * Gemini UI Redesign — Floating Sidebar v5 JS
 * - Floating rounded sidebar
 * - Hides location-footer
 * - Enforces suggestion buttons visibility
 */

(() => {
    'use strict';

    function applyFloatingSidebar() {
        const sidenav = document.querySelector('bard-sidenav');
        if (!sidenav) return;

        // === FLOATING SIDEBAR STYLES ===
        sidenav.style.setProperty('border-radius', '16px', 'important');
        sidenav.style.setProperty('margin', '12px', 'important');
        sidenav.style.setProperty('left', '0', 'important');
        sidenav.style.setProperty('top', '0', 'important');
        sidenav.style.setProperty('height', 'calc(100vh - 24px)', 'important');
        sidenav.style.setProperty('background', '#1a1a1d', 'important');
        sidenav.style.setProperty('border', 'none', 'important');
        sidenav.style.setProperty('border-right', 'none', 'important');
        sidenav.style.setProperty('border-right-width', '0', 'important');
        sidenav.style.setProperty('box-shadow', '0 2px 16px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.05)', 'important');
        sidenav.style.setProperty('overflow', 'hidden', 'important');

        // Inner content
        const navContent = sidenav.querySelector('side-navigation-content');
        if (navContent) {
            navContent.style.setProperty('border-radius', '16px', 'important');
            navContent.style.setProperty('background', '#1a1a1d', 'important');
            navContent.style.setProperty('border', 'none', 'important');
        }

        // Content area (right side)
        const content = document.querySelector('bard-sidenav-content')
            || document.querySelector('mat-sidenav-content')
            || document.querySelector('.mat-drawer-content');
        if (content) {
            content.style.setProperty('border', 'none', 'important');
            content.style.setProperty('box-shadow', 'none', 'important');
        }

        // mat-drawer-side borders
        document.querySelectorAll('.mat-drawer-side').forEach(el => {
            el.style.setProperty('border', 'none', 'important');
        });

        // === HIDE LOCATION FOOTER ===
        const locationFooter = sidenav.querySelector('location-footer');
        if (locationFooter) {
            locationFooter.style.setProperty('display', 'none', 'important');
        }
    }

    // === ENFORCE SUGGESTION BUTTONS VISIBILITY ===
    let lastEnforce = 0;
    function enforceButtonVisibility() {
        const now = Date.now();
        if (now - lastEnforce < 200) return; // throttle
        lastEnforce = now;

        // Only walk up from actual buttons — don't touch layout containers
        document.querySelectorAll('button.card-zero-state').forEach(btn => {
            let parent = btn.parentElement;
            let depth = 0;
            while (parent && depth < 4) {
                const tag = parent.tagName.toLowerCase();
                // Stop before major layout containers
                if (tag === 'chat-window' || tag === 'bard-sidenav-content' ||
                    tag === 'mat-sidenav-content' || tag === 'body') break;
                const cs = getComputedStyle(parent);
                if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
                    parent.style.setProperty('overflow', 'visible', 'important');
                }
                parent = parent.parentElement;
                depth++;
            }
        });
    }

    // Apply after Angular renders
    setTimeout(applyFloatingSidebar, 500);
    setTimeout(applyFloatingSidebar, 1500);
    setTimeout(applyFloatingSidebar, 3000);

    // Enforce buttons on same schedule + more
    setTimeout(enforceButtonVisibility, 800);
    setTimeout(enforceButtonVisibility, 2000);
    setTimeout(enforceButtonVisibility, 4000);

    // MutationObserver: re-apply when Angular overrides
    function startObserver() {
        const sidenav = document.querySelector('bard-sidenav');
        if (!sidenav) {
            setTimeout(startObserver, 1000);
            return;
        }

        const observer = new MutationObserver(() => {
            requestAnimationFrame(applyFloatingSidebar);
        });

        observer.observe(sidenav, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: false
        });
    }

    // Body-wide observer to catch dynamic re-renders hiding buttons
    function startBodyObserver() {
        const bodyObserver = new MutationObserver(() => {
            requestAnimationFrame(enforceButtonVisibility);
        });

        bodyObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    startObserver();
    startBodyObserver();
})();
