
<div align="center">

<br>

<!-- TITLE BANNER -->
<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=6,11,20&height=160&text=%E2%99%94%20Chess%20Clock%20%E2%99%9A&fontSize=54&fontColor=ffffff&fontAlignY=50&desc=Professional%20%C2%B7%20High-Precision%20%C2%B7%20Zero%20Dependencies&descAlignY=68&descSize=16&descColor=c4b5fd" alt="Chess Clock" width="100%" />

<br>

<!-- TECH BADGES -->
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Web Audio](https://img.shields.io/badge/Web%20Audio%20API-8B5CF6?style=for-the-badge&logo=googlepodcasts&logoColor=white)

<br>

<!-- STATUS BADGES -->
![Status](https://img.shields.io/badge/Status-Live-22c55e?style=flat-square&logo=statuspage&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)
![Dependencies](https://img.shields.io/badge/Dependencies-Zero-f59e0b?style=flat-square)
![Mobile](https://img.shields.io/badge/Mobile-Ready-ec4899?style=flat-square&logo=android&logoColor=white)
![Theme](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-0ea5e9?style=flat-square)

<br><br>

> **🎯 Sub-millisecond timing. Beautiful dual-theme UI. Pure vanilla — no frameworks, no install, no fuss.**

<br>

</div>

---

## 🟣 &nbsp; Overview

Chess Clock is a browser-native tournament timer built on three focused ES6 classes. Drop `index.html` anywhere and it runs — offline, instantly, on any device.

Powered by `requestAnimationFrame` + `performance.now()` for drift-free precision. Wrapped in a polished UI with **dark/light themes**, **Web Audio sound effects**, **haptic feedback**, and **full keyboard navigation**.

---

## ⚡ &nbsp; Features

<br>

| &nbsp; | Feature | Details |
|:---:|---------|---------|
| ⏱️ | **High-Precision Engine** | `requestAnimationFrame` + `performance.now()` — drift-free, sub-ms |
| 🎮 | **5 Time Presets** | Bullet 1m · Blitz 5+3 · Rapid 15+10 · Classical 30+30 · Custom |
| 🔄 | **3 Increment Modes** | Fischer · Bronstein · None |
| 🌙 | **Dual Themes** | Dark & Light — instant toggle, persisted to `localStorage` |
| 🔊 | **Sound Effects** | Web Audio API — procedural click tones + timeout signal |
| 📳 | **Haptic Feedback** | Vibration API on every move switch (mobile) |
| ⌨️ | **Keyboard Control** | Full control — Space / P / R / T |
| 📱 | **Fully Responsive** | Fluid layout on desktop, tablet, and mobile |

---

## 🚀 &nbsp; Getting Started

```bash
git clone https://github.com/yourusername/chess-clock.git
cd chess-clock
```

**No install. No build. Just open:**

```bash
start index.html       # Windows
open index.html        # macOS
xdg-open index.html    # Linux
```

> Or double-click `index.html` — works 100% offline, no server needed.

---

## 🎯 &nbsp; How to Play

```
  ┌────────────────────────────────────────────────────────────────┐
  │                                                                │
  │  1  →  Select a preset   Bullet · Blitz · Rapid · Classical   │
  │  2  →  Tap either panel  starts the clock                      │
  │  3  →  After your move   tap YOUR panel to pass the clock      │
  │  4  →  00:00 reached     that player loses                     │
  │                                                                │
  └────────────────────────────────────────────────────────────────┘
```

### ⌨️ Keyboard Shortcuts

| Key | Action |
|:---:|--------|
| `Space` · `Enter` | Switch active player |
| `P` | Pause / Resume |
| `R` | Reset clock |
| `T` | Toggle dark / light theme |

---

## 🏗️ &nbsp; Architecture

```
chess-clock/
│
├── 📄 index.html      →  UI shell, semantic markup, ARIA labels
├── 🎨 styles.css      →  Design system — CSS custom properties, dual theme
└── ⚙️  app.js
    ├── GameState       →  State container  (status · player times · settings)
    ├── TimerEngine     →  rAF loop, Bronstein buffer, Fischer increment
    └── SoundManager    →  Web Audio API tone synthesizer
```

> `TimerEngine` uses delta-time per `requestAnimationFrame` tick. Bronstein delay runs as a separate buffer consumed _before_ the main countdown — no rounding drift, correct on every frame.

---

## 🛠️ &nbsp; Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🧱 Structure | **HTML5** | Semantic markup, ARIA accessibility |
| 🎨 Style | **CSS3** | Custom properties, Flexbox / Grid, animations |
| ⚙️ Logic | **Vanilla JS ES6+** | Classes, closures, `requestAnimationFrame` |
| 🔤 Fonts | **Orbitron + Inter** | Timer digits + UI text |
| 🔊 Audio | **Web Audio API** | Procedural click & timeout sounds |
| 💾 Storage | **localStorage** | Settings persist across sessions |
| ⏱️ Timing | **`performance.now()`** | High-resolution timestamp source |

---

## 🌐 &nbsp; Browser Support

| ![Chrome](https://img.shields.io/badge/Chrome-4285F4?style=flat-square&logo=googlechrome&logoColor=white) | ![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=flat-square&logo=firefox&logoColor=white) | ![Safari](https://img.shields.io/badge/Safari-000000?style=flat-square&logo=safari&logoColor=white) | ![Edge](https://img.shields.io/badge/Edge-0078D7?style=flat-square&logo=microsoftedge&logoColor=white) |
|:---:|:---:|:---:|:---:|
| 80+ ✅ | 75+ ✅ | 14+ ✅ | 80+ ✅ |

---

## 🗺️ &nbsp; Roadmap

- [ ] 📜 Move history with per-move timestamps
- [ ] 🏆 Tournament mode — multi-game score tracking
- [ ] 📲 PWA manifest — installable, full offline support
- [ ] ⏳ US Chess delay increment mode
- [ ] ♟️ Board-side panel view for OTB use

---

<div align="center">

<br>

<!-- FOOTER BANNER -->
<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=20,11,6&height=90&text=Every%20second%20counts.&fontSize=22&fontColor=c4b5fd&fontAlignY=55" alt="footer" width="100%" />

<br>

![Made with Love](https://img.shields.io/badge/Made%20with-♟%20%26%20Vanilla%20JS-6366f1?style=for-the-badge)
&nbsp;
![MIT](https://img.shields.io/badge/MIT-License-ec4899?style=for-the-badge)

<br>

</div>

