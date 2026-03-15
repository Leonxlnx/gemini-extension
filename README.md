<![CDATA[<div align="center">

<img src="banner.png" alt="Gemini UI Redesign Banner" width="100%" />

# ✨ Gemini UI Redesign

**A Chrome extension that transforms Google Gemini into a personalized, premium dark experience.**

Custom backgrounds · Floating sidebar · Per-zone darkness control · Canvas-compatible

[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?logo=google&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🎯 What It Does

This extension overhauls the look and feel of [Google Gemini](https://gemini.google.com) without touching any functionality. Everything Gemini does still works — you just get a much nicer interface on top.

**Key features:**

- 🖼️ **Custom Background Images** — Upload your own wallpapers for the main background, sidebar, input field, and message bubbles
- 🌗 **Per-Zone Darkness Sliders** — Fine-tune how dark the overlay is on each zone so your images look just right
- 🧊 **Floating Sidebar** — The left sidebar becomes a rounded, elevated panel with a soft shadow
- 🎨 **Premium Dark Theme** — Menus, dropdowns, chips, and buttons all get a cohesive dark treatment
- 🖥️ **Canvas Compatible** — Works correctly when Gemini's right-side Canvas/Artifact panel is open

---

## 📸 Screenshots

<!-- Add your own screenshots here! -->
<!-- ![Main View](screenshots/main.png) -->
<!-- ![Popup Settings](screenshots/popup.png) -->

---

## 🚀 Installation

Since this extension isn't on the Chrome Web Store (yet), you install it manually as an "unpacked extension". It takes about 30 seconds:

### Step 1 — Download

```bash
git clone https://github.com/Leonxlnx/gemini-extension.git
```

Or click the green **Code** button on GitHub → **Download ZIP**, then unzip.

### Step 2 — Load in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Turn on **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `gemini-extension` folder you just downloaded
5. Done! You'll see the extension icon in your toolbar

### Step 3 — Open Gemini

Go to [gemini.google.com](https://gemini.google.com) — the new design applies automatically.

---

## 🎨 Customization

Click the extension icon in your Chrome toolbar to open the settings popup.

| Setting | What It Does |
|---|---|
| **Master Toggle** | Turn all custom backgrounds on or off |
| **Background** | Upload an image for the main page background |
| **Sidebar** | Upload an image for the left sidebar |
| **Input Field** | Upload an image for the chat input area |
| **Messages** | Upload an image for your sent message bubbles |
| **Darkness Sliders** | Adjust the dark overlay on each zone (0% = full image, 80% = very dark) |

**Tips:**

- Use high-resolution images (1920×1080 or larger) for the best look
- Dark, moody wallpapers work great since the UI elements are also dark
- The sidebar image will be cropped to fit the narrow panel — vertical images work best

---

## 📁 Project Structure

```
gemini-extension/
├── manifest.json      # Extension config (Manifest V3)
├── content.css        # All UI styling injected into Gemini
├── content.js         # Dynamic background/image logic
├── popup.html         # Settings popup layout
├── popup.css          # Settings popup styling
├── popup.js           # Settings popup logic (uploads, sliders, storage)
├── bg.webp            # Default background image
├── msg-bg.webp        # Default message/sidebar background
├── icon.svg           # Source icon
├── icon16.png         # Toolbar icon (16px)
├── icon48.png         # Extensions page icon (48px)
└── icon128.png        # Chrome Web Store icon (128px)
```

---

## 🔧 How It Works

1. **`content.css`** is injected at `document_start` — it applies all the visual restyling (floating sidebar, dark menus, Canvas panel theming) before the page even renders
2. **`content.js`** runs at `document_idle` — it loads your custom images from `chrome.storage.local`, applies them as CSS background images with darkness overlays, and uses a `MutationObserver` to re-apply styles when Gemini dynamically updates the DOM
3. **`popup.js`** handles the settings UI — image uploads are resized/converted to WebP, stored in `chrome.storage.local`, and a message is sent to the content script to refresh in real-time

---

## 🔄 Updating

When you pull new changes:

```bash
git pull origin main
```

Then go to `chrome://extensions` and click the **🔄 refresh icon** on the Gemini UI Redesign card. Reload any open Gemini tabs.

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. **Test** by loading the extension locally and checking Gemini in different states (sidebar open/closed, Canvas open/closed, different screens)
5. Commit: `git commit -m "feat: description of change"`
6. Push: `git push origin feature/my-feature`
7. Open a **Pull Request**

### Ideas for Contributions

- 🌈 More theme presets (light mode, accent colors)
- 📦 Chrome Web Store listing
- 🔲 Firefox / Edge support
- ⌨️ Keyboard shortcuts for toggling backgrounds
- 🎭 Multiple saved profiles / themes

---

## ⚠️ Known Limitations

- **Gemini updates may break things** — Google can change Gemini's DOM structure at any time. If something looks off after a Gemini update, open an issue.
- **Large images** — Chrome's `storage.local` has a ~10 MB quota. Very large images may fail to save. The extension automatically resizes uploads to keep them within limits.
- **No Firefox support** — This is Chrome/Chromium only for now (Manifest V3).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

<div align="center">

Made with ☕ by [Leon](https://github.com/Leonxlnx)

</div>
]]>
