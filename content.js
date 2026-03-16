/**
 * Gemini UI Redesign — Content Script v0.2.26
 * - Floating rounded sidebar
 * - Custom background images (from storage or bundled defaults)
 * - Per-zone darkness overlays
 * - Inner glow borders + hover effects
 * - Listens for popup changes
 */

(() => {
    'use strict';

    // Guard: if extension was reloaded, old content scripts lose context
    if (!chrome.runtime?.id) return;

    // === DEFAULT BUNDLED IMAGE URLs ===
    const DEFAULT_BG = chrome.runtime.getURL('bg.webp');
    const DEFAULT_MSG = chrome.runtime.getURL('msg-bg.webp');

    // === ACTIVE IMAGE URLs (will be updated from storage) ===
    let BG_URL = DEFAULT_BG;
    let SIDEBAR_BG = DEFAULT_MSG;
    let INPUT_BG = DEFAULT_MSG;
    let MSG_BG = DEFAULT_MSG;
    let BACKGROUNDS_ENABLED = true;
    let HIDE_UPGRADE = false;
    let GLASS_INTENSITY = 0;   // 0-100
    let GLASS_BLUR = 24;
    let GLOW_INTENSITY = 0;    // 0-100
    let GLOW_COLOR = '#a855f7';

    // === PER-ZONE DARKNESS (0.0 – 0.8) ===
    let DARKNESS_BG = 0.6;
    let DARKNESS_SIDEBAR = 0.6;
    let DARKNESS_INPUT = 0.6;
    let DARKNESS_MSG = 0.6;

    // === LOAD IMAGES FROM STORAGE ===
    function loadImagesFromStorage(callback) {
        chrome.storage.local.get(
            ['bg_custom', 'sidebar_custom', 'input_custom', 'msg_custom',
                'backgrounds_enabled', 'hide_upgrade',
                'glass_intensity', 'glass_blur', 'glow_intensity', 'glow_color',
                'darkness_bg', 'darkness_sidebar', 'darkness_input', 'darkness_msg'],
            (data) => {
                BACKGROUNDS_ENABLED = data.backgrounds_enabled !== false;
                HIDE_UPGRADE = data.hide_upgrade === true;
                GLASS_INTENSITY = data.glass_intensity ?? 0;
                GLASS_BLUR = data.glass_blur ?? 24;
                GLOW_INTENSITY = data.glow_intensity ?? 0;
                GLOW_COLOR = data.glow_color ?? '#a855f7';

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

    // === HIDE UPGRADE BUTTON ===
    // === GLASSMORPHISM (intensity-based) ===
    function applyGlass() {
        if (!document.body) return;
        if (GLASS_INTENSITY > 0) {
            document.body.classList.add('gemini-ext-glass');
            // Map 0-100 to opacity 0.0-0.7
            const opacity = (GLASS_INTENSITY / 100) * 0.7;
            // Map 0-100 to actual blur (proportional to slider max)
            const blur = (GLASS_INTENSITY / 100) * GLASS_BLUR;
            document.body.style.setProperty('--glass-opacity', opacity);
            document.body.style.setProperty('--glass-blur', blur + 'px');

            // Force-clear input background image so backdrop-filter blur works
            const inputArea = document.querySelector('input-area-v2');
            if (inputArea) {
                inputArea.style.removeProperty('background-image');
                inputArea.style.setProperty('background-image', 'none', 'important');
            }
        } else {
            document.body.classList.remove('gemini-ext-glass');
            document.body.style.removeProperty('--glass-opacity');
            document.body.style.removeProperty('--glass-blur');
        }
    }

    // === INPUT GLOW (caret-tracking light beam) ===
    let glowEl = null;

    function applyGlow() {
        if (!document.body) return;
        if (GLOW_INTENSITY > 0) {
            document.body.classList.add('gemini-ext-glow');
            document.body.style.setProperty('--glow-color', GLOW_COLOR);
            document.body.style.setProperty('--glow-intensity', GLOW_INTENSITY / 100);
            setupGlowTracking();
        } else {
            document.body.classList.remove('gemini-ext-glow');
            document.body.style.removeProperty('--glow-color');
            document.body.style.removeProperty('--glow-intensity');
            removeGlow();
        }
    }

    function setupGlowTracking() {
        const inputArea = document.querySelector('input-area-v2');
        if (!inputArea) return;

        inputArea.style.setProperty('overflow', 'visible', 'important');

        if (!glowEl || !glowEl.parentElement) {
            glowEl = document.createElement('div');
            glowEl.className = 'gemini-glow-cursor';
            inputArea.appendChild(glowEl);
        }

        if (!inputArea.dataset.glowBound) {
            const updateGlowPosition = () => {
                if (!glowEl || !glowEl.parentElement) return;
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return;

                const range = sel.getRangeAt(0);
                if (!inputArea.contains(range.startContainer)) return;

                const rects = range.getClientRects();
                const rect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();
                const containerRect = inputArea.getBoundingClientRect();

                if (rect && rect.height > 0 && (rect.left > 0 || rect.right > 0)) {
                    const x = (rect.width === 0)
                        ? rect.left - containerRect.left
                        : rect.right - containerRect.left;
                    glowEl.style.left = x + 'px';
                    glowEl.classList.add('active');
                }
            };

            // Only show on actual typing, not just focus/click into empty field
            inputArea.addEventListener('keyup', updateGlowPosition);
            inputArea.addEventListener('input', () => {
                requestAnimationFrame(updateGlowPosition);
            });
            inputArea.addEventListener('click', () => {
                // Only update if there's actual text content
                const editor = inputArea.querySelector('.ql-editor, [contenteditable]');
                const text = editor ? editor.textContent.trim() : '';
                if (text.length > 0) {
                    requestAnimationFrame(updateGlowPosition);
                }
            });

            // Hide beam when leaving input
            inputArea.addEventListener('focusout', () => {
                if (glowEl) glowEl.classList.remove('active');
            });

            inputArea.dataset.glowBound = 'true';
        }
    }

    function removeGlow() {
        if (glowEl && glowEl.parentElement) {
            glowEl.remove();
        }
        glowEl = null;
    }

    function applyHideUpgrade() {
        if (!document.body) return;
        if (HIDE_UPGRADE) {
            document.body.classList.add('gemini-ext-hide-upgrade');
        } else {
            document.body.classList.remove('gemini-ext-hide-upgrade');
        }
    }

    // === BODY BACKGROUND ===
    function applyBackground() {
        if (!document.body) return;
        applyHideUpgrade();
        applyGlass();
        applyGlow();
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
    // Skipped when glassmorphism is active — glass needs transparency for blur
    function applyInputBg() {
        const inputArea = document.querySelector('input-area-v2');
        if (!inputArea) return;

        // When glass is active, don't apply background images to input
        if (GLASS_INTENSITY > 0) {
            inputArea.style.removeProperty('background-image');
            inputArea.style.setProperty('background-image', 'none', 'important');
            return;
        }

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
    // Geometry (border-radius, margin, border) handled entirely by content.css.
    // JS only applies dynamic background images from storage.
    function applyFloatingSidebar() {
        const sidenav = document.querySelector('bard-sidenav');
        if (!sidenav) return;

        applySidebarBg(sidenav);
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

        // Wait for Gemini SPA to render the sidenav via observer instead of fragile timeouts
        waitForElement('bard-sidenav', () => {
            applyFloatingSidebar();
            startObserver();
        });
    });

    // === WAIT FOR ELEMENT ===
    function waitForElement(selector, callback) {
        const el = document.querySelector(selector);
        if (el) { callback(); return; }

        const initObserver = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                initObserver.disconnect();
                callback();
            }
        });
        initObserver.observe(document.body || document.documentElement, {
            childList: true, subtree: true
        });
    }

    // === MUTATION OBSERVER (throttled) ===
    function startObserver() {
        let pendingRefresh = false;

        const observer = new MutationObserver(() => {
            if (!pendingRefresh) {
                pendingRefresh = true;
                requestAnimationFrame(() => {
                    applyFloatingSidebar();
                    applyMsgBg();
                    pendingRefresh = false;
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

})();
