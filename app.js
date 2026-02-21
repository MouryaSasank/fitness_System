// ─────────────────────────────────────────────
// app.js — core game logic + streak + achievements + charts
// ─────────────────────────────────────────────

// ── Player skeleton ───────────────────────────
let player = {
    name: "Hunter",
    level: 1,
    xp: 0,
    stats: { str: 10, end: 10, agi: 10, vit: 10 },
    fatigue: 0,
    dailyQuests: [],
    lastQuestReset: null,
    // ── new fields ──
    streak: 0,
    bestStreak: 0,
    history: [],          // array of { date, questsDone }  — one entry per day cleared
    earnedAchievements: [] // array of achievement ids
};

// ── Bootstrap ─────────────────────────────────
function init() {
    registerServiceWorker();
    loadPlayerData();
    checkDailyReset();
    generateDailyQuests();
    checkAchievements();
    updateUI();
    renderQuests();
    renderAchievements();
    renderChart();
    showInstallBanner();
}

// ── Service Worker ────────────────────────────
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('SW registered'))
            .catch(e => console.warn('SW failed', e));
    }
}

// ── Persistence ───────────────────────────────
function loadPlayerData() {
    const saved = localStorage.getItem('soloFitnessPlayer');
    if (saved) {
        const data = JSON.parse(saved);
        // merge new fields so old saves don't break
        player = {
            ...player,
            ...data,
            stats: { ...player.stats, ...(data.stats || {}) }
        };
    } else {
        savePlayerData();
    }
}

function savePlayerData() {
    localStorage.setItem('soloFitnessPlayer', JSON.stringify(player));
}

// ── Daily reset ───────────────────────────────
function checkDailyReset() {
    const today = new Date().toDateString();

    if (player.lastQuestReset !== today) {
        // If yesterday was completed → streak continues, else break
        if (player.lastQuestReset !== null) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            const clearedYesterday = (player.history || []).some(h => h.date === yesterdayStr);
            if (clearedYesterday) {
                player.streak = (player.streak || 0) + 1;
            } else {
                player.streak = 0;
            }
            player.bestStreak = Math.max(player.bestStreak || 0, player.streak);
        }

        player.dailyQuests = [];
        player.lastQuestReset = today;
        player.fatigue = Math.max(0, player.fatigue - CONFIG.fatigueRecoveryPerDay);
        savePlayerData();
    }
}

// ── Quest generation ──────────────────────────
function generateDailyQuests() {
    if (player.dailyQuests.length > 0) return;

    const keys = Object.keys(QUEST_TYPES);
    const selected = [];

    // Difficulty distribution: 2 normal, 1 hard, 1 extreme
    const difficulties = ['normal', 'normal', 'hard', 'extreme'];

    for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * keys.length);
        const t = QUEST_TYPES[keys[idx]];
        const difficulty = difficulties[i];
        const tier = DIFFICULTY_TIERS[difficulty];
        const diff = Math.floor(t.baseDifficulty * (1 + (player.level - 1) * 0.1));
        const xpReward = Math.floor(t.xpReward * tier.multiplier);

        selected.push({
            id: t.id + '_' + Date.now() + '_' + i,
            type: t.id,
            name: t.name,
            icon: t.icon,
            difficulty: diff,
            difficultyTier: difficulty,
            xpReward: xpReward,
            fatigueRegen: t.fatigueRegen,
            statBonus: t.statBonus,
            completed: false
        });
        keys.splice(idx, 1);
    }

    player.dailyQuests = selected;
    savePlayerData();
}

