
// ══════════════════════════════════════════════
// PHASE 2: iPhone 13 Pro Max Optimizations
// ══════════════════════════════════════════════

// ── Haptic Feedback ───────────────────────────
const HapticFeedback = {
    light() {
        if (navigator.vibrate) navigator.vibrate(10);
    },
    medium() {
        if (navigator.vibrate) navigator.vibrate(20);
    },
    heavy() {
        if (navigator.vibrate) navigator.vibrate(50);
    },
    success() {
        if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    }
};

// ── Pull to Refresh ───────────────────────────
let pullStartY = 0;
let pullCurrentY = 0;
let isPulling = false;
const pullThreshold = 80;

function initPullToRefresh() {
    const app = document.getElementById('app');

    app.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            pullStartY = e.touches[0].clientY;
            isPulling = true;
        }
    }, { passive: true });

    app.addEventListener('touchmove', (e) => {
        if (!isPulling) return;

        pullCurrentY = e.touches[0].clientY;
        const pullDistance = pullCurrentY - pullStartY;

        if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
            if (pullDistance > pullThreshold) {
                HapticFeedback.light();
            }
        }
    }, { passive: true });

    app.addEventListener('touchend', () => {
        if (!isPulling) return;

        const pullDistance = pullCurrentY - pullStartY;

        if (pullDistance > pullThreshold) {
            HapticFeedback.medium();
            showSystemMessage('REFRESHING...', 1000);

            setTimeout(() => {
                checkDailyReset();
                generateDailyQuests();
                updateUI();
                renderQuests();
                renderAchievements();
                renderChart();
                showSystemMessage('REFRESHED!', 1500);
                HapticFeedback.success();
            }, 500);
        }

        isPulling = false;
        pullStartY = 0;
        pullCurrentY = 0;
    });
}

// ── Swipe Navigation Between Tabs ─────────────
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

function initSwipeNavigation() {
    const tabPanel = document.getElementById('app');

    tabPanel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    tabPanel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) < swipeThreshold) return;

    const tabs = ['quests', 'achievements', 'progress'];
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    const currentIndex = tabs.indexOf(activeTab);

    let newIndex = currentIndex;

    if (swipeDistance > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
        HapticFeedback.light();
    } else if (swipeDistance < 0 && currentIndex < tabs.length - 1) {
        newIndex = currentIndex + 1;
        HapticFeedback.light();
    }

    if (newIndex !== currentIndex) {
        switchTab(tabs[newIndex]);
    }
}

// ── Enhanced Functions with Haptics ───────────
(function () {
    const originalSwitchTab = window.switchTab;
    window.switchTab = function (tabId) {
        HapticFeedback.light();
        originalSwitchTab(tabId);
    };

    const originalCompleteQuest = window.completeQuest;
    window.completeQuest = function (questId) {
        HapticFeedback.medium();
        originalCompleteQuest(questId);
    };

    const originalShowLevelUp = window.showLevelUpNotification;
    window.showLevelUpNotification = function (oldStats, rankedUp) {
        HapticFeedback.heavy();
        if (rankedUp) {
            setTimeout(() => HapticFeedback.success(), 300);
        }
        originalShowLevelUp(oldStats, rankedUp);
    };
})();

// ── Initialize Mobile Features ────────────────
function initMobileFeatures() {
    initPullToRefresh();
    initSwipeNavigation();

    // Prevent overscroll bounce on iOS
    document.body.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ── Enhanced Init with Mobile Features ────────
(function () {
    const originalInit = window.init;
    window.init = function () {
        originalInit();
        initMobileFeatures();
    };
})();
