/**
 * Gemini UI Redesign — Floating Sidebar v5 JS
 * - Floating rounded sidebar
 * - Hides location-footer
 */

(() => {
    'use strict';

    // === RESOLVE IMAGE URLs ===
    const BG_URL = chrome.runtime.getURL('bg.png');
    const SIDEBAR_BG = chrome.runtime.getURL('sidebar-bg.png');
    const INPUT_BG = chrome.runtime.getURL('input-bg.png');
    const MSG_BG = chrome.runtime.getURL('msg-bg.png');

    // === BODY BACKGROUND ===
    function applyBackground() {
        document.body.style.setProperty('background-image', `url("${BG_URL}")`, 'important');
        document.body.style.setProperty('background-size', 'cover', 'important');
        document.body.style.setProperty('background-position', 'center center', 'important');
        document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
        document.body.style.setProperty('background-attachment', 'fixed', 'important');
    }

    if (document.body) applyBackground();
    else document.addEventListener('DOMContentLoaded', applyBackground);

    // === SIDEBAR BACKGROUND (with dark overlay) ===
    function applySidebarBg(sidenav) {
        sidenav.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("${MSG_BG}")`, 'important');
        sidenav.style.setProperty('background-size', 'cover', 'important');
        sidenav.style.setProperty('background-position', 'center center', 'important');
        sidenav.style.setProperty('background-repeat', 'no-repeat', 'important');
        sidenav.style.setProperty('background-color', 'transparent', 'important');
    }

    // === INPUT FIELD BACKGROUND ===
    function applyInputBg() {
        const inputArea = document.querySelector('input-area-v2');
        if (!inputArea || inputArea.dataset.bgApplied) return;
        inputArea.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("${MSG_BG}")`, 'important');
        inputArea.style.setProperty('background-size', 'cover', 'important');
        inputArea.style.setProperty('background-position', 'center center', 'important');
        inputArea.style.setProperty('background-repeat', 'no-repeat', 'important');
        inputArea.style.setProperty('background-color', 'transparent', 'important');
        inputArea.style.setProperty('overflow', 'hidden', 'important');
        inputArea.dataset.bgApplied = 'true';

        // Make inner fieldset transparent
        const fieldset = inputArea.querySelector('fieldset');
        if (fieldset) {
            fieldset.style.setProperty('background', 'transparent', 'important');
            fieldset.style.setProperty('background-color', 'transparent', 'important');
        }
    }
    // === USER MESSAGE BUBBLES ===
    function applyMsgBg() {
        document.querySelectorAll('.user-query-bubble-with-background').forEach(el => {
            if (el.dataset.bgApplied) return;
            el.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("${MSG_BG}")`, 'important');
            el.style.setProperty('background-size', 'cover', 'important');
            el.style.setProperty('background-position', 'center center', 'important');
            el.style.setProperty('background-repeat', 'no-repeat', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
            el.dataset.bgApplied = 'true';
        });
        // Make inner content transparent so bubble bg shows through
        document.querySelectorAll('.user-query-bubble-with-background .query-content, .user-query-bubble-with-background .query-text').forEach(el => {
            el.style.setProperty('background', 'transparent', 'important');
        });
    }

    function applyFloatingSidebar() {
        const sidenav = document.querySelector('bard-sidenav');
        if (!sidenav) return;

        // === FLOATING SIDEBAR STYLES ===
        sidenav.style.setProperty('border-radius', '16px', 'important');
        sidenav.style.setProperty('margin', '12px', 'important');
        sidenav.style.setProperty('left', '0', 'important');
        sidenav.style.setProperty('top', '0', 'important');
        sidenav.style.setProperty('height', 'calc(100vh - 24px)', 'important');
        sidenav.style.setProperty('border', 'none', 'important');
        sidenav.style.setProperty('border-right', 'none', 'important');
        sidenav.style.setProperty('border-right-width', '0', 'important');
        sidenav.style.setProperty('box-shadow', '0 2px 16px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.05)', 'important');
        sidenav.style.setProperty('overflow', 'hidden', 'important');

        // Apply sidebar background image
        applySidebarBg(sidenav);

        // Inner content
        const navContent = sidenav.querySelector('side-navigation-content');
        if (navContent) {
            navContent.style.setProperty('border-radius', '16px', 'important');
            navContent.style.setProperty('background', 'transparent', 'important');
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

        // Apply input & message backgrounds
        applyInputBg();
        applyMsgBg();
    }

    // Apply after Angular renders
    setTimeout(applyFloatingSidebar, 500);
    setTimeout(applyFloatingSidebar, 1500);
    setTimeout(applyFloatingSidebar, 3000);

    // MutationObserver: re-apply styles when DOM changes
    function startObserver() {
        const target = document.querySelector('bard-sidenav') || document.body;
        if (!target || !document.body) {
            setTimeout(startObserver, 1000);
            return;
        }

        const observer = new MutationObserver(() => {
            requestAnimationFrame(() => {
                applyFloatingSidebar();
                applyMsgBg();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    startObserver();
})();
