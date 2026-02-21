# Copilot / AI Agent Instructions for Solo Fitness System 🚀

Purpose
- Short: Help an AI coding agent become productive quickly by documenting the app's structure, patterns, and concrete change/testing guidance.

Big picture (read first)
- This is a small, client-only PWA (no backend). The app is a single-page app: `index.html` loads `data.js` then `app.js` and `style.css`.
- `data.js` contains game constants and quest definitions (`CONFIG`, `QUEST_TYPES`). `app.js` contains core logic, UI rendering, and persistence. `manifest.json` makes it installable.
- State flow: constants & quest templates (data.js) -> daily quests generated in `app.js` -> `player` state persisted to `localStorage` under key `soloFitnessPlayer`.

Key files to inspect
- `data.js` — **CONFIG** (xpCurve, ranks, baseStats, fatigue settings) and **QUEST_TYPES** (quest templates like `pushups`, `squats`, `plank`, `run`).
- `app.js` — game state (`player`), `init()`, `generateDailyQuests()`, `completeQuest()`, `checkLevelUp()`, UI renderers (`renderQuests()`, `updateUI()`).
- `index.html` — DOM ids used by the app (e.g., `playerLevel`, `xpBar`, `fatigueBar`, `levelUpOverlay`) and script load order (important: `data.js` must load before `app.js`).
- `style.css` — styling and animation patterns for overlays, badges, buttons.

Project-specific conventions & gotchas ⚠️
- Global state: `player` is a global plain object saved directly to `localStorage`. Avoid breaking its shape without migration logic.
- Quest IDs are generated as: `questTemplate.id + '_' + Date.now() + '_' + i` (timestamp-based, unique). Tests should not rely on deterministic IDs.
- Daily reset relies on `Date.prototype.toDateString()` compared to `player.lastQuestReset` — timezone/local-date logic is intentionally simple.
- Units: `getQuestUnit()` returns `'seconds'` for `plank` and `run`, otherwise `'reps'`. If adding time-based quests, update this mapping.
- Ranks & leveling: `CONFIG.xpCurve(level)` and `CONFIG.statIncreasePerLevel` are the canonical places to change progression.

How to add a new quest (concrete example)
- Add to `QUEST_TYPES` in `data.js`:
  {
    id: 'burpees', name: 'Burpees', description: 'Complete the required reps', baseDifficulty: 20, xpReward: 30, fatigueRegen: 18, statBonus: 'str'
  }
- If it needs different unit (seconds vs reps), update `getQuestUnit()` in `app.js`.
- Save and test by loading the page and checking `player.dailyQuests` (console or UI).

Persistence & safe schema changes (important)
- There is no version field in `player`. When changing the saved structure, add migration code in `loadPlayerData()` to detect old shapes and set defaults. Example:
  const saved = JSON.parse(localStorage.getItem('soloFitnessPlayer') || '{}');
  if (!saved.stats) saved.stats = {...CONFIG.baseStats};
  // then assign to `player` and save back.

Run / debug / test guidance ✅
- No build step — open `index.html` directly or serve via a static server for PWA behavior:
  - Quick dev server: `npx http-server` or `python -m http.server 8000`
- Useful console helpers (call from DevTools):
  - `addXP(50)` — artificially add XP (exists in `app.js`).
  - `forceNewDay()` — forces the daily reset behavior.
  - Inspect `localStorage.getItem('soloFitnessPlayer')` to verify persistence.
- Console logs to watch: "Player data loaded:", "New player created", "Daily quests generated:", "Quest completed: ..."

Integration & external deps
- None. This is pure frontend — no package.json, no CI scripts in this repo.
- Because it's static, changes should be testable locally in the browser.

Testing checklist for small changes
1. Open the app in a browser (served or file://). 2. Verify UI elements update (level, xp bar, fatigue bar). 3. Use console helpers (`addXP`, `forceNewDay`) to exercise branches. 4. Complete a quest and confirm `player` persisted in `localStorage` and logs appear.

If something's unclear or incomplete
- Tell me which behaviors you'd like more detail on (e.g., how quests scale, persistence edge-cases, PWA install/debug steps) and I will iterate on this file.

---

Thanks — want me to add short examples for migrations or a small unit-testing checklist next? ✨
