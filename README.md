# Gemini UI Redesign

A Chrome extension that transforms Google Gemini into a personalized, premium dark experience.

Custom backgrounds · Floating sidebar · Per-zone darkness control · Canvas-compatible

[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?logo=google&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

This extension overhauls the look and feel of [Google Gemini](https://gemini.google.com) without touching any functionality. Everything Gemini does still works as normal - you just get a much nicer interface on top.

![Preview](preview.png)

### Features

- **Custom Background Images** - Upload your own wallpapers for the main background, sidebar, input field, and message bubbles
- **Per-Zone Darkness Sliders** - Fine-tune how dark the overlay is on each zone so your images look just right
- **Floating Sidebar** - The left sidebar becomes a rounded, elevated panel with a soft shadow
- **Premium Dark Theme** - Menus, dropdowns, chips, and buttons all get a cohesive dark treatment
- **Canvas Compatible** - Works correctly when Gemini's Canvas panel is open

---

## Browser Compatibility

| Browser | Support |
|---|---|
| Google Chrome | Full support |
| Microsoft Edge | Full support (Chromium-based) |
| Brave, Vivaldi, Opera | Compatible via Chrome extension sideloading |
| Other Chromium browsers | Should work (Ungoogled-Chromium, Yandex, etc.) |
| Firefox | Not compatible (different extension API) |
| Safari | Not compatible |

---

## Installation

Since this extension is not on the Chrome Web Store, you install it manually.

**1. Download**

```bash
git clone https://github.com/Leonxlnx/gemini-extension.git
```

Or click the green **Code** button on GitHub, then **Download ZIP** and unzip.

**2. Load in Chrome**

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `gemini-extension` folder

**3. Open Gemini**

Navigate to [gemini.google.com](https://gemini.google.com) - the redesign applies automatically.

---

## Customization

Click the extension icon in your toolbar to open the settings popup.

| Setting | Description |
|---|---|
| Master Toggle | Turn all custom backgrounds on or off |
| Background | Upload an image for the main page background |
| Sidebar | Upload an image for the left sidebar |
| Input Field | Upload an image for the chat input area |
| Messages | Upload an image for your sent message bubbles |
| Darkness Sliders | Adjust the dark overlay per zone (0% = full image, 80% = very dark) |

**Tips:**
- Use high-resolution images (1920x1080 or larger) for best results.
- Dark, moody wallpapers work well with the dark UI theme.
- Vertical images work best for the narrow sidebar panel.

---

## How It Works

**`content.css`** is injected at `document_start` and applies all visual restyling before the page renders.

**`content.js`** runs at `document_idle`, loads custom images from `chrome.storage.local`, applies them as CSS background images with per-zone darkness overlays, and uses a `MutationObserver` to re-apply styles when Gemini updates the DOM.

**`popup.js`** handles the settings UI. Uploaded images are resized, converted to WebP, and stored in local storage.

---

## Updating

```bash
git pull origin main
```

Then go to `chrome://extensions`, click the refresh icon on the extension card, and reload any open Gemini tabs.

---

## Contributing

Contributions are welcome.

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Test with the sidebar open/closed and Canvas open/closed
4. Commit with a descriptive message: `git commit -m "feat: description"`
5. Push and open a Pull Request

---

## Known Limitations

- **Gemini updates may break styling.** Google can change the DOM at any time. If something looks off, please open an issue.
- **Storage quota.** Chrome's `storage.local` has a ~10 MB limit. The extension automatically resizes uploads to stay within limits.

---

## License

[MIT](LICENSE)

---

Made by [Leon](https://github.com/Leonxlnx) · [x.com/lexnlin](https://x.com/lexnlin)
