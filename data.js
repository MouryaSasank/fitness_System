// ─────────────────────────────────────────────
// data.js — CONFIG, QUESTS, ACHIEVEMENTS
// ─────────────────────────────────────────────

const CONFIG = {
    xpCurve: (level) => Math.floor(100 * Math.pow(1.15, level - 1)),

    ranks: [
        { name: 'E', minLevel: 1, color: '#ff6b00' },
        { name: 'D', minLevel: 10, color: '#ffa500' },
        { name: 'C', minLevel: 25, color: '#ffdd00' },
        { name: 'B', minLevel: 45, color: '#00ff00' },
        { name: 'A', minLevel: 70, color: '#00d4ff' },
        { name: 'S', minLevel: 100, color: '#ff00ff' }
    ],

    baseStats: { str: 10, end: 10, agi: 10, vit: 10 },
    statIncreasePerLevel: 2,

    maxFatigue: 100,
    fatiguePerQuest: 15,
    fatigueRecoveryPerDay: 30,

    streakBonusXP: 15
};

// ── Items & Drops ─────────────────────────────
const ITEMS = {
    venom_fang: {
        id: 'venom_fang', name: "Kasaka's Venom Fang", icon: '🗡️',
        description: '+15 STR temporarily (Instant XP Boost)',
        rarity: 'epic',
        type: 'xp',
        value: 50,
        color: '#8b5cf6'
    },
    elixir_life: {
        id: 'elixir_life', name: "Elixir of Life", icon: '🧪',
        description: 'Fully restores Fatigue instantly',
        rarity: 'rare',
        type: 'fatigue',
        value: 100,
        color: '#00ff88'
    },
    shadow_crystal: {
        id: 'shadow_crystal', name: "Shadow Crystal", icon: '🔮',
        description: 'Grants a burst of pure EXP',
        rarity: 'legendary',
        type: 'xp',
        value: 150,
        color: '#f0c040'
    },
    muscle_stimulant: {
        id: 'muscle_stimulant', name: "Hunter Stimulant", icon: '💊',
        description: '+25 XP, Minor Fatigue recovery',
        rarity: 'common',
        type: 'mixed',
        xpValue: 25,
        fatigueValue: 15,
        color: '#cccccc'
    }
};

// ── Quest pool ────────────────────────────────
const QUEST_TYPES = {
    pushups: {
        id: 'pushups', name: 'Push-ups', icon: '🤸',
        description: 'Complete the required reps',
        baseDifficulty: 10, xpReward: 30, fatigueRegen: 15, statBonus: 'str'
    },
    squats: {
        id: 'squats', name: 'Squats', icon: '🦵',
        description: 'Complete the required reps',
        baseDifficulty: 15, xpReward: 30, fatigueRegen: 15, statBonus: 'end'
    },
    plank: {
        id: 'plank', name: 'Plank Hold', icon: '⏱️',
        description: 'Hold for required time',
        baseDifficulty: 30, xpReward: 25, fatigueRegen: 10, statBonus: 'vit'
    },
    jumping_jacks: {
        id: 'jumping_jacks', name: 'Jumping Jacks', icon: '🙌',
        description: 'Complete the required reps',
        baseDifficulty: 20, xpReward: 20, fatigueRegen: 12, statBonus: 'agi'
    },
    run: {
        id: 'run', name: 'Cardio Sprint', icon: '🏃',
        description: 'Run in place',
        baseDifficulty: 60, xpReward: 35, fatigueRegen: 20, statBonus: 'end'
    }
};

// ── Quest Difficulty Tiers ────────────────────
const DIFFICULTY_TIERS = {
    normal: {
        name: 'NORMAL',
        color: '#00d4ff',
        glow: 'rgba(0, 212, 255, 0.4)',
        multiplier: 1.0,
        icon: '⚔️'
    },
    hard: {
        name: 'HARD',
        color: '#8b5cf6',
        glow: 'rgba(139, 92, 246, 0.4)',
        multiplier: 1.5,
        icon: '⚡'
    },
    extreme: {
        name: 'EXTREME',
        color: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.4)',
        multiplier: 2.0,
        icon: '💀'
    }
};

