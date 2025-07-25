import GameConfig from './game-config.js';

// --- Tower Button Config ---
const TOWER_TYPES = [
    { type: 'basicTower', label: 'Basic Tower ($20)', cost: 20 },
    { type: 'rapidTower', label: 'Rapid Fire ($40)', cost: 40 },
    { type: 'cannonTower', label: 'Cannon ($60)', cost: 60 },
    { type: 'multishotTower', label: 'Multishot ($100)', cost: 100 },
    // Add new towers here!
];

// UI Manager Class
class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.towerButtons = [];
        this.upgradeButton = null; // Separate property for upgrade button
        this.sellButton = null; // Separate property for sell button
        this.startWaveButton = null;
        this.gameOverScreen = null;

        // New: Play/Pause and 2x Speed buttons
        this.playPauseButton = null;
        this.speedButton = null;
        this.playPauseState = 'play'; // 'play' or 'pause'
        this.speedState = 1; // 1-9 for speed multipliers
        
        // Auto-start wave functionality
        this.autoStartToggleButton = null;
        this.autoStartEnabled = this.getAutoStartPreference();
        
        // UI text elements
        this.healthText = null;
        this.moneyText = null;
        this.waveText = null;
        this.enemiesText = null;
        
        // Sound toggle - load from cookie or default to true
        this.soundToggleButton = null;
        this.soundEnabled = this.getSoundPreference();
        
        // Help dialog
        this.helpButton = null;
        this.helpDialog = null;
        
        // Game over screen elements
        this.finalWaveText = null;
        this.towersBuiltText = null;
        this.enemiesDefeatedText = null;
        
        // Tooltip elements
        this.tooltipContainer = null;
        this.tooltipText = null;
        
        // Register event listeners with fallback
        this.registerEventListeners();
        this.createTooltip();
    }

    // Cookie utility functions
    getSoundPreference() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'td_sound_enabled') {
                return value === 'true';
            }
        }
        return true; // Default to sound enabled
    }

    setSoundPreference(enabled) {
        // Set cookie to expire in 1 year
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `td_sound_enabled=${enabled}; expires=${expiryDate.toUTCString()}; path=/`;
    }

    getAutoStartPreference() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'td_auto_start_enabled') {
                return value === 'true';
            }
        }
        return false; // Default to auto-start disabled
    }

    setAutoStartPreference(enabled) {
        // Set cookie to expire in 1 year
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `td_auto_start_enabled=${enabled}; expires=${expiryDate.toUTCString()}; path=/`;
    }

    // Getter for current sound state
    getSoundState() {
        return this.soundEnabled;
    }

    registerEventListeners() {
        // Try to register event listeners immediately
        if (typeof window.gameEvents !== 'undefined') {
            this.setupEventListeners();
        } else {
            // If gameEvents isn't available yet, try again after a short delay
            setTimeout(() => {
                if (typeof window.gameEvents !== 'undefined') {
                    this.setupEventListeners();
                } else {
                    console.error("gameEvents still not available after retry");
                }
            }, 100);
        }
    }

    setupEventListeners() {
        // Listen for money change events
        window.gameEvents.on('moneyChanged', () => {
            this.updateAllButtonStates();
        });
        
        // Listen for tower selection events
        window.gameEvents.on('towerSelected', () => {
            this.updateAllButtonStates();
            this.updateUpgradeButtonText();
            this.updateSellButtonText();
        });
        
        window.gameEvents.on('towerDeselected', () => {
            this.updateAllButtonStates();
            this.updateUpgradeButtonText();
            this.updateSellButtonText();
        });
    }

    createUI() {
        this.createStatsPanel();
        this.createButtonPanel();
        this.createGameOverScreen();
    }

    createStatsPanel() {
        // Create stats panel as a horizontal bar at the top
        const statsPanel = this.scene.add.rectangle(0, 0, GameConfig.GAME_WIDTH, GameConfig.UI_TOP_HEIGHT, 
            GameConfig.COLORS.UI_PANEL, GameConfig.COLORS.UI_PANEL_ALPHA)
            .setOrigin(0, 0);
        
        // Stats text - arranged horizontally with larger font
        this.healthText = this.scene.add.text(40, 25, `❤️${this.scene.health}`, {
            fontSize: GameConfig.UI.textFontSize,
            fill: GameConfig.COLORS.HEALTH_TEXT
        }).setOrigin(0, 0);

        this.moneyText = this.scene.add.text(160, 25, `💰${this.scene.money}`, {
            fontSize: GameConfig.UI.textFontSize,
            fill: GameConfig.COLORS.MONEY_TEXT
        }).setOrigin(0, 0);

        this.waveText = this.scene.add.text(560, 25, `Wave: ${this.scene.wave}`, {
            fontSize: GameConfig.UI.textFontSize,
            fill: GameConfig.COLORS.WAVE_TEXT
        }).setOrigin(0, 0);

        this.enemiesText = this.scene.add.text(820, 25, `Enemies: ${this.scene.enemiesInWave - this.scene.enemiesSpawned}` , {
            fontSize: GameConfig.UI.textFontSize,
            fill: GameConfig.COLORS.ENEMIES_TEXT
        }).setOrigin(0, 0);
        
        // Create auto-start toggle button and sound toggle button on the right side
        this.createHelpButton();
        this.createAutoStartToggleButton();
        this.createSoundToggleButton();
    }

    createButtonPanel() {
        // Create bottom button panel background
        const buttonPanel = this.scene.add.rectangle(0, GameConfig.GAME_AREA_BOTTOM, GameConfig.GAME_WIDTH, 
            GameConfig.UI_BOTTOM_HEIGHT, GameConfig.COLORS.UI_PANEL, GameConfig.COLORS.UI_PANEL_ALPHA)
            .setOrigin(0, 0);

        // --- Tower Button Group ---
        this.createTowerButtonGroup();
        // --- Upgrade Button Group ---
        this.createUpgradeButtonGroup();
        // --- Wave Control Group ---
        this.createWaveControlGroup();

        // Arrange groups horizontally
        // Tower group on left, upgrade group positioned relative to wave control group on right
        const leftMargin = 24;
        const rightMargin = 24;
        const spacing = 16;
        const buttonY = GameConfig.GAME_AREA_BOTTOM + (GameConfig.UI_BOTTOM_HEIGHT - (this._towerButtonHeight || 48)) / 2;
        this.towerButtonGroup.x = leftMargin;
        this.towerButtonGroup.y = buttonY;
        
        // Position wave control group on the right
        this.waveControlGroup.x = GameConfig.GAME_WIDTH - this.waveControlGroup.width - rightMargin;
        this.waveControlGroup.y = buttonY;
        
        // Position upgrade button group so its right edge is one button width to the left of the Start Wave button
        this.upgradeButtonGroup.x = this.waveControlGroup.x - this.upgradeButtonGroup.width - spacing;
        this.upgradeButtonGroup.y = buttonY;
        // Ensure correct button is visible on game start
        this.updateWaveControlButtons();
    }

    createTowerButtonGroup() {
        this.towerButtonGroup = this.scene.add.container(0, 0);
        this.towerButtons = [];
        const buttonWidth = 110;
        const buttonHeight = 48;
        const spacing = 16;
        TOWER_TYPES.forEach((tower, i) => {
            const btn = this.createTowerButton((buttonWidth + spacing) * i, 0, tower.label, tower.type, tower.cost, buttonWidth, buttonHeight);
            this.towerButtonGroup.add(btn);
            this.towerButtons.push(btn);
        });
        // Store for layout
        this._towerButtonWidth = buttonWidth;
        this._towerButtonHeight = buttonHeight;
        this._towerButtonSpacing = spacing;
        this.towerButtonGroup.width = TOWER_TYPES.length * buttonWidth + (TOWER_TYPES.length - 1) * spacing;
        this.towerButtonGroup.height = buttonHeight;
    }

    createUpgradeButtonGroup() {
        this.upgradeButtonGroup = this.scene.add.container(0, 0);
        
        // Calculate button spacing and positions
        const buttonSpacing = 8;
        const totalWidth = this._towerButtonWidth * 2 + buttonSpacing;
        
        // Place upgrade button on the left
        this.upgradeButton = this.createUpgradeButtonElement(0, 0, 'Upgrade ($30)', 30, this._towerButtonWidth, this._towerButtonHeight);
        this.upgradeButtonGroup.add(this.upgradeButton);
        
        // Place sell button on the right
        this.sellButton = this.createSellButtonElement(this._towerButtonWidth + buttonSpacing, 0, 'Sell', 0, this._towerButtonWidth, this._towerButtonHeight);
        this.upgradeButtonGroup.add(this.sellButton);
        
        // Update group dimensions to accommodate both buttons
        this.upgradeButtonGroup.width = totalWidth;
        this.upgradeButtonGroup.height = this._towerButtonHeight;
    }

    createWaveControlGroup() {
        this.waveControlGroup = this.scene.add.container(0, 0);
        // Start wave button (centered in group)
        this.createStartWaveButton();
        // Pause and speed buttons (hidden initially)
        this.createPlayPauseAndSpeedButtons();
        // Fix: set parentContainer position to (0,0) so it's centered in the group
        if (this.startWaveButton.parentContainer) {
            this.startWaveButton.parentContainer.x = 0;
            this.startWaveButton.parentContainer.y = 0;
        }
        if (this.waveControlContainer) {
            this.waveControlContainer.x = 0;
            this.waveControlContainer.y = 0;
        }
        // Add both to group, but only one is visible at a time
        this.waveControlGroup.add(this.startWaveButton.parentContainer);
        this.waveControlGroup.add(this.waveControlContainer);
        // Both containers now have the same width (Start Wave button width)
        this.waveControlGroup.width = GameConfig.UI.startWaveButtonWidth;
        this.waveControlGroup.height = this._towerButtonHeight || 48;
    }

    createTowerButton(x, y, text, type, cost, width, height) {
        // Use provided width/height or fallback to config
        width = width || GameConfig.UI.buttonWidth;
        height = height || GameConfig.UI.buttonHeight;
        const buttonContainer = this.scene.add.container(x, y);

        // Create button background
        const button = this.scene.add.rectangle(0, 0, width, height, 
            GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0, 0)
            .setInteractive();

        // Add button shadow
        const shadow = this.scene.add.rectangle(2, 2, width, height, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0, 0);

        // Create selection indicator (initially hidden)
        const selectionIndicator = this.scene.add.rectangle(0, 0, width + 4, 
            height + 4, GameConfig.COLORS.SELECTION_YELLOW, 0.5)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add glow effect for selected state
        const glow = this.scene.add.rectangle(0, 0, width + 4, 
            height + 4, GameConfig.COLORS.SELECTION_GLOW, 0.2)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add text (smaller font, centered)
        const buttonText = this.scene.add.text(width / 2, height / 2, text, {
            fontSize: '15px',
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 12 }
        }).setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, selectionIndicator, glow, button, buttonText]);

        // Store references
        button.selectionIndicator = selectionIndicator;
        button.glow = glow;
        button.cost = cost;
        button.type = type;

        // Add hover effect
        button.on('pointerover', () => {
            if (this.canAffordButton(button)) {
                button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE_HOVER);
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 100,
                    ease: 'Power2'
                });
            } else {
                button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
                button.setAlpha(0.7);
            }
        });

        button.on('pointerout', () => {
            this.updateButtonState(button);
        });

        // Add press effect
        button.on('pointerdown', () => {
            if (this.canAffordButton(button)) {
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
        });

        button.on('pointerup', () => {
            if (this.canAffordButton(button)) {
                // Regular tower button handling
                this.handleTowerButtonClick(button, type);
            }
        });

        // Update button state based on money
        this.updateButtonState(button);

        return buttonContainer;
    }

    canAffordButton(button) {
        // For regular tower buttons, just check money
        return this.scene.money >= button.cost;
    }

    handleUpgradeButtonClick(button) {
        if (!this.scene.selectedTower) {
            // No tower selected, can't upgrade
            return;
        }

        const upgradeCost = this.scene.selectedTower.getUpgradeCost();
        if (this.scene.money < upgradeCost) {
            // Not enough money
            return;
        }

        // Immediately upgrade the tower
        this.scene.upgradeTower();
        
        // Keep the upgrade button selected for visual feedback
        this.scene.selectedTowerType = 'upgradeTower';
        this.clearTowerButtonSelection();
        button.selectionIndicator.setVisible(true);
        button.glow.setVisible(true);
        button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE_HOVER);
    }

    handleTowerButtonClick(button, type) {
        // If this button is already selected, deselect it
        if (this.scene.selectedTowerType === type) {
            this.scene.selectedTowerType = null;
            this.clearTowerButtonSelection();
            button.selectionIndicator.setVisible(false);
            button.glow.setVisible(false);
            button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
        } else {
            // Select this button and clear other selections
            this.scene.selectedTowerType = type;
            this.clearTowerButtonSelection();
            button.selectionIndicator.setVisible(true);
            button.glow.setVisible(true);
            button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE_HOVER);
        }
    }

    createStartWaveButton() {
        // Create start wave button container at (0,0) for proper group positioning
        const startWaveContainer = this.scene.add.container(0, 0);

        // Add button shadow (top-left origin)
        const startWaveShadow = this.scene.add.rectangle(2, 2, GameConfig.UI.startWaveButtonWidth - 20, 
            GameConfig.UI.startWaveButtonHeight, GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0, 0);

        // Create start wave button with adjusted position (top-left origin)
        this.startWaveButton = this.scene.add.rectangle(0, 0, GameConfig.UI.startWaveButtonWidth, 
            GameConfig.UI.startWaveButtonHeight, GameConfig.COLORS.BUTTON_GREEN)
            .setOrigin(0, 0)
            .setInteractive();

        // Add glow effect (top-left origin)
        const startWaveGlow = this.scene.add.rectangle(0, 0, GameConfig.UI.startWaveButtonWidth - 16, 
            GameConfig.UI.startWaveButtonHeight + 4, GameConfig.COLORS.BUTTON_GREEN, 0.2)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add text centered within the button
        const startWaveText = this.scene.add.text(GameConfig.UI.startWaveButtonWidth / 2, GameConfig.UI.startWaveButtonHeight / 2, 'Start Wave', {
            fontSize: GameConfig.UI.textFontSize,
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        // Add all elements to container
        startWaveContainer.add([startWaveShadow, startWaveGlow, this.startWaveButton, startWaveText]);

        // Add hover effect
        this.startWaveButton.on('pointerover', () => {
            if (!this.scene.waveActive && !this.scene.gameOver) {
                this.startWaveButton.setFillStyle(GameConfig.COLORS.BUTTON_GREEN_HOVER);
                this.scene.tweens.add({
                    targets: this.startWaveButton,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100,
                    ease: 'Power2'
                });
            }
        });

        this.startWaveButton.on('pointerout', () => {
            if (!this.scene.waveActive && !this.scene.gameOver) {
                this.startWaveButton.setFillStyle(GameConfig.COLORS.BUTTON_GREEN);
                this.scene.tweens.add({
                    targets: this.startWaveButton,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power2'
                });
            }
        });

        // Add press effect
        this.startWaveButton.on('pointerdown', () => {
            if (!this.scene.waveActive && !this.scene.gameOver) {
                this.scene.tweens.add({
                    targets: this.startWaveButton,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
        });

        this.startWaveButton.on('pointerup', () => {
            if (!this.scene.waveActive && !this.scene.gameOver) {
                this.updateWaveControlButtons();
                this.scene.startWave();
                startWaveGlow.setVisible(true);
                this.startWaveButton.setFillStyle(GameConfig.COLORS.BUTTON_GREEN_HOVER);
            }
        });

        // Store reference to glow
        this.startWaveButton.glow = startWaveGlow;
        // Store reference to container for visibility toggling
        this.startWaveButton.parentContainer = startWaveContainer;
    }

    createPlayPauseAndSpeedButtons() {
        // Container for both buttons at (0,0) for proper group positioning
        this.waveControlContainer = this.scene.add.container(0, 0);
        this.waveControlContainer.setVisible(false);

        // Match Start Wave button size
        const groupWidth = GameConfig.UI.startWaveButtonWidth;
        const groupHeight = GameConfig.UI.startWaveButtonHeight;

        // Calculate button positions to center them in the group
        const btnWidth = 60;
        const btnHeight = groupHeight;
        const spacing = 8;
        const totalBtnWidth = btnWidth * 2 + spacing;
        const startX = (groupWidth - totalBtnWidth) / 2;
        const y = 0;

        // Play/Pause button
        this.playPauseButton = this.scene.add.rectangle(startX, y, btnWidth, btnHeight, GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0, 0)
            .setInteractive();
        this.playPauseText = this.scene.add.text(startX + btnWidth / 2, groupHeight / 2, '⏸', {
            fontSize: GameConfig.UI.textFontSize,
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        // 2x Speed button
        this.speedButton = this.scene.add.rectangle(startX + btnWidth + spacing, y, btnWidth, btnHeight, GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0, 0)
            .setInteractive();
        this.speedText = this.scene.add.text(startX + btnWidth + spacing + btnWidth / 2, groupHeight / 2, '1x', {
            fontSize: GameConfig.UI.textFontSize,
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        this.waveControlContainer.add([this.playPauseButton, this.playPauseText, this.speedButton, this.speedText]);
        
        // Set the container width to match the Start Wave button width for consistent positioning
        this.waveControlContainer.width = groupWidth;
        this.waveControlContainer.height = groupHeight;

        // Play/Pause logic
        this.playPauseButton.on('pointerup', () => {
            if (this.scene.gameOver) return;
            if (this.playPauseState === 'play') {
                this.scene.pauseGame();
                this.playPauseState = 'pause';
                this.playPauseText.setText('▶️');
            } else {
                this.scene.resumeGame();
                this.playPauseState = 'play';
                this.playPauseText.setText('⏸');
            }
        });

        // Speed cycling logic (1x -> 2x -> 3x -> 4x -> back to 1x)
        this.speedButton.on('pointerup', () => {
            if (this.scene.gameOver) return;
            // Cycle through speeds 1, 2, 3, 4, then back to 1
            let nextSpeed = this.speedState + 1;
            if (nextSpeed > 4) {
                nextSpeed = 1;
            }
            this.scene.setGameSpeed(nextSpeed);
            this.speedState = nextSpeed;
            this.speedText.setText(`${nextSpeed}x`);
        });
    }

    updateWaveControlButtons() {
        // Show Start Wave button if not active, else show play/pause and speed
        if (this.scene.waveActive && !this.scene.gameOver) {
            this.startWaveButton.parentContainer && this.startWaveButton.parentContainer.setVisible(false);
            this.waveControlContainer.setVisible(true);
        } else {
            this.startWaveButton.parentContainer && this.startWaveButton.parentContainer.setVisible(true);
            this.waveControlContainer.setVisible(false);
            // Reset play/pause state only
            this.playPauseState = 'play';
            this.playPauseText.setText('⏸');
            // Keep speedState and speedText in sync with the current game speed
            if (this.scene._gameSpeed) {
                this.speedState = this.scene._gameSpeed;
                this.speedText.setText(`${this.scene._gameSpeed}x`);
            }
        }
    }

    createGameOverScreen() {
        this.gameOverScreen = this.scene.add.container(GameConfig.GAME_WIDTH / 2, GameConfig.GAME_HEIGHT / 2);
        this.gameOverScreen.setVisible(false);

        // Set a high depth so the game over screen is above towers/enemies
        this.gameOverScreen.setDepth(9999);

        const background = this.scene.add.rectangle(0, 0, 600, 400, GameConfig.COLORS.UI_PANEL, 0.9)
            .setOrigin(0.5)
            .setDepth(9999);

        const gameOverText = this.scene.add.text(0, -150, '💀 GAME OVER 💀', {
            fontSize: GameConfig.UI.gameOverFontSize,
            fill: '#fff'
        }).setOrigin(0.5).setDepth(9999);

        this.finalWaveText = this.scene.add.text(0, -80, 'Final Wave: 0', {
            fontSize: GameConfig.UI.gameOverStatsFontSize,
            fill: '#fff'
        }).setOrigin(0.5).setDepth(9999);

        this.towersBuiltText = this.scene.add.text(0, -20, 'Towers Built: 0', {
            fontSize: GameConfig.UI.gameOverStatsFontSize,
            fill: '#fff'
        }).setOrigin(0.5).setDepth(9999);

        this.enemiesDefeatedText = this.scene.add.text(0, 40, 'Enemies Defeated: 0', {
            fontSize: GameConfig.UI.gameOverStatsFontSize,
            fill: '#fff'
        }).setOrigin(0.5).setDepth(9999);

        const restartButton = this.scene.add.rectangle(0, 120, 300, 60, GameConfig.COLORS.BUTTON_GREEN)
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(9999);

        const restartButtonText = this.scene.add.text(0, 120, '🔄 Restart Game', {
            fontSize: GameConfig.UI.gameOverStatsFontSize,
            fill: '#fff'
        }).setOrigin(0.5).setDepth(9999);

        restartButton.on('pointerdown', () => {
            this.scene.restartGame();
        });

        this.gameOverScreen.add([background, gameOverText, this.finalWaveText, 
            this.towersBuiltText, this.enemiesDefeatedText, restartButton, restartButtonText]);
    }

    updateButtonState(button) {
        // For regular tower buttons, just check money
        if (this.scene.money < button.cost) {
            button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
            button.setAlpha(0.7);
        } else {
            button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
            button.setAlpha(1);
        }
    }

    clearTowerButtonSelection() {
        if (this.towerButtons) {
            this.towerButtons.forEach((container, index) => {
                // Find the actual interactive button (the one with input enabled)
                const button = container.list.find(child => child.input && child.input.enabled);
                if (button && button.selectionIndicator) {
                    button.selectionIndicator.setVisible(false);
                    button.glow.setVisible(false);
                    button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
                }
            });
        }
        // Note: Upgrade button selection is handled separately and not cleared here
    }

    updateUI() {
        this.healthText.setText(`❤️${this.scene.health}`);
        this.moneyText.setText(`💰${this.scene.money}`);
        this.waveText.setText(`Wave: ${this.scene.wave}`);
        this.enemiesText.setText(`Enemies: ${this.scene.enemiesInWave - this.scene.enemiesSpawned}`);
    }

    showGameOver() {
        this.gameOverScreen.setVisible(true);
        this.finalWaveText.setText(`Final Wave: ${this.scene.wave}`);
        this.towersBuiltText.setText(`Towers Built: ${this.scene.towersBuilt}`);
        this.enemiesDefeatedText.setText(`Enemies Defeated: ${this.scene.enemiesDefeated}`);
    }

    hideGameOver() {
        this.gameOverScreen.setVisible(false);
    }

    updateAllButtonStates() {
        // Update tower button states
        this.towerButtons.forEach(container => {
            const button = container.list.find(child => child.type === 'Rectangle' && child.input && child.input.enabled);
            if (button) {
                this.updateButtonState(button);
            }
        });
        // Update upgrade button state and text
        if (this.upgradeButton) {
            const button = this.upgradeButton.list.find(child => child.type === 'Rectangle' && child.input && child.input.enabled);
            if (button) {
                this.updateUpgradeButtonState(button);
            }
            this.updateUpgradeButtonText();
        }
        
        // Update sell button state and text
        if (this.sellButton) {
            const button = this.sellButton.list.find(child => child.type === 'Rectangle' && child.input && child.input.enabled);
            if (button) {
                this.updateSellButtonState(button);
            }
            this.updateSellButtonText();
        }
    }

    createUpgradeButtonElement(x, y, text, cost, width, height) {
        width = width || GameConfig.UI.buttonWidth;
        height = height || GameConfig.UI.buttonHeight;
        const buttonContainer = this.scene.add.container(x, y);

        // Create button background
        const button = this.scene.add.rectangle(0, 0, width, height, 
            GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0, 0)
            .setInteractive();

        // Add button shadow
        const shadow = this.scene.add.rectangle(2, 2, width, height, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0, 0);

        // Create selection indicator (initially hidden)
        const selectionIndicator = this.scene.add.rectangle(0, 0, width + 4, 
            height + 4, GameConfig.COLORS.SELECTION_YELLOW, 0.5)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add glow effect for selected state
        const glow = this.scene.add.rectangle(0, 0, width + 4, 
            height + 4, GameConfig.COLORS.SELECTION_GLOW, 0.2)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add text (smaller font, centered)
        const buttonText = this.scene.add.text(width / 2, height / 2, text, {
            fontSize: '15px',
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 12 }
        }).setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, selectionIndicator, glow, button, buttonText]);

        // Store references
        button.selectionIndicator = selectionIndicator;
        button.glow = glow;
        button.cost = cost;
        button.type = 'upgradeTower';

        // Add hover effect
        button.on('pointerover', () => {
            if (this.canAffordUpgradeButton(button)) {
                button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE_HOVER);
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 100,
                    ease: 'Power2'
                });
            } else {
                button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
                button.setAlpha(0.7);
            }
        });

        button.on('pointerout', () => {
            this.updateUpgradeButtonState(button);
        });

        // Add press effect
        button.on('pointerdown', () => {
            if (this.canAffordUpgradeButton(button)) {
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
        });

        button.on('pointerup', () => {
            if (this.canAffordUpgradeButton(button)) {
                this.handleUpgradeButtonClick(button);
            }
        });

        // Update button state based on money and tower selection
        this.updateUpgradeButtonState(button);

        return buttonContainer;
    }

    createSellButtonElement(x, y, text, cost, width, height) {
        width = width || GameConfig.UI.buttonWidth;
        height = height || GameConfig.UI.buttonHeight;
        const buttonContainer = this.scene.add.container(x, y);

        // Create button background
        const button = this.scene.add.rectangle(0, 0, width, height, 
            GameConfig.COLORS.BUTTON_RED)
            .setOrigin(0, 0)
            .setInteractive();

        // Add button shadow
        const shadow = this.scene.add.rectangle(2, 2, width, height, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0, 0);

        // Create selection indicator (initially hidden)
        const selectionIndicator = this.scene.add.rectangle(0, 0, width + 4, 
            height + 4, GameConfig.COLORS.SELECTION_YELLOW, 0.5)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add glow effect for selected state
        const glow = this.scene.add.rectangle(0, 0, width + 4, 
            height + 4, GameConfig.COLORS.SELECTION_GLOW, 0.2)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add text (smaller font, centered)
        const buttonText = this.scene.add.text(width / 2, height / 2, text, {
            fontSize: '15px',
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: width - 12 }
        }).setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, selectionIndicator, glow, button, buttonText]);

        // Store references
        button.selectionIndicator = selectionIndicator;
        button.glow = glow;
        button.cost = cost;
        button.type = 'sellTower';

        // Add hover effect
        button.on('pointerover', () => {
            if (this.canSellTower(button)) {
                button.setFillStyle(GameConfig.COLORS.BUTTON_RED_HOVER);
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 100,
                    ease: 'Power2'
                });
            } else {
                button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
                button.setAlpha(0.7);
            }
        });

        button.on('pointerout', () => {
            this.updateSellButtonState(button);
        });

        // Add press effect
        button.on('pointerdown', () => {
            if (this.canSellTower(button)) {
                this.scene.tweens.add({
                    targets: button,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50,
                    yoyo: true,
                    ease: 'Power2'
                });
            }
        });

        button.on('pointerup', () => {
            if (this.canSellTower(button)) {
                this.handleSellButtonClick(button);
            }
        });

        // Update button state based on tower selection
        this.updateSellButtonState(button);

        return buttonContainer;
    }

    canAffordUpgradeButton(button) {
        if (!this.scene.selectedTower) return false;
        const upgradeCost = this.scene.selectedTower.getUpgradeCost();
        return this.scene.money >= upgradeCost;
    }

    updateUpgradeButtonState(button) {
        if (!this.scene.selectedTower) {
            button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
            button.setAlpha(0.7);
            return;
        }
        
        const upgradeCost = this.scene.selectedTower.getUpgradeCost();
        if (this.scene.money < upgradeCost) {
            button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
            button.setAlpha(0.7);
        } else {
            button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
            button.setAlpha(1);
        }
    }

    updateUpgradeButtonText() {
        if (!this.upgradeButton) {
            return;
        }
        
        // Find the button element by looking for the one with type 'upgradeTower'
        const button = this.upgradeButton.list.find(child => child.type === 'upgradeTower');
        const buttonText = this.upgradeButton.list.find(child => child.type === 'Text');
        
        if (!button || !buttonText) return;
        
        if (this.scene.selectedTower) {
            const upgradeCost = this.scene.selectedTower.getUpgradeCost();
            button.cost = upgradeCost;
            buttonText.setText(`Upgrade ($${upgradeCost})`);
        } else {
            button.cost = 0;
            buttonText.setText('Upgrade ($0)');
        }
    }

    canSellTower(button) {
        return this.scene.selectedTower !== null;
    }

    handleSellButtonClick(button) {
        if (!this.scene.selectedTower) {
            // No tower selected, can't sell
            return;
        }

        // Remove the tower from the game (this handles money addition and tower removal)
        this.scene.sellTower();
        
        // Clear selection
        this.scene.selectedTower = null;
        this.scene.selectedTowerType = null;
        this.clearTowerButtonSelection();
        
        // Update UI
        this.updateAllButtonStates();
        this.updateUpgradeButtonText();
        this.updateSellButtonText();
    }

    updateSellButtonState(button) {
        if (!this.scene.selectedTower) {
            button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
            button.setAlpha(0.7);
        } else {
            button.setFillStyle(GameConfig.COLORS.BUTTON_RED);
            button.setAlpha(1);
        }
    }

    updateSellButtonText() {
        if (!this.sellButton) {
            return;
        }
        
        // Find the button element by looking for the one with type 'sellTower'
        const button = this.sellButton.list.find(child => child.type === 'sellTower');
        const buttonText = this.sellButton.list.find(child => child.type === 'Text');
        
        if (!button || !buttonText) return;
        
        if (this.scene.selectedTower) {
            const sellValue = this.scene.selectedTower.getSellValue();
            button.cost = sellValue;
            buttonText.setText(`Sell ($${sellValue})`);
        } else {
            button.cost = 0;
            buttonText.setText('Sell ($0)');
        }
    }

    createTooltip() {
        // Create a container for the tooltip
        this.tooltipContainer = this.scene.add.container(0, 0).setDepth(1000).setVisible(false);
        // Background rectangle (no border)
        this.tooltipBg = this.scene.add.rectangle(0, 0, 180, 70, 0x222222, 0.95)
            .setOrigin(0, 0);
        // Tooltip text (initially at 0,0, will be repositioned)
        this.tooltipText = this.scene.add.text(0, 0, '', {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'Arial',
            wordWrap: { width: 164 },
        });
        this.tooltipContainer.add([this.tooltipBg, this.tooltipText]);
        this.tooltipContainer.setScrollFactor && this.tooltipContainer.setScrollFactor(0);

        // Enemy tooltip
        this.enemyTooltipContainer = this.scene.add.container(0, 0).setDepth(1000).setVisible(false);
        this.enemyTooltipBg = this.scene.add.rectangle(0, 0, 180, 70, GameConfig.COLORS.BUTTON_GREEN, 0.95)
            .setOrigin(0, 0);
        this.enemyTooltipText = this.scene.add.text(0, 0, '', {
            fontSize: '16px',
            fill: '#fff',
            fontFamily: 'Arial',
            wordWrap: { width: 164 },
        });
        this.enemyTooltipContainer.add([this.enemyTooltipBg, this.enemyTooltipText]);
        this.enemyTooltipContainer.setScrollFactor && this.enemyTooltipContainer.setScrollFactor(0);
    }

    showTooltip(x, y, text) {
        const padding = 12;
        this.tooltipText.setText(text);
        // Move text to (padding/2, padding/2)
        this.tooltipText.setPosition(padding / 2, padding / 2);
        // Resize background to fit text + padding
        const width = this.tooltipText.width + padding;
        const height = this.tooltipText.height + padding;
        this.tooltipBg.width = width;
        this.tooltipBg.height = height;
        // Position tooltip, clamp to screen
        const maxX = GameConfig.GAME_WIDTH - width - 8;
        const maxY = GameConfig.GAME_HEIGHT - height - 8;
        this.tooltipContainer.x = Math.max(8, Math.min(x + 16, maxX));
        this.tooltipContainer.y = Math.max(8, Math.min(y + 16, maxY));
        this.tooltipContainer.setVisible(true);
    }

    hideTooltip() {
        this.tooltipContainer.setVisible(false);
    }

    updateTooltipPosition(x, y) {
        if (!this.tooltipContainer.visible) return;
        const width = this.tooltipBg.width;
        const height = this.tooltipBg.height;
        const maxX = GameConfig.GAME_WIDTH - width - 8;
        const maxY = GameConfig.GAME_HEIGHT - height - 8;
        this.tooltipContainer.x = Math.max(8, Math.min(x + 16, maxX));
        this.tooltipContainer.y = Math.max(8, Math.min(y + 16, maxY));
    }

    showEnemyTooltip(x, y, text) {
        const padding = 12;
        this.enemyTooltipText.setText(text);
        this.enemyTooltipText.setPosition(padding / 2, padding / 2);
        const width = this.enemyTooltipText.width + padding;
        const height = this.enemyTooltipText.height + padding;
        this.enemyTooltipBg.width = width;
        this.enemyTooltipBg.height = height;
        const maxX = GameConfig.GAME_WIDTH - width - 8;
        const maxY = GameConfig.GAME_HEIGHT - height - 8;
        this.enemyTooltipContainer.x = Math.max(8, Math.min(x + 16, maxX));
        this.enemyTooltipContainer.y = Math.max(8, Math.min(y + 16, maxY));
        this.enemyTooltipContainer.setVisible(true);
    }

    hideEnemyTooltip() {
        this.enemyTooltipContainer.setVisible(false);
    }

    updateEnemyTooltipPosition(x, y) {
        if (!this.enemyTooltipContainer.visible) return;
        const width = this.enemyTooltipBg.width;
        const height = this.enemyTooltipBg.height;
        const maxX = GameConfig.GAME_WIDTH - width - 8;
        const maxY = GameConfig.GAME_HEIGHT - height - 8;
        this.enemyTooltipContainer.x = Math.max(8, Math.min(x + 16, maxX));
        this.enemyTooltipContainer.y = Math.max(8, Math.min(y + 16, maxY));
    }

    createAutoStartToggleButton() {
        const rightMargin = 24; // Distance from right edge of game area
        const buttonSize = 48; // Match tower button height for consistent spacing
        const spacing = 8; // Space between auto-start and sound buttons
        const buttonX = GameConfig.GAME_WIDTH - rightMargin - buttonSize - spacing - buttonSize / 2; // Position to the left of sound button
        const buttonY = GameConfig.UI_TOP_HEIGHT / 2; // Center vertically within the stats panel
        
        // Create button container
        const buttonContainer = this.scene.add.container(buttonX, buttonY);
        
        // Create button background
        const button = this.scene.add.rectangle(0, 0, buttonSize, buttonSize, 
            this.autoStartEnabled ? GameConfig.COLORS.BUTTON_GREEN : GameConfig.COLORS.BUTTON_DISABLED)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        // Add button shadow
        const shadow = this.scene.add.rectangle(1, 1, buttonSize, buttonSize, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0.5, 0.5);

        // Create auto-start icon using SVG image
        const iconSize = 32;
        const autoStartIcon = this.scene.add.image(0, 0, 'autoStart')
            .setDisplaySize(iconSize, iconSize)
            .setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, button, autoStartIcon]);

        // Store references
        button.autoStartIcon = autoStartIcon;
        button.autoStartEnabled = this.autoStartEnabled;

        // Set initial state
        this.updateAutoStartToggleState(button);

        // Add hover effect with tooltip
        button.on('pointerover', (pointer) => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Power2'
            });
            // Show tooltip
            const tooltipText = this.autoStartEnabled ? 
                'Auto-Start: ON\nNext wave starts automatically' : 
                'Auto-Start: OFF\nClick to enable auto-start';
            this.showTooltip(pointer.worldX, pointer.worldY, tooltipText);
        });

        button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
            // Hide tooltip
            this.hideTooltip();
        });

        // Add click effect
        button.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 50,
                yoyo: true,
                ease: 'Power2'
            });
        });

        button.on('pointerup', () => {
            this.toggleAutoStart(button);
        });

        this.autoStartToggleButton = button;
    }

    createSoundToggleButton() {
        const rightMargin = 24; // Distance from right edge of game area
        const buttonSize = 48; // Match tower button height for consistent spacing
        const buttonX = GameConfig.GAME_WIDTH - rightMargin - buttonSize / 2; // Position with right margin
        const buttonY = GameConfig.UI_TOP_HEIGHT / 2; // Center vertically within the stats panel
        
        // Create button container
        const buttonContainer = this.scene.add.container(buttonX, buttonY);
        
        // Create button background
        const button = this.scene.add.rectangle(0, 0, buttonSize, buttonSize, 
            GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        // Add button shadow
        const shadow = this.scene.add.rectangle(1, 1, buttonSize, buttonSize, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0.5, 0.5);

        // Create speaker icons using SVG images - sized to match tower button text area
        const iconSize = 32; // Leave 8px padding on top/bottom (48-32)/2 = 8px each side
        const speakerIcon = this.scene.add.image(0, 0, 'speakerOn')
            .setDisplaySize(iconSize, iconSize)
            .setOrigin(0.5, 0.5);

        const mutedIcon = this.scene.add.image(0, 0, 'speakerOff')
            .setDisplaySize(iconSize, iconSize)
            .setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, button, speakerIcon, mutedIcon]);

        // Store references
        button.speakerIcon = speakerIcon;
        button.mutedIcon = mutedIcon;
        button.soundEnabled = this.soundEnabled; // Use the loaded preference

        // Set initial state
        this.updateSoundToggleState(button);

        // Add hover effect
        button.on('pointerover', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Power2'
            });
        });

        button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });

        // Add click effect
        button.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 50,
                yoyo: true,
                ease: 'Power2'
            });
        });

        button.on('pointerup', () => {
            this.toggleSound(button);
        });

        this.soundToggleButton = button;
    }

    updateSoundToggleState(button) {
        if (button.soundEnabled) {
            button.speakerIcon.setVisible(true);
            button.mutedIcon.setVisible(false);
            button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
        } else {
            button.speakerIcon.setVisible(false);
            button.mutedIcon.setVisible(true);
            button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
        }
    }

    toggleSound(button) {
        button.soundEnabled = !button.soundEnabled;
        this.soundEnabled = button.soundEnabled;
        this.updateSoundToggleState(button);
        
        // Save preference to cookie
        this.setSoundPreference(this.soundEnabled);
        
        // Update global sound state
        if (this.soundEnabled) {
            this.scene.sound.setMute(false);
        } else {
            this.scene.sound.setMute(true);
        }
    }

    updateAutoStartToggleState(button) {
        if (button.autoStartEnabled) {
            button.setFillStyle(GameConfig.COLORS.BUTTON_GREEN);
            button.autoStartIcon.setAlpha(1.0);
        } else {
            button.setFillStyle(GameConfig.COLORS.BUTTON_DISABLED);
            button.autoStartIcon.setAlpha(0.6);
        }
    }

    toggleAutoStart(button) {
        button.autoStartEnabled = !button.autoStartEnabled;
        this.autoStartEnabled = button.autoStartEnabled;
        this.updateAutoStartToggleState(button);
        
        // Save preference to cookie
        this.setAutoStartPreference(this.autoStartEnabled);
        
        // Update tooltip if currently visible
        if (this.tooltipContainer && this.tooltipContainer.visible) {
            this.hideTooltip();
        }
    }

    // Getter for current auto-start state
    getAutoStartState() {
        return this.autoStartEnabled;
    }

    createHelpButton() {
        const rightMargin = 24;
        const buttonSize = 48;
        const spacing = 8;
        // Position to the left of auto-start button (which is to the left of sound button)
        const buttonX = GameConfig.GAME_WIDTH - rightMargin - buttonSize - spacing - buttonSize - spacing - buttonSize / 2;
        const buttonY = GameConfig.UI_TOP_HEIGHT / 2;
        
        // Create button container
        const buttonContainer = this.scene.add.container(buttonX, buttonY);
        
        // Create circular button background
        const button = this.scene.add.circle(0, 0, buttonSize / 2, 
            GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        // Add circular button shadow
        const shadow = this.scene.add.circle(1, 1, buttonSize / 2, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0.5, 0.5);

        // Create help icon
        const iconSize = 32;
        const helpIcon = this.scene.add.image(0, 0, 'help')
            .setDisplaySize(iconSize, iconSize)
            .setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, button, helpIcon]);

        // Add hover effect
        button.on('pointerover', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                ease: 'Power2'
            });
        });

        button.on('pointerout', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });

        // Add click effect
        button.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: button,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 50,
                yoyo: true,
                ease: 'Power2'
            });
        });

        button.on('pointerup', () => {
            this.showHelpDialog();
        });

        this.helpButton = button;
    }

    showHelpDialog() {
        if (this.helpDialog && this.helpDialog.visible) {
            return; // Dialog already visible
        }

        // Create dialog background
        const dialogWidth = 450;
        const dialogHeight = 350;
        const centerX = GameConfig.GAME_WIDTH / 2;
        const centerY = GameConfig.GAME_HEIGHT / 2;

        const dialogContainer = this.scene.add.container(centerX, centerY);

        // Semi-transparent overlay
        const overlay = this.scene.add.rectangle(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT, 
            0x000000, 0.5)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        // Dialog background
        const dialogBg = this.scene.add.rectangle(0, 0, dialogWidth, dialogHeight, 
            GameConfig.COLORS.UI_PANEL, 0.95)
            .setOrigin(0.5, 0.5);

        // Dialog border
        const dialogBorder = this.scene.add.rectangle(0, 0, dialogWidth, dialogHeight, 
            GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0.5, 0.5)
            .setStrokeStyle(2, GameConfig.COLORS.BUTTON_BLUE);

        // Title
        const title = this.scene.add.text(0, -dialogHeight/2 + 35, 'Help', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5);

        // Help content
        const helpText = `Keyboard Shortcuts:

Space: Start wave / Pause game
0: Pause/unpause during wave
1-9: Set game speed (1x to 9x)

B: Select Basic Tower
R: Select Rapid Fire Tower
C: Select Cannon Tower
M: Select Multishot Tower
U: Upgrade selected tower

Click towers to select/upgrade
Place towers to defend against enemies`;

        const content = this.scene.add.text(0, 25, helpText, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'left',
            lineSpacing: 4
        }).setOrigin(0.5, 0.5);

        // Close button (X)
        const closeButton = this.scene.add.rectangle(dialogWidth/2 - 20, -dialogHeight/2 + 20, 30, 30, 
            GameConfig.COLORS.BUTTON_RED)
            .setOrigin(0.5, 0.5)
            .setInteractive();

        const closeX = this.scene.add.text(dialogWidth/2 - 20, -dialogHeight/2 + 20, '×', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5);

        // Add close button hover effect
        closeButton.on('pointerover', () => {
            closeButton.setFillStyle(GameConfig.COLORS.BUTTON_RED_HOVER || 0xff6666);
        });

        closeButton.on('pointerout', () => {
            closeButton.setFillStyle(GameConfig.COLORS.BUTTON_RED);
        });

        closeButton.on('pointerup', () => {
            this.hideHelpDialog();
        });

        // Add elements to container
        dialogContainer.add([overlay, dialogBg, dialogBorder, title, content, closeButton, closeX]);

        // Store reference
        this.helpDialog = dialogContainer;

        // Close dialog when clicking overlay
        overlay.on('pointerup', () => {
            this.hideHelpDialog();
        });
    }

    hideHelpDialog() {
        if (this.helpDialog) {
            this.helpDialog.destroy();
            this.helpDialog = null;
        }
    }
}

// Export for Node/CommonJS and also attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}