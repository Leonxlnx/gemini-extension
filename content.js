/**
 * Gemini UI Redesign — Floating Sidebar v5 JS
 * - Floating rounded sidebar
 * - Hides location-footer
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

    // Apply after Angular renders
    setTimeout(applyFloatingSidebar, 500);
    setTimeout(applyFloatingSidebar, 1500);
    setTimeout(applyFloatingSidebar, 3000);

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

    startObserver();
})();
