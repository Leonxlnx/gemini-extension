/**
 * Gemini UI Redesign — Popup v0.2.0
 * Drag & drop image customization + storage
 */

(() => {
    'use strict';

    const KEYS = ['bg_custom', 'sidebar_custom', 'input_custom', 'msg_custom'];
    const ZONE_IDS = ['zone-bg', 'zone-sidebar', 'zone-input', 'zone-msg'];
    const PREVIEW_IDS = ['preview-bg', 'preview-sidebar', 'preview-input', 'preview-msg'];

    const toggleInput = document.getElementById('toggle-backgrounds');
    const zonesContainer = document.getElementById('zones-container');
    const sliderRow = document.getElementById('slider-row');
    const darknessSlider = document.getElementById('darkness-slider');
    const darknessValue = document.getElementById('darkness-value');

    // === LOAD STATE ===
    function loadState() {
        chrome.storage.local.get([...KEYS, 'backgrounds_enabled', 'overlay_darkness'], (data) => {
            // Toggle
            const enabled = data.backgrounds_enabled !== false; // default true
            toggleInput.checked = enabled;
            updateDisabledState(enabled);

            // Darkness slider
            const darkness = data.overlay_darkness ?? 60;
            darknessSlider.value = darkness;
            darknessValue.textContent = darkness + '%';

            // Previews
            KEYS.forEach((key, i) => {
                if (data[key]) {
                    showPreview(ZONE_IDS[i], PREVIEW_IDS[i], data[key]);
                }
            });
        });
    }

    function updateDisabledState(enabled) {
        if (enabled) {
            zonesContainer.classList.remove('disabled');
            sliderRow.classList.remove('disabled');
        } else {
            zonesContainer.classList.add('disabled');
            sliderRow.classList.add('disabled');
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

        // Resize large images to keep storage manageable
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

                // Save
                chrome.storage.local.set({ [KEYS[index]]: dataUrl }, () => {
                    showPreview(ZONE_IDS[index], PREVIEW_IDS[index], dataUrl);
                    notifyContentScript();
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // === NOTIFY CONTENT SCRIPT ===
    function notifyContentScript() {
        chrome.tabs.query({ url: 'https://gemini.google.com/*' }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { type: 'REFRESH_BACKGROUNDS' });
            });
        });
    }

    // === SETUP ZONES ===
    ZONE_IDS.forEach((zoneId, index) => {
        const zone = document.getElementById(zoneId);
        const fileInput = zone.querySelector('.zone-input');
        const resetBtn = zone.querySelector('.zone-reset');

        // Drag & drop
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

        // File input click
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file, index);
            fileInput.value = ''; // reset for re-upload
        });

        // Reset button
        resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            chrome.storage.local.remove(KEYS[index], () => {
                clearPreview(zoneId, PREVIEW_IDS[index]);
                notifyContentScript();
            });
        });
    });

    // === TOGGLE ===
    toggleInput.addEventListener('change', () => {
        const enabled = toggleInput.checked;
        chrome.storage.local.set({ backgrounds_enabled: enabled }, () => {
            updateDisabledState(enabled);
            notifyContentScript();
        });
    });

    // === DARKNESS SLIDER ===
    darknessSlider.addEventListener('input', () => {
        const val = parseInt(darknessSlider.value);
        darknessValue.textContent = val + '%';
    });

    darknessSlider.addEventListener('change', () => {
        const val = parseInt(darknessSlider.value);
        chrome.storage.local.set({ overlay_darkness: val }, () => {
            notifyContentScript();
        });
    });

    // === INIT ===
    loadState();
})();