// ── Complete a quest ──────────────────────────
function completeQuest(questId) {
    const quest = player.dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    quest.completed = true;

    // streak bonus
    let totalXP = quest.xpReward;
    if (player.streak > 0) totalXP += CONFIG.streakBonusXP;

    showXPGain(totalXP);

    setTimeout(() => {
        player.xp += totalXP;
        player.fatigue = Math.min(CONFIG.maxFatigue, player.fatigue + quest.fatigueRegen);

        // log to history when all 4 done
        if (player.dailyQuests.every(q => q.completed)) {
            const today = new Date().toDateString();
            if (!(player.history || []).some(h => h.date === today)) {
                player.history = player.history || [];
                player.history.push({ date: today, questsDone: 4 });
            }
            // streak: first day ever counts as streak 1
            if (player.streak === 0) {
                player.streak = 1;
                player.bestStreak = Math.max(player.bestStreak || 0, 1);
            }
        }

        checkLevelUp();
        checkAchievements();
        savePlayerData();
        updateUI();
        renderQuests();
        renderAchievements();
        renderChart();
    }, 300);
}

// ── XP notification ───────────────────────────
function showXPGain(amt) {
    const el = document.getElementById('xpGainNotif');
    el.textContent = `+${amt} XP`;
    el.classList.remove('hidden');
    // restart animation
    void el.offsetWidth;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 1100);
}

// ── Level up ──────────────────────────────────
function checkLevelUp() {
    const maxXP = CONFIG.xpCurve(player.level);
    if (player.xp < maxXP) return;

    const oldStats = { ...player.stats };
    const oldRank = getCurrentRank();

    player.level++;
    player.xp -= maxXP;
    player.stats.str += CONFIG.statIncreasePerLevel;
    player.stats.end += CONFIG.statIncreasePerLevel;
    player.stats.agi += CONFIG.statIncreasePerLevel;
    player.stats.vit += CONFIG.statIncreasePerLevel;

    const newRank = getCurrentRank();
    showLevelUpNotification(oldStats, oldRank.name !== newRank.name);

    setTimeout(() => checkLevelUp(), 100);
}

function showLevelUpNotification(oldStats, rankedUp) {
    document.getElementById('levelUpNumber').textContent = player.level;

    let html = '';
    ['str', 'end', 'agi', 'vit'].forEach(s => {
        html += `<div class="stat-increase">${s.toUpperCase()}: ${oldStats[s]} → ${player.stats[s]}</div>`;
    });
    if (rankedUp) {
        const r = getCurrentRank();
        html += `<div class="rank-up-line" style="color:${r.color}">⭐ RANK UP: ${r.name} ⭐</div>`;
    }
    document.getElementById('levelUpStats').innerHTML = html;
    document.getElementById('levelUpOverlay').classList.remove('hidden');
}

function closeLevelUp() {
    document.getElementById('levelUpOverlay').classList.add('hidden');
    updateUI();
}

// ── Achievements ──────────────────────────────
function checkAchievements() {
    let newlyEarned = [];
    ACHIEVEMENTS.forEach(a => {
        if (player.earnedAchievements.includes(a.id)) return;
        if (a.check(player)) {
            player.earnedAchievements.push(a.id);
            newlyEarned.push(a);
        }
    });
    if (newlyEarned.length) {
        savePlayerData();
        // show first new one after a short delay
        setTimeout(() => showAchievementPopup(newlyEarned[0]), 800);
    }
}