// ── Achievements ──────────────────────────────
const ACHIEVEMENTS = [
    // First Steps
    {
        id: 'first_quest',
        name: 'First Step',
        desc: 'Complete your very first quest.',
        icon: '👣',
        rarity: 'common',
        check: (p) => (p.history || []).length >= 1
    },
    {
        id: 'first_day_clear',
        name: 'Day One',
        desc: 'Clear all 4 quests in a single day.',
        icon: '🗓️',
        rarity: 'common',
        check: (p) => p.dailyQuests.length === 4 && p.dailyQuests.every(q => q.completed)
    },
    // Streaks
    {
        id: 'streak_3',
        name: 'Hat Trick',
        desc: 'Reach a 3-day streak.',
        icon: '🔥',
        rarity: 'common',
        check: (p) => (p.streak || 0) >= 3
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        desc: 'Reach a 7-day streak.',
        icon: '⚡',
        rarity: 'rare',
        check: (p) => (p.streak || 0) >= 7
    },
    {
        id: 'streak_14',
        name: 'Fortnight Fighter',
        desc: 'Reach a 14-day streak.',
        icon: '🌟',
        rarity: 'rare',
        check: (p) => (p.streak || 0) >= 14
    },
    {
        id: 'streak_30',
        name: 'Iron Will',
        desc: 'Reach a 30-day streak.',
        icon: '💎',
        rarity: 'legendary',
        check: (p) => (p.streak || 0) >= 30
    },
    // Levels
    {
        id: 'level_5',
        name: 'Rising',
        desc: 'Reach level 5.',
        icon: '📈',
        rarity: 'common',
        check: (p) => p.level >= 5
    },
    {
        id: 'level_10',
        name: 'Rank D Unlocked',
        desc: 'Reach level 10.',
        icon: '🥉',
        rarity: 'common',
        check: (p) => p.level >= 10
    },
    {
        id: 'level_25',
        name: 'Rank C Unlocked',
        desc: 'Reach level 25.',
        icon: '🥈',
        rarity: 'rare',
        check: (p) => p.level >= 25
    },
    {
        id: 'level_50',
        name: 'Halfway Legend',
        desc: 'Reach level 50.',
        icon: '🏅',
        rarity: 'epic',
        check: (p) => p.level >= 50
    },
    {
        id: 'level_100',
        name: 'Rank S Unlocked',
        desc: 'Reach the legendary level 100.',
        icon: '👑',
        rarity: 'legendary',
        check: (p) => p.level >= 100
    },
    // Quest count (total quests ever done)
    {
        id: 'quests_10',
        name: 'Warm Up',
        desc: 'Complete 10 total quests.',
        icon: '💪',
        rarity: 'common',
        check: (p) => (p.history || []).length >= 10
    },
    {
        id: 'quests_50',
        name: 'Grinder',
        desc: 'Complete 50 total quests.',
        icon: '⚙️',
        rarity: 'rare',
        check: (p) => (p.history || []).length >= 50
    },
    {
        id: 'quests_100',
        name: 'Century',
        desc: 'Complete 100 total quests.',
        icon: '🎯',
        rarity: 'epic',
        check: (p) => (p.history || []).length >= 100
    },
    // Stat milestones
    {
        id: 'stat_str_30',
        name: 'Strong Arms',
        desc: 'Raise STR to 30.',
        icon: '💪',
        rarity: 'rare',
        check: (p) => p.stats.str >= 30
    },
    {
        id: 'stat_agi_30',
        name: 'Quick Feet',
        desc: 'Raise AGI to 30.',
        icon: '🏃',
        rarity: 'rare',
        check: (p) => p.stats.agi >= 30
    },
    // Best streak ever
    {
        id: 'best_streak_7',
        name: 'Streak Master',
        desc: 'Have a best-ever streak of 7 days.',
        icon: '🔥',
        rarity: 'epic',
        check: (p) => (p.bestStreak || 0) >= 7
    }
];

// Rarity colours used in the UI
const RARITY_COLORS = {
    common: { bg: 'rgba(100,100,100,0.25)', border: '#aaaaaa', glow: 'rgba(170,170,170,0.4)', text: '#cccccc' },
    rare: { bg: 'rgba(30,80,180,0.25)', border: '#4a9eff', glow: 'rgba(74,158,255,0.4)', text: '#4a9eff' },
    epic: { bg: 'rgba(120,40,180,0.25)', border: '#b06aff', glow: 'rgba(176,106,255,0.4)', text: '#b06aff' },
    legendary: { bg: 'rgba(180,120,20,0.30)', border: '#f0c040', glow: 'rgba(240,192,64,0.5)', text: '#f0c040' }
};