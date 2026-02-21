// ── Profile Customization ─────────────────────
function editPlayerName() {
    const nameEl = document.getElementById('playerName');
    const currentName = player.name || 'Hunter';

    const newName = prompt('Enter your hunter name:', currentName);

    if (newName && newName.trim() && newName.trim() !== currentName) {
        player.name = newName.trim();
        nameEl.textContent = player.name;
        savePlayerData();
        showSystemMessage(`NAME UPDATED!\n"${player.name}"`, 2000);
        if (HapticFeedback) HapticFeedback.success();
    }
}

// Update UI to show player name
function updatePlayerName() {
    const nameEl = document.getElementById('playerName');
    if (nameEl && player.name) {
        nameEl.textContent = player.name;
    }
}

// Add to init
(function () {
    const originalInit = window.init;
    window.init = function () {
        originalInit();
        updatePlayerName();
    };
})();