function showAchievementPopup(ach) {
    const colors = RARITY_COLORS[ach.rarity];
    const el = document.getElementById('achievementPopup');
    el.querySelector('.ach-pop-icon').textContent = ach.icon;
    el.querySelector('.ach-pop-name').textContent = ach.name;
    el.querySelector('.ach-pop-desc').textContent = ach.desc;
    el.querySelector('.ach-pop-rarity').textContent = ach.rarity.toUpperCase();
    el.querySelector('.ach-pop-rarity').style.color = colors.text;
    el.style.border = `1px solid ${colors.border}`;
    el.style.boxShadow = `0 0 20px ${colors.glow}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3200);
}

// ── Render achievements grid ──────────────────
function renderAchievements() {
    const container = document.getElementById('achievementsGrid');
    container.innerHTML = '';

    // sort: earned first, then locked
    const sorted = [...ACHIEVEMENTS].sort((a, b) => {
        const ae = player.earnedAchievements.includes(a.id) ? 0 : 1;
        const be = player.earnedAchievements.includes(b.id) ? 0 : 1;
        return ae - be;
    });

    sorted.forEach(a => {
        const earned = player.earnedAchievements.includes(a.id);
        const colors = RARITY_COLORS[a.rarity];
        const card = document.createElement('div');
        card.className = 'ach-card' + (earned ? ' earned' : ' locked');
        card.style.background = earned ? colors.bg : 'rgba(30,30,40,0.6)';
        card.style.border = `1px solid ${earned ? colors.border : '#3a3a4a'}`;
        if (earned) card.style.boxShadow = `0 0 10px ${colors.glow}`;

        card.innerHTML = `
            <div class="ach-icon">${earned ? a.icon : '🔒'}</div>
            <div class="ach-name" style="color:${earned ? colors.text : '#888'}">${a.name}</div>
            <div class="ach-desc">${earned ? a.desc : '???'}</div>
            <div class="ach-rarity-tag" style="color:${earned ? colors.text : '#555'}">${a.rarity.toUpperCase()}</div>
        `;
        container.appendChild(card);
    });

    // update counter
    document.getElementById('achCounter').textContent =
        player.earnedAchievements.length + ' / ' + ACHIEVEMENTS.length;
}

// ── Render progress chart (canvas) ────────────
function renderChart() {
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;
    ctx.clearRect(0, 0, w, h);

    // ── build 30-day data ──
    const days = 30;
    const buckets = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        buckets.push({ label: d.getDate().toString(), done: 0 });
    }
    (player.history || []).forEach(entry => {
        const entryDate = new Date(entry.date);
        const today = new Date();
        const diff = Math.round((today - entryDate) / 86400000);
        if (diff < days) buckets[days - 1 - diff].done = entry.questsDone;
    });

    const pad = { top: 18, right: 12, bottom: 28, left: 28 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const barW = cw / days;
    const maxVal = 4;

    // ── grid lines ──
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + ch - (ch / maxVal) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    }

    // ── bars ──
    buckets.forEach((b, i) => {
        const x = pad.left + i * barW;
        const barH = (b.done / maxVal) * ch;
        const y = pad.top + ch - barH;

        if (b.done > 0) {
            const grad = ctx.createLinearGradient(0, y, 0, y + barH);
            grad.addColorStop(0, '#00d4ff');
            grad.addColorStop(1, '#0066aa');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x + barW * 0.15, y, barW * 0.7, barH, 2);
            ctx.fill();
        }
    });

    // ── x-axis labels (every 5 days) ──
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    buckets.forEach((b, i) => {
        if (i % 5 === 0) {
            ctx.fillText(b.label, pad.left + i * barW + barW / 2, h - pad.bottom + 14);
        }
    });

    // ── y-axis labels ──
    ctx.textAlign = 'right';
    for (let i = 0; i <= maxVal; i++) {
        const y = pad.top + ch - (ch / maxVal) * i;
        ctx.fillText(i.toString(), pad.left - 6, y + 3);
    }
}

// ── Render quest cards ────────────────────────
function renderQuests() {
    const container = document.getElementById('questsList');
    container.innerHTML = '';

    const allDone = player.dailyQuests.length === 4 && player.dailyQuests.every(q => q.completed);

    if (allDone) {
        container.innerHTML = `<p class="all-complete">✅ All quests completed! Return tomorrow.</p>`;
        return;
    }

    player.dailyQuests.forEach(quest => {
        const unit = (quest.type === 'plank' || quest.type === 'run') ? 'sec' : 'reps';
        const tier = DIFFICULTY_TIERS[quest.difficultyTier || 'normal'];
        const streakBonus = player.streak > 0 ? CONFIG.streakBonusXP : 0;

        const card = document.createElement('div');
        card.className = 'quest-card' + (quest.completed ? ' completed' : '');
        card.innerHTML = `
            <div class="quest-top">
                <span class="quest-icon">${quest.icon || '🏋️'}</span>
                <span class="quest-name">${quest.name}</span>
                <span class="difficulty-badge" style="
                    background: ${tier.color}22;
                    border: 1px solid ${tier.color};
                    color: ${tier.color};
                    box-shadow: 0 0 10px ${tier.glow};
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1px;
                ">${tier.icon} ${tier.name}</span>
            </div>
            <div class="quest-target">
                <span class="qt-label">TARGET</span>
                <span class="qt-val">${quest.difficulty} ${unit}</span>
            </div>
            <div class="quest-reward" style="text-align: center; margin: 8px 0; font-size: 14px; font-weight: 600;">
                <span class="quest-xp" style="color: ${tier.color};">+${quest.xpReward}${streakBonus ? ` <span style="color:#ffa500;font-size:11px">(+${streakBonus} streak)</span>` : ''} XP</span>
            </div>
            <button class="quest-btn ${quest.completed ? 'done' : ''}"
                    onclick="completeQuest('${quest.id}')"
                    ${quest.completed ? 'disabled' : ''}>
                ${quest.completed ? '✓ COMPLETED' : 'COMPLETE'}
            </button>
        `;
        container.appendChild(card);
    });
}

// ── Main UI update ────────────────────────────
function updateUI() {
    document.getElementById('playerLevel').textContent = player.level;

    const rank = getCurrentRank();
    const badge = document.getElementById('rankBadge');
    badge.textContent = rank.name;
    badge.style.background = `linear-gradient(135deg, ${rank.color}, ${adjustColor(rank.color, -30)})`;
    badge.style.boxShadow = `0 0 18px ${rank.color}88`;

    // XP bar
    const maxXP = CONFIG.xpCurve(player.level);
    const pct = (player.xp / maxXP) * 100;
    document.getElementById('xpBar').style.width = pct + '%';
    document.getElementById('currentXP').textContent = player.xp;
    document.getElementById('maxXP').textContent = maxXP;

    // Stats
    ['str', 'end', 'agi', 'vit'].forEach(s => {
        animateStat('stat' + s.charAt(0).toUpperCase() + s.slice(1), player.stats[s]);
    });

    // Fatigue
    const fatPct = (player.fatigue / CONFIG.maxFatigue) * 100;
    document.getElementById('fatigueBar').style.width = fatPct + '%';
    document.getElementById('fatigueValue').textContent = Math.floor(player.fatigue);

    // Streak display
    document.getElementById('streakValue').textContent = player.streak || 0;
    document.getElementById('bestStreakValue').textContent = player.bestStreak || 0;
    // streak fire size
    const streakEl = document.getElementById('streakFire');
    streakEl.style.fontSize = (player.streak > 0) ? (16 + Math.min(player.streak, 30) * 0.8) + 'px' : '18px';
}

function animateStat(elId, val) {
    const el = document.getElementById(elId);
    if (parseInt(el.textContent) !== val) {
        el.classList.add('increase');
        setTimeout(() => el.classList.remove('increase'), 600);
    }
    el.textContent = val;
}

// ── Tab navigation ────────────────────────────
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');

    if (tabId === 'progress') renderChart();
}

// ── Install banner (iOS) ──────────────────────
function showInstallBanner() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
        document.getElementById('installBanner').classList.remove('hidden');
    }
    document.getElementById('installClose').addEventListener('click', () => {
        document.getElementById('installBanner').classList.add('hidden');
    });
}

// ── Helpers ───────────────────────────────────
function getCurrentRank() {
    for (let i = CONFIG.ranks.length - 1; i >= 0; i--) {
        if (player.level >= CONFIG.ranks[i].minLevel) return CONFIG.ranks[i];
    }
    return CONFIG.ranks[0];
}

function adjustColor(color, pct) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * pct);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// ── Edit Player Name ─────────────────────────
function editPlayerName() {
    const current = player.name || 'Hunter';
    const newName = prompt('Enter your Hunter name:', current);
    if (newName && newName.trim().length > 0 && newName.trim().length <= 20) {
        player.name = newName.trim();
        document.getElementById('playerName').textContent = player.name;
        savePlayerData();
        if (SoundManager) SoundManager.click();
    }
}

// ── Daily Motivational Quotes ─────────────────
const QUOTES = [
    'Arise, Hunter.',
    'The weak exist to be dominated.',
    'I alone level up.',
    'Only the strongest survive the dungeon.',
    'Every rep brings you closer to S-Rank.',
    'Pain is temporary. Glory is eternal.',
    'The System has chosen you.',
    'Shadows obey only the powerful.',
    'You are the weapon. Train accordingly.',
    'Doubt kills more than failure.',
    'Become the monster they fear.',
    'Your body is your most powerful skill.',
    'No days off in the Shadow Realm.',
    'One more set. One more rank.',
    'The quest log never sleeps.',
];

function showDailyQuote() {
    const el = document.getElementById('dailyQuote');
    if (!el) return;
    const today = new Date().getDay();
    el.textContent = QUOTES[today % QUOTES.length];
}

// ── Daily Reset Countdown ─────────────────────
function startResetCountdown() {
    function update() {
        const el = document.getElementById('resetTimer');
        if (!el) return;
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const diff = midnight - now;
        const hh = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        el.textContent = '\u23F1 ' + hh + ':' + mm + ':' + ss;
    }
    update();
    setInterval(update, 1000);
}

// ── PWA Install Prompt (Chrome/Edge/Android) ──
let deferredPWAPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPWAPrompt = e;
    // Show install banner (non-iOS)
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.classList.remove('hidden');
    // Show button in settings
    const sec = document.getElementById('settingsInstallSection');
    if (sec) sec.style.display = 'block';
});

async function triggerPWAInstall() {
    if (!deferredPWAPrompt) return;
    deferredPWAPrompt.prompt();
    const { outcome } = await deferredPWAPrompt.userChoice;
    deferredPWAPrompt = null;
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.classList.add('hidden');
    const sec = document.getElementById('settingsInstallSection');
    if (sec) sec.style.display = 'none';
    if (outcome === 'accepted') showSystemMessage('APP INSTALLED!', 2000);
}

window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.classList.add('hidden');
});

function initInstallBanners() {
    // Non-iOS install button
    const pwaBtn = document.getElementById('pwaInstallBtn');
    if (pwaBtn) pwaBtn.addEventListener('click', triggerPWAInstall);

    const pwaClose = document.getElementById('pwaInstallClose');
    if (pwaClose) pwaClose.addEventListener('click', () => {
        document.getElementById('pwaInstallBanner').classList.add('hidden');
    });

    // Settings install button
    const settingsBtn = document.getElementById('settingsInstallBtn');
    if (settingsBtn) settingsBtn.addEventListener('click', () => {
        closeSettings();
        triggerPWAInstall();
    });

    // iOS banner
    const iosClose = document.getElementById('iosInstallClose');
    if (iosClose) iosClose.addEventListener('click', () => {
        document.getElementById('iosInstallBanner').classList.add('hidden');
    });
}

// ── Debug helpers (console only) ──────────────
function forceNewDay() {
    player.lastQuestReset = 'Manual Reset';
    player.dailyQuests = [];
    player.fatigue = Math.max(0, player.fatigue - CONFIG.fatigueRecoveryPerDay);
    savePlayerData();
    location.reload();
}
function addXP(n) { player.xp += n; savePlayerData(); checkLevelUp(); updateUI(); }

// ── Particle Effects System ────────────────────
function createParticles(x, y, count = 20, color = '#00d4ff') {
    const container = document.getElementById('particleContainer');

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle burst';

        // Random angle and distance
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);

        // Remove after animation
        setTimeout(() => particle.remove(), 800);
    }
}

function createFloatingParticles(x, y, count = 10, color = '#fbbf24') {
    const container = document.getElementById('particleContainer');

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        particle.style.animationDelay = (Math.random() * 0.3) + 's';

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1500);
    }
}

// ── System Message ────────────────────────────
function showSystemMessage(text, duration = 2000) {
    const el = document.getElementById('systemMessage');
    const textEl = document.getElementById('systemMessageText');

    textEl.textContent = text;
    el.classList.remove('hidden');

    setTimeout(() => {
        el.classList.add('hidden');
    }, duration);
}

// ── Enhanced Quest Completion ─────────────────
const originalCompleteQuest = completeQuest;
window.completeQuest = function (questId) {
    const quest = player.dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    // Create particles at button location
    const btn = event?.target;
    if (btn) {
        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        createParticles(x, y, 25, '#00d4ff');
    }

    // Show system message
    setTimeout(() => {
        showSystemMessage(`QUEST COMPLETED!\n+${quest.xpReward} XP`);
    }, 200);

    // Call original function
    originalCompleteQuest(questId);
};

// ── Daily Login Rewards ───────────────────────
function checkDailyLogin() {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('lastLoginDate');

    if (lastLogin !== today) {
        localStorage.setItem('lastLoginDate', today);

        // Give login reward
        const reward = 50;
        player.xp += reward;
        savePlayerData();

        setTimeout(() => {
            showSystemMessage(`DAILY LOGIN BONUS\n+${reward} XP`, 2500);

            // Center screen particles
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            createFloatingParticles(centerX, centerY, 15, '#fbbf24');
        }, 500);
    }
}

// ── Enhanced Level Up with Particles ──────────
const originalShowLevelUp = showLevelUpNotification;
window.showLevelUpNotification = function (oldStats, rankedUp) {
    // Create massive particle burst
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    createParticles(centerX, centerY, 50, '#fbbf24');

    if (rankedUp) {
        setTimeout(() => {
            createParticles(centerX, centerY, 40, '#8b5cf6');
        }, 300);
    }

    originalShowLevelUp(oldStats, rankedUp);
};

// ── Enhanced Init with Daily Login ───────────
const originalInit = init;
window.init = function () {
    originalInit();
    checkDailyLogin();
    updateSoundToggleUI();
    showDailyQuote();
    startResetCountdown();
    initInstallBanners();
    // Update player name from saved data
    if (player.name) document.getElementById('playerName').textContent = player.name;
    // Show iOS install banner if needed
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
        document.getElementById('iosInstallBanner').classList.remove('hidden');
    }
};

// ── Settings Panel ────────────────────────────
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
    if (SoundManager) SoundManager.click();
}

function closeSettings() {
    document.getElementById('settingsPanel').classList.add('hidden');
    if (SoundManager) SoundManager.click();
}

function toggleSound() {
    if (SoundManager) {
        const enabled = SoundManager.toggle();
        updateSoundToggleUI();
    }
}

function updateSoundToggleUI() {
    const btn = document.getElementById('soundToggle');
    if (btn && SoundManager) {
        btn.textContent = SoundManager.enabled ? 'ON' : 'OFF';
        btn.classList.toggle('active', SoundManager.enabled);
    }
}

// ── Integrate Sound Effects ───────────────────
const originalCompleteQuestEnhanced = window.completeQuest;
window.completeQuest = function (questId) {
    if (SoundManager) SoundManager.questComplete();
    originalCompleteQuestEnhanced(questId);
};

const originalShowLevelUpEnhanced = window.showLevelUpNotification;
window.showLevelUpNotification = function (oldStats, rankedUp) {
    if (SoundManager) SoundManager.levelUp();
    originalShowLevelUpEnhanced(oldStats, rankedUp);
};

const originalShowAchievement = showAchievementPopup;
window.showAchievementPopup = function (ach) {
    if (SoundManager) SoundManager.achievement();
    originalShowAchievement(ach);
};

// ── GO ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
