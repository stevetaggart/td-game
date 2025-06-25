class TowerDefenseGame extends Phaser.Scene {
    constructor() {
        super({ key: 'TowerDefenseGame' });
    }

    preload() {
        // Load the correct image for each tower type
        this.load.image('basicTower', 'basic_tower_topdown_40x40.svg');
        this.load.image('rapidTower', 'rapid_tower_topdown_40x40.svg');
        this.load.image('cannonTower', 'canon_tower_topdown_40x40.svg');
        
        // Load the enemy path SVG
        this.load.image('enemyPath', 'enemy_path_no_bg.svg');
        
        // Load enemy sprites
        this.load.image('enemy', 'enemy_basic.svg');
        this.load.image('strongEnemy', 'enemy_strong.svg');
        
        this.createBulletSprites();
        this.createGhostTowerSprites();
        this.createPlacementIndicators();
    }

    createBulletSprites() {
        // Basic bullet
        const graphics1 = this.add.graphics();
        graphics1.fillStyle(0xf1c40f);
        graphics1.fillCircle(8, 8, 6);
        graphics1.fillStyle(0xffffff);
        graphics1.fillCircle(8, 8, 2);
        graphics1.generateTexture('bullet', 16, 16);
        graphics1.destroy();

        // Cannon ball
        const graphics2 = this.add.graphics();
        graphics2.fillStyle(0x2c3e50);
        graphics2.fillCircle(12, 12, 10);
        graphics2.fillStyle(0x95a5a6);
        graphics2.fillCircle(12, 12, 8);
        graphics2.fillStyle(0x34495e);
        graphics2.fillCircle(10, 10, 4);
        graphics2.generateTexture('cannonBall', 24, 24);
        graphics2.destroy();
    }

    createGhostTowerSprites() {
        // Ghost Basic Tower (semi-transparent)
        const graphics1 = this.add.graphics();
        graphics1.fillStyle(0x8b4513, 0.5);
        graphics1.fillRect(4, 24, 32, 16);
        graphics1.fillStyle(0xa0522d, 0.5);
        graphics1.fillRect(12, 8, 16, 32);
        graphics1.fillStyle(0x696969, 0.5);
        graphics1.fillRect(24, 16, 12, 8);
        graphics1.fillStyle(0x2ecc71, 0.5);
        graphics1.fillRect(14, 10, 12, 4);
        graphics1.fillRect(14, 18, 12, 4);
        graphics1.generateTexture('ghostBasicTower', 40, 40);
        graphics1.destroy();

        // Ghost Rapid Tower
        const graphics2 = this.add.graphics();
        graphics2.fillStyle(0x8b4513, 0.5);
        graphics2.fillRect(4, 24, 32, 16);
        graphics2.fillStyle(0x2c3e50, 0.5);
        graphics2.fillRect(12, 8, 16, 32);
        graphics2.fillStyle(0x696969, 0.5);
        graphics2.fillRect(24, 12, 12, 4);
        graphics2.fillRect(24, 24, 12, 4);
        graphics2.fillStyle(0xe74c3c, 0.5);
        graphics2.fillRect(14, 10, 12, 4);
        graphics2.fillRect(14, 18, 12, 4);
        graphics2.fillRect(14, 26, 12, 4);
        graphics2.generateTexture('ghostRapidTower', 40, 40);
        graphics2.destroy();

        // Ghost Cannon Tower
        const graphics3 = this.add.graphics();
        graphics3.fillStyle(0x8b4513, 0.5);
        graphics3.fillRect(2, 32, 46, 18);
        graphics3.fillStyle(0x34495e, 0.5);
        graphics3.fillRect(10, 4, 30, 46);
        graphics3.fillStyle(0x696969, 0.5);
        graphics3.fillRect(36, 20, 20, 10);
        graphics3.fillStyle(0x2c3e50, 0.5);
        graphics3.fillRect(52, 22, 4, 6);
        graphics3.fillStyle(0x9b59b6, 0.5);
        graphics3.fillRect(12, 6, 26, 6);
        graphics3.fillRect(12, 16, 26, 6);
        graphics3.fillRect(12, 26, 26, 6);
        graphics3.generateTexture('ghostCannonTower', 50, 50);
        graphics3.destroy();
    }

    createPlacementIndicators() {
        // Valid placement indicator (green circle)
        const validGraphics = this.add.graphics();
        validGraphics.lineStyle(3, 0x27ae60, 0.8);
        validGraphics.strokeCircle(15, 15, 12);
        validGraphics.fillStyle(0x27ae60, 0.2);
        validGraphics.fillCircle(15, 15, 12);
        validGraphics.generateTexture('validPlacement', 30, 30);
        validGraphics.destroy();

        // Invalid placement indicator (red circle)
        const invalidGraphics = this.add.graphics();
        invalidGraphics.lineStyle(3, 0xe74c3c, 0.8);
        invalidGraphics.strokeCircle(15, 15, 12);
        invalidGraphics.fillStyle(0xe74c3c, 0.2);
        invalidGraphics.fillCircle(15, 15, 12);
        // Add X mark
        invalidGraphics.lineStyle(2, 0xe74c3c);
        invalidGraphics.beginPath();
        invalidGraphics.moveTo(9, 9);
        invalidGraphics.lineTo(21, 21);
        invalidGraphics.moveTo(21, 9);
        invalidGraphics.lineTo(9, 21);
        invalidGraphics.strokePath();
        invalidGraphics.generateTexture('invalidPlacement', 30, 30);
        invalidGraphics.destroy();
    }

    createUI() {
        // Create stats panel as a horizontal bar at the top
        const statsPanel = this.add.rectangle(0, 0, 1200, 80, 0x000000, 0.7)
            .setOrigin(0, 0);
        
        // Stats text - arranged horizontally with larger font
        this.healthText = this.add.text(40, 25, 'Health: 100', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0, 0);
        
        this.moneyText = this.add.text(300, 25, 'Money: 100', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0, 0);
        
        this.waveText = this.add.text(560, 25, 'Wave: 1', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0, 0);
        
        this.enemiesText = this.add.text(820, 25, 'Enemies: 10', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0, 0);

        // Create bottom button panel
        const buttonPanel = this.add.rectangle(0, 720, 1200, 80, 0x000000, 0.7)
            .setOrigin(0, 0);

        // Calculate button positions for even spacing
        const buttonWidth = 200;  // Reduced from 240
        const buttonSpacing = 40; // Space between buttons
        const startX = 40;        // Starting X position
        const buttonY = 730;      // Y position for all buttons

        // Store references to tower buttons
        this.towerButtons = [];

        // Create tower buttons with new spacing
        this.towerButtons.push(this.createTowerButton(startX, buttonY, 'Basic Tower ($20)', 'basicTower', 20));
        this.towerButtons.push(this.createTowerButton(startX + buttonWidth + buttonSpacing, buttonY, 'Rapid Fire ($40)', 'rapidTower', 40));
        this.towerButtons.push(this.createTowerButton(startX + (buttonWidth + buttonSpacing) * 2, buttonY, 'Cannon ($60)', 'cannonTower', 60));
        this.towerButtons.push(this.createTowerButton(startX + (buttonWidth + buttonSpacing) * 3, buttonY, 'Upgrade ($30)', 'upgradeTower', 30));

        // Create start wave button container
        const startWaveContainer = this.add.container(1100, 755);

        // Add button shadow
        const startWaveShadow = this.add.rectangle(2, 2, 120, 50, 0x000000, 0.3)
            .setOrigin(0.5);

        // Create start wave button with adjusted position
        this.startWaveButton = this.add.rectangle(0, 0, 140, 50, 0x2ecc71)
            .setOrigin(0.5)
            .setInteractive();

        // Add glow effect
        const startWaveGlow = this.add.rectangle(0, 0, 124, 54, 0x2ecc71, 0.2)
            .setOrigin(0.5)
            .setVisible(false);

        // Add text with improved styling
        const startWaveText = this.add.text(0, 0, 'Start Wave', {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add all elements to container
        startWaveContainer.add([startWaveShadow, startWaveGlow, this.startWaveButton, startWaveText]);

        // Add hover effect
        this.startWaveButton.on('pointerover', () => {
            if (!this.waveActive && !this.gameOver) {
                this.startWaveButton.setFillStyle(0x27ae60);
                this.tweens.add({
                    targets: this.startWaveButton,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100,
                    ease: 'Power2'
                });
            }
        });

        this.startWaveButton.on('pointerout', () => {
            if (!this.waveActive && !this.gameOver) {
                this.startWaveButton.setFillStyle(0x2ecc71);
                this.tweens.add({
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
            if (!this.waveActive && !this.gameOver) {
                this.tweens.add({
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
            if (!this.waveActive && !this.gameOver) {
                this.startWave();
                startWaveGlow.setVisible(true);
                this.startWaveButton.setFillStyle(0x27ae60);
            }
        });

        // Store reference to glow
        this.startWaveButton.glow = startWaveGlow;
    }

    createTowerButton(x, y, text, type, cost) {
        const buttonContainer = this.add.container(x, y);
        
        // Create button background with reduced width
        const button = this.add.rectangle(0, 0, 200, 50, 0x3498db)
            .setOrigin(0, 0)
            .setInteractive();

        // Add button shadow
        const shadow = this.add.rectangle(2, 2, 200, 50, 0x000000, 0.3)
            .setOrigin(0, 0);

        // Create selection indicator (initially hidden)
        const selectionIndicator = this.add.rectangle(0, 0, 204, 54, 0xffff00, 0.5)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add glow effect for selected state
        const glow = this.add.rectangle(0, 0, 204, 54, 0xffff00, 0.2)
            .setOrigin(0, 0)
            .setVisible(false);

        // Add text
        const buttonText = this.add.text(20, 25, text, {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Add all elements to container
        buttonContainer.add([shadow, selectionIndicator, glow, button, buttonText]);

        // Store references
        button.selectionIndicator = selectionIndicator;
        button.glow = glow;
        button.cost = cost;
        button.type = type;

        // Add hover effect
        button.on('pointerover', () => {
            if (this.money >= cost) {
                button.setFillStyle(0x2980b9);
                this.tweens.add({
                    targets: button,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 100,
                    ease: 'Power2'
                });
            } else {
                button.setFillStyle(0x7f8c8d);
                button.setAlpha(0.7);
            }
        });

        button.on('pointerout', () => {
            this.updateButtonState(button);
        });

        // Add press effect
        button.on('pointerdown', () => {
            if (this.money >= cost) {
                this.tweens.add({
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
            if (this.money >= cost) {
                // If this button is already selected, deselect it
                if (this.selectedTowerType === type) {
                    this.selectedTowerType = null;
                    this.clearTowerButtonSelection();
                    button.selectionIndicator.setVisible(false);
                    // Remove pressed style if any
                    button.setFillStyle(0x3498db);
                } else {
                    this.selectedTowerType = type;
                    this.clearTowerButtonSelection();
                    button.selectionIndicator.setVisible(true);
                    button.glow.setVisible(true);
                    button.setFillStyle(0x2980b9);
                }
                if (this.selectedTowerType === 'upgradeTower') {
                    this.upgradeTower(this.selectedTower)
                }
            }
        });

        // Update button state based on money
        this.updateButtonState(button);

        return buttonContainer;
    }

    updateButtonState(button) {
        if (this.money < button.cost) {
            button.setFillStyle(0x7f8c8d);
            button.setAlpha(0.7);
        } else {
            button.setFillStyle(0x3498db);
            button.setAlpha(1);
        }
    }

    clearTowerButtonSelection() {
        if (this.towerButtons) {
            this.towerButtons.forEach(container => {
                const button = container.list.find(child => child.type === 'Rectangle' && child.input && child.input.enabled);
                if (button && button.selectionIndicator) {
                    button.selectionIndicator.setVisible(false);
                    button.glow.setVisible(false);
                    button.setFillStyle(0x3498db);
                }
            });
        }
    }

    createGameOverScreen() {
        this.gameOverScreen = this.add.container(600, 400);
        this.gameOverScreen.setVisible(false);

        const background = this.add.rectangle(0, 0, 600, 400, 0x000000, 0.9)
            .setOrigin(0.5);

        const gameOverText = this.add.text(0, -150, '💀 GAME OVER 💀', {
            fontSize: '48px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.finalWaveText = this.add.text(0, -80, 'Final Wave: 0', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.towersBuiltText = this.add.text(0, -20, 'Towers Built: 0', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        this.enemiesDefeatedText = this.add.text(0, 40, 'Enemies Defeated: 0', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        const restartButton = this.add.rectangle(0, 120, 300, 60, 0x2ecc71)
            .setOrigin(0.5)
            .setInteractive();

        const restartButtonText = this.add.text(0, 120, '🔄 Restart Game', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        restartButton.on('pointerdown', () => {
            this.restartGame();
        });

        this.gameOverScreen.add([background, gameOverText, this.finalWaveText, 
            this.towersBuiltText, this.enemiesDefeatedText, restartButton, restartButtonText]);
    }

    create() {
        this.health = 100;
        this.money = 300;
        this.wave = 1;
        this.enemiesInWave = 7;
        this.enemiesSpawned = 0;
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.waveActive = false;
        this.gameOver = false;
        this.towersBuilt = 0;
        this.enemiesDefeated = 0;

        // Ghost tower for placement preview
        this.ghostTower = null;
        this.placementIndicator = null;
        
        // Define path with adjusted coordinates to respect UI bars
        this.path = [
            { x: 0, y: 400 },
            { x: 200, y: 400 },
            { x: 200, y: 200 },
            { x: 400, y: 200 },
            { x: 400, y: 500 },
            { x: 600, y: 500 },
            { x: 600, y: 300 },
            { x: 800, y: 300 },
            { x: 800, y: 400 },
            { x: 1000, y: 400 },
            { x: 1000, y: 200 },
            { x: 1200, y: 200 }
        ];

        // Add the enemy path SVG image instead of drawing with graphics
        this.add.image(600, 400, 'enemyPath').setOrigin(0.5);

        // Create groups
        this.towers = this.add.group();
        this.enemies = this.add.group();
        this.bullets = this.add.group();

        // Input handling
        this.input.on('pointerdown', this.handleClick, this);
        this.input.on('pointermove', this.handleMouseMove, this);

        // Create spawn timer but don't start it
        this.spawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
            paused: true
        });

        // Add UI elements
        this.createUI();
        this.createGameOverScreen();

        this.updateUI();
    }

    createMuzzleFlash(x, y) {
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 0.8);
        flash.fillCircle(x, y, 8);
        flash.fillStyle(0xf1c40f, 0.6);
        flash.fillCircle(x, y, 5);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 100,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }

    createDeathEffect(x, y) {
        // Create explosion effect
        const explosion = this.add.graphics();
        explosion.fillStyle(0xe74c3c, 0.8);
        explosion.fillCircle(x, y, 3);
        explosion.fillStyle(0xf39c12, 0.6);
        explosion.fillCircle(x, y, 6);
        explosion.fillStyle(0xffffff, 0.4);
        explosion.fillCircle(x, y, 9);
        
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: 3,
            scaleY: 3,
            duration: 200,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
    }

    createPlacementEffect(x, y) {
        // Create a temporary visual effect when placing towers
        const effect = this.add.graphics();
        effect.lineStyle(3, 0x27ae60, 1);
        effect.strokeCircle(x, y, 5);
        
        this.tweens.add({
            targets: effect,
            alpha: 0,
            scaleX: 3,
            scaleY: 3,
            duration: 300,
            ease: 'Power2',
            onComplete: () => effect.destroy()
        });
    }

    handleMouseMove(pointer) {
        if (!this.selectedTowerType || this.gameOver) {
            this.hideGhostTower();
            return;
        }

        const x = pointer.x;
        const y = pointer.y;

        // Check if cursor is over either UI bar (y < 80 for top bar, y >= 720 for bottom bar)
        if (y < 80 || y >= 720) {
            this.hideGhostTower();
            return;
        }

        const canPlace = this.canPlaceTower(x, y);
        const towerConfig = this.getTowerConfig(this.selectedTowerType);
        const hasEnoughMoney = this.money >= towerConfig.cost;

        this.showGhostTower(x, y, canPlace && hasEnoughMoney);
    }

    showGhostTower(x, y, canPlace) {
        // Remove existing ghost tower
        this.hideGhostTower();

        // Use the correct image for each tower type
        let spriteKey = 'basicTower';
        if (this.selectedTowerType === 'rapidTower') {
            spriteKey = 'rapidTower';
        } else if (this.selectedTowerType === 'cannonTower') {
            spriteKey = 'cannonTower';
        }
        this.ghostTower = this.add.sprite(x, y, spriteKey);
        this.ghostTower.setAlpha(0.7);

        // Create placement indicator
        const indicatorTexture = canPlace ? 'validPlacement' : 'invalidPlacement';
        this.placementIndicator = this.add.sprite(x, y, indicatorTexture);
        this.placementIndicator.setAlpha(0.8);

        // Show range preview if valid placement
        if (canPlace) {
            const towerConfig = this.getTowerConfig(this.selectedTowerType);
            this.ghostTower.rangePreview = this.add.graphics();
            this.ghostTower.rangePreview.lineStyle(2, 0x27ae60, 0.4);
            this.ghostTower.rangePreview.strokeCircle(x, y, towerConfig.range);
            this.ghostTower.rangePreview.fillStyle(0x27ae60, 0.1);
            this.ghostTower.rangePreview.fillCircle(x, y, towerConfig.range);
        }
    }

    hideGhostTower() {
        if (this.ghostTower) {
            if (this.ghostTower.rangePreview) {
                this.ghostTower.rangePreview.destroy();
            }
            this.ghostTower.destroy();
            this.ghostTower = null;
        }
        if (this.placementIndicator) {
            this.placementIndicator.destroy();
            this.placementIndicator = null;
        }
    }

    endGame() {
        this.gameOver = true;
        this.waveActive = false;
        this.spawnTimer.paused = true;
        
        // Stop all game activity
        this.enemies.children.entries.forEach(enemy => {
            enemy.healthBar.destroy();
            enemy.destroy();
        });
        this.bullets.children.entries.forEach(bullet => {
            bullet.destroy();
        });
        
        // Show game over screen
        this.gameOverScreen.setVisible(true);
        this.finalWaveText.setText(`Final Wave: ${this.wave}`);
        this.towersBuiltText.setText(`Towers Built: ${this.towersBuilt}`);
        this.enemiesDefeatedText.setText(`Enemies Defeated: ${this.enemiesDefeated}`);
    }

    restartGame() {
        // Reset all game variables
        this.health = 100;
        this.money = 100;
        this.wave = 1;
        this.enemiesInWave = 10;
        this.enemiesSpawned = 0;
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.waveActive = false;
        this.gameOver = false;
        this.towersBuilt = 0;
        this.enemiesDefeated = 0;

        // Clear all game objects
        this.towers.children.entries.forEach(tower => {
            if (tower.rangeGraphics) {
                tower.rangeGraphics.destroy();
            }
            tower.destroy();
        });
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.healthBar) {
                enemy.healthBar.destroy();
            }
            enemy.destroy();
        });
        this.bullets.children.entries.forEach(bullet => {
            bullet.destroy();
        });

        // Reset timer
        this.spawnTimer.paused = true;

        // Clear ghost tower
        this.hideGhostTower();

        // Hide game over screen and update UI
        this.gameOverScreen.setVisible(false);
        this.updateUI();
    }

    handleClick(pointer) {
        const x = pointer.x;
        const y = pointer.y;

        // Don't allow tower placement if clicking in either UI bar
        if (y < 80 || y >= 720) {
            return;
        }

        // Check if clicking on existing tower
        const clickedTower = this.towers.children.entries.find(tower => 
            Phaser.Geom.Rectangle.Contains(tower.getBounds(), x, y)
        );

        if (clickedTower) {
            this.selectTower(clickedTower);
            this.selectedTowerType = null;
            this.hideGhostTower();
            this.clearTowerButtonSelection();
            return;
        }

        // Check if we can place a tower here
        if (this.selectedTowerType && this.canPlaceTower(x, y)) {
            this.placeTower(x, y);
            this.hideGhostTower();
        }
    }

    canPlaceTower(x, y) {
        // Check if position is too close to any path segment
        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            // Calculate the closest point on the segment to (x, y)
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const lengthSq = dx * dx + dy * dy;
            let t = 0;
            if (lengthSq > 0) {
                t = ((x - p1.x) * dx + (y - p1.y) * dy) / lengthSq;
                t = Math.max(0, Math.min(1, t));
            }
            const closestX = p1.x + t * dx;
            const closestY = p1.y + t * dy;
            if (Phaser.Math.Distance.Between(x, y, closestX, closestY) < 40) {
                return false;
            }
        }

        // Check if position overlaps with existing towers
        for (let tower of this.towers.children.entries) {
            if (Phaser.Math.Distance.Between(x, y, tower.x, tower.y) < 30) {
                return false;
            }
        }

        return true;
    }

    placeTower(x, y) {
        const towerConfig = this.getTowerConfig(this.selectedTowerType);
        
        if (this.money >= towerConfig.cost) {
            // Use the correct image for each tower type
            let spriteKey = 'basicTower';
            if (this.selectedTowerType === 'rapidTower') {
                spriteKey = 'rapidTower';
            } else if (this.selectedTowerType === 'cannonTower') {
                spriteKey = 'cannonTower';
            }
            const tower = this.add.sprite(x, y, spriteKey);
            tower.setInteractive();
            tower.towerType = this.selectedTowerType;
            tower.damage = towerConfig.damage;
            tower.range = towerConfig.range;
            tower.fireRate = towerConfig.fireRate;
            tower.level = 1;
            tower.lastFired = 0;

            // Add range indicator
            tower.rangeGraphics = this.add.graphics();
            tower.rangeGraphics.lineStyle(1, 0xffffff, 0.3);
            tower.rangeGraphics.strokeCircle(x, y, towerConfig.range);
            tower.rangeGraphics.setVisible(false);

            // Add visual effects for placement
            this.createPlacementEffect(x, y);

            // Clear any lingering placement effects (ghosts, indicators)
            this.hideGhostTower();

            this.towers.add(tower);
            this.money -= towerConfig.cost;
            this.towersBuilt++;
        }
    }

    selectTower(tower) {
        // Clear previous selection
        if (this.selectedTower) {
            this.selectedTower.rangeGraphics.setVisible(false);
            this.selectedTower.clearTint();
            // Reset scale and stop tweens
            this.selectedTower.setScale(1, 1);
            if (this.selectedTower.pulseTween) {
                this.selectedTower.pulseTween.stop();
                this.selectedTower.pulseTween = null;
            }
        }

        this.selectedTower = tower;
        tower.rangeGraphics.setVisible(true);
        tower.setTint(0xffff00);

        // Add pulsing effect to selected tower
        tower.setScale(1, 1);
        tower.pulseTween = this.tweens.add({
            targets: tower,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    getTowerConfig(type) {
        const configs = {
            basicTower: { cost: 20, damage: 20, range: 80, fireRate: 1000 },
            rapidTower: { cost: 40, damage: 10, range: 60, fireRate: 300 },
            cannonTower: { cost: 60, damage: 50, range: 100, fireRate: 1500 }
        };
        return configs[type];
    }

    spawnEnemy() {
        if (this.enemiesSpawned >= this.enemiesInWave || !this.waveActive) {
            return;
        }

        // Use stronger enemies in later waves
        const enemyType = this.wave > 3 && Math.random() < 0.3 ? 'strongEnemy' : 'enemy';
        const enemy = this.add.sprite(this.path[0].x, this.path[0].y, enemyType);
        
        if (enemyType === 'strongEnemy') {
            enemy.health = 100 + (this.wave - 1) * 30;
            enemy.maxHealth = enemy.health;
            enemy.speed = 40 + (this.wave - 1) * 8;
            enemy.value = 10 + (this.wave - 1) * 3;
        } else {
            enemy.health = 50 + (this.wave - 1) * 20;
            enemy.maxHealth = enemy.health;
            enemy.speed = 50 + (this.wave - 1) * 10;
            enemy.value = 5 + this.wave - 1;
        }
        
        enemy.pathIndex = 0;

        // Health bar
        enemy.healthBar = this.add.graphics();
        this.updateEnemyHealthBar(enemy);

        this.enemies.add(enemy);
        this.enemiesSpawned++;
    }

    updateEnemyHealthBar(enemy) {
        enemy.healthBar.clear();
        const barWidth = 20;
        const barHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        enemy.healthBar.fillStyle(0xff0000);
        enemy.healthBar.fillRect(enemy.x - barWidth/2, enemy.y - 15, barWidth, barHeight);
        enemy.healthBar.fillStyle(0x00ff00);
        enemy.healthBar.fillRect(enemy.x - barWidth/2, enemy.y - 15, barWidth * healthPercent, barHeight);
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Move enemies
        this.enemies.children.entries.forEach(enemy => {
            this.moveEnemy(enemy, delta);
        });

        // Update tower rotations and shooting
        this.towers.children.entries.forEach(tower => {
            this.updateTowerRotation(tower);
            this.towerShoot(tower, time);
        });

        // Move bullets
        this.bullets.children.entries.forEach(bullet => {
            this.moveBullet(bullet, delta);
        });

        // Check wave completion
        if (this.waveActive && this.enemiesSpawned >= this.enemiesInWave && this.enemies.children.entries.length === 0) {
            this.endWave();
        }

        // Check game over
        if (this.health <= 0) {
            this.endGame();
        }

        this.updateUI();
    }

    moveEnemy(enemy, delta) {
        if (enemy.pathIndex >= this.path.length - 1) {
            // Enemy reached the end
            this.health -= 10;
            enemy.healthBar.destroy();
            enemy.destroy();
            return;
        }

        const target = this.path[enemy.pathIndex + 1];
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);
        
        if (distance < 5) {
            enemy.pathIndex++;
        } else {
            const moveDistance = (enemy.speed * delta) / 1000;
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, target.x, target.y);
            enemy.x += Math.cos(angle) * moveDistance;
            enemy.y += Math.sin(angle) * moveDistance;
        }

        this.updateEnemyHealthBar(enemy);
    }

    towerShoot(tower, time) {
        if (time - tower.lastFired < tower.fireRate) return;

        const enemiesInRange = this.enemies.children.entries.filter(enemy => 
            Phaser.Math.Distance.Between(tower.x, tower.y, enemy.x, enemy.y) <= tower.range
        );

        if (enemiesInRange.length > 0) {
            const target = enemiesInRange[0];
            
            // Rotate rapid and cannon towers to face the enemy
            if (tower.towerType === 'rapidTower' || tower.towerType === 'cannonTower') {
                const angleToTarget = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
                // Convert angle to degrees and rotate the sprite
                const angleInDegrees = Phaser.Math.RadToDeg(angleToTarget);
                tower.setRotation(angleToTarget);
            }
            
            const bulletTexture = tower.towerType === 'cannonTower' ? 'cannonBall' : 'bullet';
            const bullet = this.add.sprite(tower.x, tower.y, bulletTexture);
            bullet.damage = tower.damage;
            bullet.speed = 300;
            bullet.startX = tower.x;
            bullet.startY = tower.y;
            bullet.range = tower.range;
            bullet.angleToTarget = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
            bullet.dirX = Math.cos(bullet.angleToTarget);
            bullet.dirY = Math.sin(bullet.angleToTarget);
            bullet.target = target;
            this.bullets.add(bullet);
            tower.lastFired = time;
        }
    }

    updateTowerRotation(tower) {
        // Only rotate rapid and cannon towers
        if (tower.towerType !== 'rapidTower' && tower.towerType !== 'cannonTower') {
            return;
        }

        const enemiesInRange = this.enemies.children.entries.filter(enemy => 
            Phaser.Math.Distance.Between(tower.x, tower.y, enemy.x, enemy.y) <= tower.range
        );

        if (enemiesInRange.length > 0) {
            const target = enemiesInRange[0];
            const angleToTarget = Phaser.Math.Angle.Between(tower.x, tower.y, target.x, target.y);
            tower.setRotation(angleToTarget);
        } 
    }

    moveBullet(bullet, delta) {
        if (typeof bullet.startX !== 'number' || typeof bullet.startY !== 'number') {
            bullet.destroy();
            return;
        }
        const moveDistance = (bullet.speed * delta) / 1000;
        bullet.x += bullet.dirX * moveDistance;
        bullet.y += bullet.dirY * moveDistance;
        const traveled = Phaser.Math.Distance.Between(bullet.startX, bullet.startY, bullet.x, bullet.y);
        if (traveled > bullet.range) {
            bullet.destroy();
            return;
        }
        if (bullet.target && bullet.target.active) {
            // Use enemy's size for hit radius
            const enemyRadius = (bullet.target.displayWidth || 32) / 2; // fallback if not set
            const hitDist = Phaser.Math.Distance.Between(bullet.x, bullet.y, bullet.target.x, bullet.target.y);
            if (hitDist < enemyRadius) {
                bullet.target.health -= bullet.damage;
                if (bullet.target.health <= 0) {
                    this.money += bullet.target.value;
                    this.enemiesDefeated++;
                    bullet.target.healthBar.destroy();
                    bullet.target.destroy();
                }
                bullet.destroy();
            }
        }
    }

    startWave() {
        if (this.waveActive || this.gameOver) return;
        
        this.waveActive = true;
        this.spawnTimer.paused = false;
    }

    endWave() {
        this.waveActive = false;
        this.spawnTimer.paused = true;
        this.money += 50;
        this.nextWave();
    }

    nextWave() {
        this.wave++;
        this.enemiesInWave = 7 + (this.wave - 1) * 2;
        this.enemiesSpawned = 0;
    }

    upgradeTower() {
        if (!this.selectedTower || this.money < 30) return;

        // Deduct money
        this.money -= 30;

        // Upgrade stats
        this.selectedTower.level = (this.selectedTower.level || 1) + 1;
        this.selectedTower.damage = (this.selectedTower.damage || 0) + 10;
        this.selectedTower.range = (this.selectedTower.range || 0) + 10;

        // Create upgrade effect
        this.createUpgradeEffect(this.selectedTower.x, this.selectedTower.y);

        // Update range graphics
        if (this.selectedTower.rangeGraphics) {
            this.selectedTower.rangeGraphics.clear();
            this.selectedTower.rangeGraphics.lineStyle(1, 0xffffff, 0.3);
            this.selectedTower.rangeGraphics.strokeCircle(this.selectedTower.x, this.selectedTower.y, this.selectedTower.range);
        }
    }

    createUpgradeEffect(x, y) {
        const upgrade = this.add.graphics();
        upgrade.lineStyle(2, 0x3498db, 1);
        upgrade.strokeCircle(x, y, 10);
        upgrade.lineStyle(2, 0x9b59b6, 1);
        upgrade.strokeCircle(x, y, 15);
        
        this.tweens.add({
            targets: upgrade,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 400,
            ease: 'Power2',
            onComplete: () => upgrade.destroy()
        });
    }

    updateUI() {
        this.healthText.setText(`Health: ${this.health}`);
        this.moneyText.setText(`Money: ${this.money}`);
        this.waveText.setText(`Wave: ${this.wave}`);
        this.enemiesText.setText(`Enemies: ${this.enemiesInWave - this.enemiesSpawned}`);
    }
}

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'gameContainer',
    backgroundColor: '#2c3e50',
    scene: TowerDefenseGame,
    physics: {
        default: 'arcade'
    }
};

const game = new Phaser.Game(config);
