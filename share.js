// ─────────────────────────────────────────────
// share.js — Social Sharing for Achievements
// ─────────────────────────────────────────────

function shareAchievement(achievementName, achievementDesc) {
    const shareText = `🏆 Achievement Unlocked!\n\n"${achievementName}"\n${achievementDesc}\n\nLevel up your fitness with SYSTEM! 💪`;

    // Check if Web Share API is available (iOS Safari supports this)
    if (navigator.share) {
        navigator.share({
            title: 'SYSTEM - Achievement Unlocked!',
            text: shareText,
        }).then(() => {
            showSystemMessage('SHARED!', 1500);
            if (HapticFeedback) HapticFeedback.success();
        }).catch((error) => {
            // User cancelled or error occurred
            console.log('Share cancelled:', error);
        });
    } else {
        // Fallback: Copy to clipboard
        copyToClipboard(shareText);
        showSystemMessage('COPIED TO CLIPBOARD!', 2000);
        if (HapticFeedback) HapticFeedback.medium();
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Add share button to achievement popup
(function () {
    const originalShowAchievement = window.showAchievementPopup;
    window.showAchievementPopup = function (ach) {
        originalShowAchievement(ach);

        // Add click handler to achievement popup for sharing
        setTimeout(() => {
            const popup = document.getElementById('achievementPopup');
            if (popup && !popup.classList.contains('hidden')) {
                popup.style.cursor = 'pointer';
                popup.onclick = () => {
                    shareAchievement(ach.name, ach.desc);
                };
            }
        }, 100);
    };
})();

// Share level up
function shareLevelUp(level, rank) {
    const shareText = `⚡ LEVEL UP! ⚡\n\nReached Level ${level} - Rank ${rank}\n\nLeveling up in real life with SYSTEM! 🔥`;

    if (navigator.share) {
        navigator.share({
            title: 'SYSTEM - Level Up!',
            text: shareText,
        }).catch(() => { });
    } else {
        copyToClipboard(shareText);
        showSystemMessage('COPIED TO CLIPBOARD!', 2000);
    }
}

// Share streak milestone
function shareStreak(streak) {
    const shareText = `🔥 ${streak}-DAY STREAK! 🔥\n\nConsistency is key! Leveling up every day with SYSTEM! 💪`;

    if (navigator.share) {
        navigator.share({
            title: 'SYSTEM - Streak Milestone!',
            text: shareText,
        }).catch(() => { });
    } else {
        copyToClipboard(shareText);
        showSystemMessage('COPIED TO CLIPBOARD!', 2000);
    }
}
