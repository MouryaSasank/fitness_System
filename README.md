# SYSTEM — Solo Fitness

> "Arise, Hunter."

A Solo Leveling-inspired fitness tracker PWA that turns your daily workouts and habits into an RPG progression system. Complete quests, earn XP, level up, unlock achievements, and collect loot drops — all while building real-life discipline.

![Version](https://img.shields.io/badge/version-v3.1%20Premium-00d4ff?style=for-the-badge&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-00ff88?style=for-the-badge&logoColor=black)

---

## Features

### Quest System
- **Daily Quests** — Curated fitness, habit, and intellect quests that reset every day at midnight
- **Custom Quests** — Create your own quests with a name, target/duration, difficulty (Normal / Hard / Extreme), and skill type (Fitness / Intellect / Habit)
- **Difficulty Scaling** — Harder quests award more XP and have a higher chance of dropping loot

### RPG Progression
- **XP & Leveling** — Earn XP by completing quests; level up to grow stronger
- **Stats** — Track four core stats: STR (Strength), END (Endurance), AGI (Agility), VIT (Vitality)
- **Rank System** — Progress through ranks from E to S as you level up
- **Fatigue Bar** — Overtraining fills the fatigue bar; manage it wisely
- **Streak Counter** — Track your daily completion streak and personal best

### Inventory & Loot Drops
- Random loot drops are awarded on quest completion
- Items have rarity tiers: Common, Rare, Epic, Legendary
- View your collected gear in the Inventory tab

### Achievements
- Unlock achievements for milestones such as streaks, levels reached, and total quests completed
- Achievement popups with rarity-coloured notifications
- Share achievements directly from the app via the Web Share API

### Progress Chart
- Visual 30-day history chart showing quests completed per day
- Lightweight canvas-based renderer — no external chart library needed

### Data & Settings
- Export / Import your save data as JSON for backup across devices
- Sound effects toggle
- All data persisted in `localStorage` — no server or account required

### Progressive Web App
- Installable on Android, iOS (Add to Home Screen), and desktop browsers
- Full offline support via Service Worker
- App shortcuts for Daily Quests and Progress from the home screen icon
- Custom splash screens and theme colour for a native-app feel

---

## Project Structure

```
fitness-system/
├── index.html          # App shell — all UI markup and overlays
├── style.css           # Full styling: dark theme, animations, layout
├── app.js              # Core game logic: XP, leveling, quests, stats, UI
├── data.js             # Static data: quest pool, achievements, loot tables, quotes
├── sounds.js           # Web Audio API sound effects engine
├── mobile-features.js  # PWA install banner, haptic feedback, mobile UX
├── profile.js          # Player name editing and profile helpers
├── share.js            # Web Share API integration for achievements
├── sw.js               # Service Worker — offline caching strategy
├── manifest.json       # PWA Web App Manifest
└── icon.jpg            # App icon
```

---

## Getting Started

Because this is a plain HTML/CSS/JS app with a Service Worker, you need a local HTTP server — Service Workers do not work on the `file://` protocol.

**Option 1 — VS Code Live Server**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` and select **Open with Live Server**

**Option 2 — Node.js**
```bash
npx http-server . -p 8080
# Then open http://localhost:8080
```

**Option 3 — Python**
```bash
python -m http.server 8080
# Then open http://localhost:8080
```

### Installing as a PWA

| Platform | Steps |
|---|---|
| Android (Chrome) | Open the app, then tap the install banner or use the browser menu > Add to Home screen |
| iOS (Safari) | Open the app, tap Share, then Add to Home Screen |
| Desktop (Chrome / Edge) | Click the install icon in the address bar |

---

## Live Demo

Deployed via GitHub Pages:
**[https://mouryasasank.github.io/fitness_System](https://mouryasasank.github.io/fitness_System)**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | Vanilla CSS3 (custom properties, animations, grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts — Orbitron, Rajdhani |
| Offline | Service Worker (cache-first strategy) |
| Storage | localStorage |
| PWA | Web App Manifest + Service Worker |
| Audio | Web Audio API |
| Sharing | Web Share API |
| Deployment | GitHub Pages + GitHub Actions |

---

## Contributing

Feel free to fork the project and make it your own.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push and open a Pull Request

---

Built by [MouryaSasank](https://github.com/MouryaSasank) — Inspired by Solo Leveling.
