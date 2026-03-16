/**
 * Gemini UI Redesign — Popup v0.3.0
 * Per-zone darkness sliders + drag & drop + storage + auto-reload
 */

(() => {
    'use strict';

    const KEYS = ['bg_custom', 'sidebar_custom', 'input_custom', 'msg_custom'];
    const DARKNESS_KEYS = ['darkness_bg', 'darkness_sidebar', 'darkness_input', 'darkness_msg'];
    const ZONE_IDS = ['zone-bg', 'zone-sidebar', 'zone-input', 'zone-msg'];
    const PREVIEW_IDS = ['preview-bg', 'preview-sidebar', 'preview-input', 'preview-msg'];

    const toggleInput = document.getElementById('toggle-backgrounds');
    const toggleHideUpgrade = document.getElementById('toggle-hide-upgrade');
    // Glass & Glow elements
    const glassIntensity = document.getElementById('glass-intensity');
    const glassIntensityValue = document.getElementById('glass-intensity-value');
    const glassBlurSlider = document.getElementById('glass-blur-slider');
    const glassBlurValue = document.getElementById('glass-blur-value');
    const glassBlurRow = document.getElementById('glass-blur-row');
    const glowIntensity = document.getElementById('glow-intensity');
    const glowIntensityValue = document.getElementById('glow-intensity-value');
    const glowColorRow = document.getElementById('glow-color-row');
    const glowPresets = document.getElementById('glow-presets');
    const glowColorCustom = document.getElementById('glow-color-custom');
    const zonesContainer = document.getElementById('zones-container');

    // All per-zone darkness sliders
    const darknessSliders = document.querySelectorAll('.darkness-slider');

    // === LOAD STATE ===
    function loadState() {
        chrome.storage.local.get([...KEYS, ...DARKNESS_KEYS, 'backgrounds_enabled', 'hide_upgrade',
            'glass_intensity', 'glass_blur', 'glow_intensity', 'glow_color'], (data) => {
            // Toggle
            const enabled = data.backgrounds_enabled !== false;
            toggleInput.checked = enabled;
            updateDisabledState(enabled);

            // Hide Upgrade toggle
            toggleHideUpgrade.checked = data.hide_upgrade === true;

            // Glass intensity (0-100)
            const gi = data.glass_intensity ?? 0;
            glassIntensity.value = gi;
            glassIntensityValue.textContent = gi + '%';
            updateBlurRowState(gi > 0);

            const blur = data.glass_blur ?? 24;
            glassBlurSlider.value = blur;
            glassBlurValue.textContent = blur + 'px';

            // Glow
            const glowI = data.glow_intensity ?? 0;
            glowIntensity.value = glowI;
            glowIntensityValue.textContent = glowI + '%';
            updateGlowColorState(glowI > 0);

            const glowC = data.glow_color ?? '#a855f7';
            glowColorCustom.value = glowC;
            setActivePreset(glowC);

            // Per-zone darkness sliders
            darknessSliders.forEach(slider => {
                const key = slider.dataset.target;
                const val = data[key] ?? 60;
                slider.value = val;
                slider.nextElementSibling.textContent = val + '%';
            });

            // Previews
            KEYS.forEach((key, i) => {
                if (data[key]) {
                    showPreview(ZONE_IDS[i], PREVIEW_IDS[i], data[key]);
                }
            });
        });
    }

    function updateBlurRowState(enabled) {
        if (enabled) {
            glassBlurRow.classList.remove('disabled');
        } else {
            glassBlurRow.classList.add('disabled');
        }
    }

    function updateGlowColorState(enabled) {
        if (enabled) {
            glowColorRow.classList.remove('disabled');
        } else {
            glowColorRow.classList.add('disabled');
        }
    }

    function setActivePreset(color) {
        glowPresets.querySelectorAll('.color-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.color === color);
        });
    }

    function updateDisabledState(enabled) {
        if (enabled) {
            zonesContainer.classList.remove('disabled');
        } else {
            zonesContainer.classList.add('disabled');
        }
    }

    function showPreview(zoneId, previewId, dataUrl) {
        const zone = document.getElementById(zoneId);
        const preview = document.getElementById(previewId);
        preview.style.backgroundImage = `url("${dataUrl}")`;
        zone.classList.add('has-image');
    }

    function clearPreview(zoneId, previewId) {
        const zone = document.getElementById(zoneId);
        const preview = document.getElementById(previewId);
        preview.style.backgroundImage = '';
        zone.classList.remove('has-image');
    }

    // === FILE HANDLING ===
    function handleFile(file, index) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 1920;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else { w = Math.round(w * MAX / h); h = MAX; }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/webp', 0.85);

                chrome.storage.local.set({ [KEYS[index]]: dataUrl }, () => {
                    if (chrome.runtime.lastError) {
                        alert('Image too large for storage. Try a smaller image.\n' + chrome.runtime.lastError.message);
                        return;
                    }
                    showPreview(ZONE_IDS[index], PREVIEW_IDS[index], dataUrl);
                    refreshGeminiTabs();
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // === REFRESH GEMINI TABS ===
    function refreshGeminiTabs() {
        chrome.tabs.query({ url: 'https://gemini.google.com/*' }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { type: 'REFRESH_BACKGROUNDS' }, (response) => {
                    if (chrome.runtime.lastError) {
                        chrome.tabs.reload(tab.id);
                    }
                });
            });
        });
    }

    // === SETUP DROP ZONES ===
    ZONE_IDS.forEach((zoneId, index) => {
        const zone = document.getElementById(zoneId);
        const fileInput = zone.querySelector('.zone-input');
        const resetBtn = zone.querySelector('.zone-reset');

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file, index);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file, index);
            fileInput.value = '';
        });

        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            chrome.storage.local.remove(KEYS[index], () => {
                clearPreview(zoneId, PREVIEW_IDS[index]);
                refreshGeminiTabs();
            });
        });
    });

    // === TOGGLE ===
    toggleInput.addEventListener('change', () => {
        const enabled = toggleInput.checked;
        chrome.storage.local.set({ backgrounds_enabled: enabled }, () => {
            updateDisabledState(enabled);
            refreshGeminiTabs();
        });
    });

    // === HIDE UPGRADE TOGGLE ===
    toggleHideUpgrade.addEventListener('change', () => {
        const hide = toggleHideUpgrade.checked;
        chrome.storage.local.set({ hide_upgrade: hide }, () => {
            refreshGeminiTabs();
        });
    });

    // === GLASS INTENSITY SLIDER ===
    glassIntensity.addEventListener('input', () => {
        glassIntensityValue.textContent = parseInt(glassIntensity.value) + '%';
    });

    glassIntensity.addEventListener('change', () => {
        const val = parseInt(glassIntensity.value);
        updateBlurRowState(val > 0);
        chrome.storage.local.set({ glass_intensity: val }, () => {
            refreshGeminiTabs();
        });
    });

    // === GLASS BLUR SLIDER ===
    glassBlurSlider.addEventListener('input', () => {
        glassBlurValue.textContent = parseInt(glassBlurSlider.value) + 'px';
    });

    glassBlurSlider.addEventListener('change', () => {
        const val = parseInt(glassBlurSlider.value);
        chrome.storage.local.set({ glass_blur: val }, () => {
            refreshGeminiTabs();
        });
    });

    // === GLOW INTENSITY SLIDER ===
    glowIntensity.addEventListener('input', () => {
        glowIntensityValue.textContent = parseInt(glowIntensity.value) + '%';
    });

    glowIntensity.addEventListener('change', () => {
        const val = parseInt(glowIntensity.value);
        updateGlowColorState(val > 0);
        chrome.storage.local.set({ glow_intensity: val }, () => {
            refreshGeminiTabs();
        });
    });

    // === GLOW COLOR PRESETS ===
    glowPresets.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.dataset.color;
            setActivePreset(color);
            glowColorCustom.value = color;
            chrome.storage.local.set({ glow_color: color }, () => {
                refreshGeminiTabs();
            });
        });
    });

    // === GLOW CUSTOM COLOR ===
    glowColorCustom.addEventListener('input', () => {
        const color = glowColorCustom.value;
        setActivePreset(color);
        chrome.storage.local.set({ glow_color: color }, () => {
            refreshGeminiTabs();
        });
    });

    // === PER-ZONE DARKNESS SLIDERS ===
    darknessSliders.forEach(slider => {
        const valueSpan = slider.nextElementSibling;

        slider.addEventListener('input', () => {
            valueSpan.textContent = parseInt(slider.value) + '%';
        });

        slider.addEventListener('change', () => {
            const key = slider.dataset.target;
            const val = parseInt(slider.value);
            chrome.storage.local.set({ [key]: val }, () => {
                refreshGeminiTabs();
            });
        });
    });

    // === INIT ===
    loadState();
})();
