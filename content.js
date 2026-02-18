/**
 * Gemini UI Redesign — Content Script v0.2.8
 * - Floating rounded sidebar
 * - Custom background images (from storage or bundled defaults)
 * - Per-zone darkness overlays
 * - Inner glow borders + hover effects
 * - Listens for popup changes
 */

(() => {
    'use strict';

    // === DEFAULT BUNDLED IMAGE URLs ===
    const DEFAULT_BG = chrome.runtime.getURL('bg.webp');
    const DEFAULT_MSG = chrome.runtime.getURL('msg-bg.webp');

    // === ACTIVE IMAGE URLs (will be updated from storage) ===
    let BG_URL = DEFAULT_BG;
    let SIDEBAR_BG = DEFAULT_MSG;
    let INPUT_BG = DEFAULT_MSG;
    let MSG_BG = DEFAULT_MSG;
    let BACKGROUNDS_ENABLED = true;

    // === PER-ZONE DARKNESS (0.0 – 0.8) ===
    let DARKNESS_BG = 0.6;
    let DARKNESS_SIDEBAR = 0.6;
    let DARKNESS_INPUT = 0.6;
    let DARKNESS_MSG = 0.6;

    // === LOAD IMAGES FROM STORAGE ===
    function loadImagesFromStorage(callback) {
        chrome.storage.local.get(
            ['bg_custom', 'sidebar_custom', 'input_custom', 'msg_custom',
                'backgrounds_enabled',
                'darkness_bg', 'darkness_sidebar', 'darkness_input', 'darkness_msg'],
            (data) => {
                BACKGROUNDS_ENABLED = data.backgrounds_enabled !== false;

                // Per-zone darkness
                DARKNESS_BG = (data.darkness_bg ?? 60) / 100;
                DARKNESS_SIDEBAR = (data.darkness_sidebar ?? 60) / 100;
                DARKNESS_INPUT = (data.darkness_input ?? 60) / 100;
                DARKNESS_MSG = (data.darkness_msg ?? 60) / 100;

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
            const d = DARKNESS_BG;
            document.body.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,${d}), rgba(0,0,0,${d})), url("${BG_URL}")`, 'important');
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
            const d = DARKNESS_SIDEBAR;
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
            const d = DARKNESS_INPUT;
            inputArea.style.setProperty('background-image', `linear-gradient(rgba(0,0,0,${d}), rgba(0,0,0,${d})), url("${INPUT_BG}")`, 'important');
            inputArea.style.setProperty('background-size', 'cover', 'important');
            inputArea.style.setProperty('background-position', 'center center', 'important');
            inputArea.style.setProperty('background-repeat', 'no-repeat', 'important');
            inputArea.style.setProperty('background-color', 'transparent', 'important');
            inputArea.style.setProperty('overflow', 'hidden', 'important');
            inputArea.style.setProperty('box-shadow', 'inset 0 0 0 1px rgba(255,255,255,0.08)', 'important');
            inputArea.style.setProperty('transition', 'box-shadow 0.3s ease', 'important');

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

        // Hover effect
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
                const d = DARKNESS_MSG;
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

        applySidebarBg(sidenav);

        const navContent = sidenav.querySelector('side-navigation-content');
        if (navContent) {
            navContent.style.setProperty('border-radius', '16px', 'important');
            navContent.style.setProperty('background', 'transparent', 'important');
            navContent.style.setProperty('border', 'none', 'important');
        }

        const content = document.querySelector('bard-sidenav-content')
            || document.querySelector('mat-sidenav-content')
            || document.querySelector('.mat-drawer-content');
        if (content) {
            content.style.setProperty('border', 'none', 'important');
            content.style.setProperty('box-shadow', 'none', 'important');
        }

        document.querySelectorAll('.mat-drawer-side').forEach(el => {
            el.style.setProperty('border', 'none', 'important');
        });

        const locationFooter = sidenav.querySelector('location-footer');
        if (locationFooter) {
            locationFooter.style.setProperty('display', 'none', 'important');
        }

        applyInputBg();
        applyMsgBg();
    }

    // === FULL REFRESH ===
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
