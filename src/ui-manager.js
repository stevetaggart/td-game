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
        this.speedState = 1; // 1 or 2
        
        // UI text elements
        this.healthText = null;
        this.moneyText = null;
        this.waveText = null;
        this.enemiesText = null;
        
        // Sound toggle - load from cookie or default to true
        this.soundToggleButton = null;
        this.soundEnabled = this.getSoundPreference();
        
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
        // Get responsive configuration
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        
        // Create stats panel as a horizontal bar at the top
        const statsPanel = this.scene.add.rectangle(0, 0, responsiveConfig.GAME_WIDTH, responsiveConfig.UI_TOP_HEIGHT, 
            GameConfig.COLORS.UI_PANEL, GameConfig.COLORS.UI_PANEL_ALPHA)
            .setOrigin(0, 0);
        
        // Calculate text positions based on screen size
        let healthX, moneyX, waveX, enemiesX, textY;
        
        if (responsiveConfig.IS_MOBILE) {
            // Stack stats vertically on mobile
            healthX = 10;
            moneyX = 10;
            waveX = 10;
            enemiesX = 10;
            textY = 15;
            const lineHeight = 20;
            
            this.healthText = this.scene.add.text(healthX, textY, `Health: ${this.scene.health}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.HEALTH_TEXT
            }).setOrigin(0, 0);

            this.moneyText = this.scene.add.text(moneyX, textY + lineHeight, `Money: ${this.scene.money}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.MONEY_TEXT
            }).setOrigin(0, 0);

            this.waveText = this.scene.add.text(waveX, textY + lineHeight * 2, `Wave: ${this.scene.wave}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.WAVE_TEXT
            }).setOrigin(0, 0);

            this.enemiesText = this.scene.add.text(enemiesX, textY + lineHeight * 3, `Enemies: ${this.scene.enemiesInWave - this.scene.enemiesSpawned}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.ENEMIES_TEXT
            }).setOrigin(0, 0);
        } else {
            // Horizontal layout for larger screens
            healthX = 40;
            moneyX = 300;
            waveX = 560;
            enemiesX = 820;
            textY = 25;
            
            this.healthText = this.scene.add.text(healthX, textY, `Health: ${this.scene.health}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.HEALTH_TEXT
            }).setOrigin(0, 0);

            this.moneyText = this.scene.add.text(moneyX, textY, `Money: ${this.scene.money}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.MONEY_TEXT
            }).setOrigin(0, 0);

            this.waveText = this.scene.add.text(waveX, textY, `Wave: ${this.scene.wave}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.WAVE_TEXT
            }).setOrigin(0, 0);

            this.enemiesText = this.scene.add.text(enemiesX, textY, `Enemies: ${this.scene.enemiesInWave - this.scene.enemiesSpawned}`, {
                fontSize: responsiveConfig.TEXT_FONT_SIZE,
                fill: GameConfig.COLORS.ENEMIES_TEXT
            }).setOrigin(0, 0);
        }
        
        // Create sound toggle button on the right side
        this.createSoundToggleButton();
        
        // Create map selection button
        this.createMapSelectionButton();
        
        // Create full-screen toggle button (only on mobile)
        if (responsiveConfig.IS_MOBILE) {
            this.createFullScreenToggleButton();
        }
    }

    createButtonPanel() {
        // Get responsive configuration
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        
        // Create button panel background based on device type
        let buttonPanel;
        if (responsiveConfig.IS_MOBILE) {
            // Create right-side button panel for mobile
            buttonPanel = this.scene.add.rectangle(responsiveConfig.GAME_AREA_RIGHT, 0, responsiveConfig.UI_RIGHT_WIDTH, 
                responsiveConfig.GAME_HEIGHT, GameConfig.COLORS.UI_PANEL, GameConfig.COLORS.UI_PANEL_ALPHA)
                .setOrigin(0, 0);
        } else {
            // Create bottom button panel for desktop/tablet
            buttonPanel = this.scene.add.rectangle(0, responsiveConfig.GAME_AREA_BOTTOM, responsiveConfig.GAME_WIDTH, 
                responsiveConfig.UI_BOTTOM_HEIGHT, GameConfig.COLORS.UI_PANEL, GameConfig.COLORS.UI_PANEL_ALPHA)
                .setOrigin(0, 0);
        }

        // --- Tower Button Group ---
        this.createTowerButtonGroup();
        // --- Upgrade Button Group ---
        this.createUpgradeButtonGroup();
        // --- Wave Control Group ---
        this.createWaveControlGroup();

        // Arrange groups based on screen size
        if (responsiveConfig.IS_MOBILE) {
            this.arrangeMobileLayout();
        } else {
            this.arrangeDesktopLayout();
        }
        
        // Ensure correct button is visible on game start
        this.updateWaveControlButtons();
    }

    arrangeMobileLayout() {
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        const margin = 8;
        const spacing = 12;
        
        // Position all button groups vertically on the right side
        const rightPanelX = responsiveConfig.GAME_AREA_RIGHT + margin;
        let currentY = responsiveConfig.UI_TOP_HEIGHT + margin;
        
        // Position tower buttons at the top of the right panel
        this.towerButtonGroup.x = rightPanelX;
        this.towerButtonGroup.y = currentY;
        
        // Stack tower buttons vertically since we have limited horizontal space
        this.rearrangeTowerButtonsVertically();
        
        // Position wave control buttons below tower buttons
        currentY += this.getTowerButtonGroupHeight() + spacing;
        this.waveControlGroup.x = rightPanelX;
        this.waveControlGroup.y = currentY;
        
        // Position upgrade buttons below wave controls
        currentY += this._towerButtonHeight + spacing;
        this.upgradeButtonGroup.x = rightPanelX;
        this.upgradeButtonGroup.y = currentY;
    }

    rearrangeTowerButtonsVertically() {
        // Rearrange tower buttons in a vertical stack for mobile
        const spacing = this._towerButtonSpacing;
        this.towerButtons.forEach((button, i) => {
            button.parentContainer.x = 0;
            button.parentContainer.y = i * (this._towerButtonHeight + spacing);
        });
        
        // Update container dimensions
        this.towerButtonGroup.width = this._towerButtonWidth;
        this.towerButtonGroup.height = this.towerButtons.length * this._towerButtonHeight + 
                                       (this.towerButtons.length - 1) * spacing;
    }

    getTowerButtonGroupHeight() {
        // Calculate total height of the tower button group
        if (this.scene.responsiveConfig.IS_MOBILE) {
            return this.towerButtons.length * this._towerButtonHeight + 
                   (this.towerButtons.length - 1) * this._towerButtonSpacing;
        } else {
            return this._towerButtonHeight;
        }
    }

    arrangeDesktopLayout() {
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        const leftMargin = 24;
        const rightMargin = 24;
        const spacing = 16;
        const buttonY = responsiveConfig.GAME_AREA_BOTTOM + (responsiveConfig.UI_BOTTOM_HEIGHT - (this._towerButtonHeight || 48)) / 2;
        
        this.towerButtonGroup.x = leftMargin;
        this.towerButtonGroup.y = buttonY;
        
        // Position wave control group on the right
        this.waveControlGroup.x = responsiveConfig.GAME_WIDTH - this.waveControlGroup.width - rightMargin;
        this.waveControlGroup.y = buttonY;
        
        // Position upgrade button group so its right edge is one button width to the left of the Start Wave button
        this.upgradeButtonGroup.x = this.waveControlGroup.x - this.upgradeButtonGroup.width - spacing;
        this.upgradeButtonGroup.y = buttonY;
    }

    createTowerButtonGroup() {
        // Get responsive configuration
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        
        this.towerButtonGroup = this.scene.add.container(0, 0);
        this.towerButtons = [];
        
        // Use responsive button dimensions
        const buttonWidth = responsiveConfig.BUTTON_WIDTH;
        const buttonHeight = responsiveConfig.BUTTON_HEIGHT;
        const spacing = responsiveConfig.TOWER_BUTTON_SPACING;
        
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

        // Get responsive configuration for font size
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        
        // Add text (responsive font, centered)
        const buttonText = this.scene.add.text(width / 2, height / 2, text, {
            fontSize: responsiveConfig.BUTTON_FONT_SIZE,
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

        // Get responsive configuration for font size
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        
        // Add text centered within the button
        const startWaveText = this.scene.add.text(GameConfig.UI.startWaveButtonWidth / 2, GameConfig.UI.startWaveButtonHeight / 2, 'Start Wave', {
            fontSize: responsiveConfig.TEXT_FONT_SIZE,
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
        this.speedText = this.scene.add.text(startX + btnWidth + spacing + btnWidth / 2, groupHeight / 2, '2x', {
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

        // 2x Speed logic
        this.speedButton.on('pointerup', () => {
            if (this.scene.gameOver) return;
            if (this.speedState === 1) {
                this.scene.setGameSpeed(2);
                this.speedState = 2;
                this.speedText.setText('1x');
            } else {
                this.scene.setGameSpeed(1);
                this.speedState = 1;
                this.speedText.setText('2x');
            }
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
            // Reset play/pause and speed button states
            this.playPauseState = 'play';
            this.playPauseText.setText('⏸');
            this.speedState = 1;
            this.speedText.setText('2x');
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
        this.healthText.setText(`Health: ${this.scene.health}`);
        this.moneyText.setText(`Money: ${this.scene.money}`);
        this.waveText.setText(`Wave: ${this.scene.wave}`);
        this.enemiesText.setText(`Enemies: ${this.scene.enemiesInWave - this.scene.enemiesSpawned}`);
    }

    handleResize(newConfig) {
        // Update UI positioning based on new configuration
        // This is a basic implementation - in a full responsive system,
        // you might want to recreate the entire UI
        console.log('UI resize handled with new config:', newConfig);
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
    
    createFullScreenToggleButton() {
        const rightMargin = 24; // Distance from right edge of game area
        const buttonSize = 48; // Match tower button height for consistent spacing
        const buttonX = GameConfig.GAME_WIDTH - rightMargin - buttonSize * 1.5; // Position to the left of sound button
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

        // Create full-screen icons
        const iconSize = 24; // Slightly smaller than sound icon
        const fullScreenIcon = this.scene.add.text(0, 0, '⛶', {
            fontSize: iconSize + 'px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5);

        const exitFullScreenIcon = this.scene.add.text(0, 0, '⛶', {
            fontSize: iconSize + 'px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, button, fullScreenIcon, exitFullScreenIcon]);

        // Store references
        button.fullScreenIcon = fullScreenIcon;
        button.exitFullScreenIcon = exitFullScreenIcon;
        button.isFullScreen = false;

        // Set initial state
        this.updateFullScreenToggleState(button);

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
            this.toggleFullScreen(button);
        });

        this.fullScreenToggleButton = button;
    }

    updateFullScreenToggleState(button) {
        if (button.isFullScreen) {
            button.fullScreenIcon.setVisible(false);
            button.exitFullScreenIcon.setVisible(true);
            button.setFillStyle(GameConfig.COLORS.BUTTON_GREEN);
        } else {
            button.fullScreenIcon.setVisible(true);
            button.exitFullScreenIcon.setVisible(false);
            button.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
        }
    }

    toggleFullScreen(button) {
        button.isFullScreen = !button.isFullScreen;
        this.updateFullScreenToggleState(button);
        
        if (button.isFullScreen) {
            this.requestFullScreen();
        } else {
            this.exitFullScreen();
        }
    }
    
    requestFullScreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
    }
    
    exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }

    createMapSelectionButton() {
        // Get responsive configuration
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        
        // Button dimensions and position
        const buttonWidth = responsiveConfig.IS_MOBILE ? 60 : 120;
        const buttonHeight = responsiveConfig.IS_MOBILE ? 25 : 35;
        
        // Position relative to sound button
        let buttonX, buttonY;
        if (responsiveConfig.IS_MOBILE) {
            // Position above the sound button on mobile
            buttonX = responsiveConfig.GAME_WIDTH - buttonWidth - 10;
            buttonY = 45;
        } else {
            // Position to the left of sound button on desktop
            buttonX = responsiveConfig.GAME_WIDTH - buttonWidth - 80;
            buttonY = 15;
        }

        // Create button container
        this.mapSelectionButton = this.scene.add.container(buttonX, buttonY);

        // Create button background
        const buttonBg = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 
            GameConfig.COLORS.BUTTON_BLUE)
            .setOrigin(0, 0)
            .setInteractive();

        // Add button shadow
        const shadow = this.scene.add.rectangle(2, 2, buttonWidth, buttonHeight, 
            GameConfig.COLORS.BUTTON_SHADOW, GameConfig.COLORS.BUTTON_SHADOW_ALPHA)
            .setOrigin(0, 0);

        // Button text
        const buttonText = this.scene.add.text(buttonWidth / 2, buttonHeight / 2, 
            responsiveConfig.IS_MOBILE ? 'Maps' : 'Select Map', {
            fontSize: responsiveConfig.IS_MOBILE ? '12px' : '16px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        // Add elements to container
        this.mapSelectionButton.add([shadow, buttonBg, buttonText]);

        // Hover effects
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(GameConfig.COLORS.BUTTON_BLUE_HOVER);
            this.scene.tweens.add({
                targets: this.mapSelectionButton,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power2'
            });
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(GameConfig.COLORS.BUTTON_BLUE);
            this.scene.tweens.add({
                targets: this.mapSelectionButton,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });

        // Click handler
        buttonBg.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: this.mapSelectionButton,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                ease: 'Power2'
            });
        });

        buttonBg.on('pointerup', () => {
            this.returnToMapSelection();
        });

        // Store references for cleanup
        this.mapSelectionButton.buttonBg = buttonBg;
        this.mapSelectionButton.buttonText = buttonText;
        this.mapSelectionButton.shadow = shadow;
    }

    returnToMapSelection() {
        // Trigger haptic feedback on mobile
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        if (responsiveConfig.IS_MOBILE && navigator.vibrate) {
            navigator.vibrate(50);
        }

        // Start the map selection scene
        this.scene.scene.start('MapSelectionScene');
    }
}

// Export for Node/CommonJS and also attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}