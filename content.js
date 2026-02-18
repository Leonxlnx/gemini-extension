/**
 * Gemini UI Redesign — Content Script v0.2.0
 * - Floating rounded sidebar
 * - Custom background images (from storage or bundled defaults)
 * - Inner glow borders + hover effects
 * - Listens for popup changes
 */

(() => {
    'use strict';

    // === DEFAULT BUNDLED IMAGE URLs ===
    const DEFAULT_BG = chrome.runtime.getURL('bg.png');
    const DEFAULT_SIDEBAR = chrome.runtime.getURL('sidebar-bg.png');
    const DEFAULT_INPUT = chrome.runtime.getURL('input-bg.png');
    const DEFAULT_MSG = chrome.runtime.getURL('msg-bg.png');

    // === ACTIVE IMAGE URLs (will be updated from storage) ===
    let BG_URL = DEFAULT_BG;
    let SIDEBAR_BG = DEFAULT_MSG;   // sidebar uses msg by default
    let INPUT_BG = DEFAULT_MSG;     // input uses msg by default
    let MSG_BG = DEFAULT_MSG;
    let OVERLAY_DARKNESS = 0.6;
    let BACKGROUNDS_ENABLED = true;

    // === LOAD IMAGES FROM STORAGE ===
    function loadImagesFromStorage(callback) {
        chrome.storage.local.get(
            ['bg_custom', 'sidebar_custom', 'input_custom', 'msg_custom', 'backgrounds_enabled', 'overlay_darkness'],
            (data) => {
                BACKGROUNDS_ENABLED = data.backgrounds_enabled !== false;
                OVERLAY_DARKNESS = (data.overlay_darkness ?? 60) / 100;

                if (BACKGROUNDS_ENABLED) {
                    BG_URL = data.bg_custom || DEFAULT_BG;
                    SIDEBAR_BG = data.sidebar_custom || DEFAULT_MSG;
                    INPUT_BG = data.input_custom || DEFAULT_MSG;
                    MSG_BG = data.msg_custom || DEFAULT_MSG;
                } else {
                    BG_URL = null;
                    SIDEBAR_BG = null;
                    INPUT_BG = null;
                    MSG_BG = null;
                }

                if (callback) callback();
            }
        );
    }

    // === BODY BACKGROUND ===
    function applyBackground() {
        if (!document.body) return;
        if (BG_URL) {
            document.body.style.setProperty('background-image', `url("${BG_URL}")`, 'important');
            document.body.style.setProperty('background-size', 'cover', 'important');
            document.body.style.setProperty('background-position', 'center center', 'important');
            document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
            document.body.style.setProperty('background-attachment', 'fixed', 'important');
        } else {
            document.body.style.removeProperty('background-image');
            document.body.style.removeProperty('background-size');
            document.body.style.removeProperty('background-position');
            document.body.style.removeProperty('background-repeat');
            document.body.style.removeProperty('background-attachment');
        }
    }

    // === SIDEBAR BACKGROUND ===
    function applySidebarBg(sidenav) {
        if (SIDEBAR_BG) {
            const d = OVERLAY_DARKNESS;
            sidenav.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,${d}), rgba(0,0,0,${d})), url("${SIDEBAR_BG}")`, 'important');
            sidenav.style.setProperty('background-size', 'cover', 'important');
            sidenav.style.setProperty('background-position', 'center center', 'important');
            sidenav.style.setProperty('background-repeat', 'no-repeat', 'important');
            sidenav.style.setProperty('background-color', 'transparent', 'important');
            sidenav.style.setProperty('box-shadow', 'inset 0 0 0 1px rgba(255,255,255,0.08)', 'important');
        } else {
            sidenav.style.removeProperty('background-image');
            sidenav.style.removeProperty('background-size');
            sidenav.style.removeProperty('background-position');
            sidenav.style.removeProperty('background-repeat');
        }
    }

    // === INPUT FIELD BACKGROUND ===
    function applyInputBg() {
        const inputArea = document.querySelector('input-area-v2');
        if (!inputArea) return;

        if (INPUT_BG) {
            const d = OVERLAY_DARKNESS;
            inputArea.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,${d}), rgba(0,0,0,${d})), url("${INPUT_BG}")`, 'important');
            inputArea.style.setProperty('background-size', 'cover', 'important');
            inputArea.style.setProperty('background-position', 'center center', 'important');
            inputArea.style.setProperty('background-repeat', 'no-repeat', 'important');
            inputArea.style.setProperty('background-color', 'transparent', 'important');
            inputArea.style.setProperty('overflow', 'hidden', 'important');
            inputArea.style.setProperty('box-shadow', 'inset 0 0 0 1px rgba(255,255,255,0.08)', 'important');
            inputArea.style.setProperty('transition', 'box-shadow 0.3s ease', 'important');

            // Make inner fieldset transparent
            const fieldset = inputArea.querySelector('fieldset');
            if (fieldset) {
                fieldset.style.setProperty('background', 'transparent', 'important');
                fieldset.style.setProperty('background-color', 'transparent', 'important');
            }
        } else {
            inputArea.style.removeProperty('background-image');
            inputArea.style.removeProperty('background-size');
            inputArea.style.removeProperty('background-position');
            inputArea.style.removeProperty('background-repeat');
        }

        // Hover effect (always active)
        if (!inputArea.dataset.hoverBound) {
            inputArea.addEventListener('mouseenter', () => {
                inputArea.style.setProperty('box-shadow', 'inset 0 0 0 1px rgba(255,255,255,0.18)', 'important');
            });
            inputArea.addEventListener('mouseleave', () => {
                inputArea.style.setProperty('box-shadow', 'inset 0 0 0 1px rgba(255,255,255,0.08)', 'important');
            });
            inputArea.dataset.hoverBound = 'true';
        }
    }

    // === USER MESSAGE BUBBLES ===
    function applyMsgBg() {
        document.querySelectorAll('.user-query-bubble-with-background').forEach(el => {
            if (MSG_BG) {
                const d = OVERLAY_DARKNESS;
                el.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,${d}), rgba(0,0,0,${d})), url("${MSG_BG}")`, 'important');
                el.style.setProperty('background-size', 'cover', 'important');
                el.style.setProperty('background-position', 'center center', 'important');
                el.style.setProperty('background-repeat', 'no-repeat', 'important');
                el.style.setProperty('background-color', 'transparent', 'important');
                el.style.setProperty('box-shadow', 'inset 0 0 0 1px rgba(255,255,255,0.08)', 'important');
            } else {
                el.style.removeProperty('background-image');
                el.style.removeProperty('background-size');
                el.style.removeProperty('background-position');
                el.style.removeProperty('background-repeat');
            }
        });

        // Make inner content transparent so bubble bg shows through
        if (MSG_BG) {
            document.querySelectorAll('.user-query-bubble-with-background .query-content, .user-query-bubble-with-background .query-text').forEach(el => {
                el.style.setProperty('background', 'transparent', 'important');
            });
        }
    }

    // === FLOATING SIDEBAR ===
    function applyFloatingSidebar() {
        const sidenav = document.querySelector('bard-sidenav');
        if (!sidenav) return;

        // Floating sidebar styles
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

        // Hide location footer
        const locationFooter = sidenav.querySelector('location-footer');
        if (locationFooter) {
            locationFooter.style.setProperty('display', 'none', 'important');
        }

        // Apply input & message backgrounds
        applyInputBg();
        applyMsgBg();
    }

    // === FULL REFRESH (called on load + when popup sends message) ===
    function fullRefresh() {
        loadImagesFromStorage(() => {
            applyBackground();
            applyFloatingSidebar();
        });
    }

    // === LISTEN FOR POPUP MESSAGES ===
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg.type === 'REFRESH_BACKGROUNDS') {
            fullRefresh();
            sendResponse({ ok: true });
        }
    });

    // === INIT ===
    loadImagesFromStorage(() => {
        if (document.body) applyBackground();
        else document.addEventListener('DOMContentLoaded', applyBackground);

        // Apply after Angular renders
        setTimeout(applyFloatingSidebar, 500);
        setTimeout(applyFloatingSidebar, 1500);
        setTimeout(applyFloatingSidebar, 3000);
    });

    // === MUTATION OBSERVER ===
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
