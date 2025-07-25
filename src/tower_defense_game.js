import Phaser from 'phaser';
import GameConfig from './game-config.js';
import DefaultMap from './maps/default-map.js';
import { PathManager, GameStateManager, WaveManager, TowerPlacementManager } from './game-systems.js';
import EffectsManager from './effects-manager.js';

class TowerDefenseGame extends Phaser.Scene {
    // Pause/resume and speed control for UIManager
    pauseGame() {
        this._isPaused = true;
        this.physics.world.isPaused = true;
        this.time.timeScale = 0;
        if (this.waveManager && this.waveManager.spawnTimer) this.waveManager.spawnTimer.paused = true;
    }

    resumeGame() {
        this._isPaused = false;
        this.physics.world.isPaused = false;
        this.time.timeScale = this._gameSpeed || 1;
        if (this.waveManager && this.waveManager.spawnTimer) this.waveManager.spawnTimer.paused = false;
    }

    setGameSpeed(mult) {
        this._gameSpeed = mult;
        if (!this.physics.world.isPaused) {
            this.time.timeScale = mult;
        }

        // Adjust tower fire rates
        if (this.towers && this.towers.children && this.towers.children.entries) {
            this.towers.children.entries.forEach(tower => {
                if (!tower._originalFireRate) {
                    tower._originalFireRate = tower.fireRate;
                }
                if (mult === 1) {
                    tower.fireRate = tower._originalFireRate;
                } else {
                    tower.fireRate = tower._originalFireRate / mult;
                }
            });
        }

        // Adjust enemy speeds (apply to all current and future enemies)
        this._enemySpeedMult = mult;
        if (this.enemies && this.enemies.children && this.enemies.children.entries) {
            this.enemies.children.entries.forEach(enemy => {
                // Always use the true base speed for scaling
                if (typeof enemy.baseSpeed === 'number') {
                    enemy.speed = enemy.baseSpeed * mult;
                }
            });
        }
    }
    constructor() {
        super({ key: 'TowerDefenseGame' });
    }

    preload() {
        // Load the correct image for each tower type
        this.load.image('basicTower', GameConfig.ASSETS.basicTower);
        this.load.image('rapidTower', GameConfig.ASSETS.rapidTower);
        this.load.image('cannonTower', GameConfig.ASSETS.cannonTower);
        this.load.image('multishotTower', GameConfig.ASSETS.multishotTower);
        
        // Load map configurations first
        this.loadMapConfiguration();
        
        // Load the enemy path SVG based on selected map
        this.load.image('enemyPath', this.currentMapConfig.pathImage);
        
        // Load enemy sprites
        this.load.image('enemy', GameConfig.ASSETS.enemy);
        this.load.image('strongEnemy', GameConfig.ASSETS.strongEnemy);
        this.load.image('bossEnemy', GameConfig.ASSETS.bossEnemy);
        
        // Load bullet SVGs
        this.load.image('bullet', GameConfig.ASSETS.bullet);
        this.load.image('cannonBall', GameConfig.ASSETS.cannonBall);
        
        // Load sound effects
        this.load.audio('shot', '/assets/sounds/shot_01.ogg');
        this.load.audio('cannon', '/assets/sounds/cannon_01.ogg');
        
        // Load UI icons
        this.load.image('speakerOn', GameConfig.ASSETS.speakerOn);
        this.load.image('speakerOff', GameConfig.ASSETS.speakerOff);
        this.load.image('autoStart', GameConfig.ASSETS.autoStart);
        this.load.image('help', GameConfig.ASSETS.help);
        
        this.createGhostTowerSprites();
        this.createPlacementIndicators();
    }

    createGhostTowerSprites() {
        // Ghost Multishot Tower
        const graphics4 = this.add.graphics();
        graphics4.fillStyle(GameConfig.COLORS.GHOST_MULTISHOT_BASE, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics4.fillRect(8, 8, 24, 24);
        graphics4.lineStyle(2, GameConfig.COLORS.GHOST_MULTISHOT_BARREL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics4.strokeRect(8, 8, 24, 24);
        graphics4.fillStyle(GameConfig.COLORS.GHOST_MULTISHOT_CORE, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics4.fillCircle(20, 20, 7);
        graphics4.lineStyle(2, GameConfig.COLORS.GHOST_MULTISHOT_BARREL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics4.strokeCircle(20, 20, 7);
        // Barrels
        graphics4.fillStyle(GameConfig.COLORS.GHOST_MULTISHOT_BARREL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics4.fillRect(18, 4, 4, 10);
        graphics4.fillRect(4, 18, 10, 4);
        graphics4.fillRect(26, 18, 10, 4);
        graphics4.fillRect(18, 26, 4, 10);
        // Center
        graphics4.fillStyle(GameConfig.COLORS.GHOST_MULTISHOT_CENTER, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics4.fillCircle(20, 20, 3);
        graphics4.generateTexture('ghostMultishotTower', 40, 40);
        graphics4.destroy();
        // Ghost Basic Tower (semi-transparent)
        const graphics1 = this.add.graphics();
        graphics1.fillStyle(GameConfig.COLORS.GHOST_BASIC_BASE, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics1.fillRect(4, 24, 32, 16);
        graphics1.fillStyle(GameConfig.COLORS.GHOST_BASIC_BODY, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics1.fillRect(12, 8, 16, 32);
        graphics1.fillStyle(GameConfig.COLORS.GHOST_BASIC_DETAIL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics1.fillRect(24, 16, 12, 8);
        graphics1.fillStyle(GameConfig.COLORS.GHOST_BASIC_ACCENT, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics1.fillRect(14, 10, 12, 4);
        graphics1.fillRect(14, 18, 12, 4);
        graphics1.generateTexture('ghostBasicTower', 40, 40);
        graphics1.destroy();

        // Ghost Rapid Tower
        const graphics2 = this.add.graphics();
        graphics2.fillStyle(GameConfig.COLORS.GHOST_RAPID_BASE, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics2.fillRect(4, 24, 32, 16);
        graphics2.fillStyle(GameConfig.COLORS.GHOST_RAPID_BODY, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics2.fillRect(12, 8, 16, 32);
        graphics2.fillStyle(GameConfig.COLORS.GHOST_RAPID_DETAIL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics2.fillRect(24, 12, 12, 4);
        graphics2.fillRect(24, 24, 12, 4);
        graphics2.fillStyle(GameConfig.COLORS.GHOST_RAPID_ACCENT, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics2.fillRect(14, 10, 12, 4);
        graphics2.fillRect(14, 18, 12, 4);
        graphics2.fillRect(14, 26, 12, 4);
        graphics2.generateTexture('ghostRapidTower', 40, 40);
        graphics2.destroy();

        // Ghost Cannon Tower
        const graphics3 = this.add.graphics();
        graphics3.fillStyle(GameConfig.COLORS.GHOST_CANNON_BASE, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics3.fillRect(2, 32, 46, 18);
        graphics3.fillStyle(GameConfig.COLORS.GHOST_CANNON_BODY, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics3.fillRect(10, 4, 30, 46);
        graphics3.fillStyle(GameConfig.COLORS.GHOST_CANNON_DETAIL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics3.fillRect(36, 20, 20, 10);
        graphics3.fillStyle(GameConfig.COLORS.GHOST_CANNON_BARREL, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics3.fillRect(52, 22, 4, 6);
        graphics3.fillStyle(GameConfig.COLORS.GHOST_CANNON_ACCENT, GameConfig.COLORS.GHOST_TOWER_ALPHA);
        graphics3.fillRect(12, 6, 26, 6);
        graphics3.fillRect(12, 16, 26, 6);
        graphics3.fillRect(12, 26, 26, 6);
        graphics3.generateTexture('ghostCannonTower', 50, 50);
        graphics3.destroy();
    }

    createPlacementIndicators() {
        // Valid placement indicator (green circle)
        const validGraphics = this.add.graphics();
        validGraphics.lineStyle(3, GameConfig.COLORS.VALID_PLACEMENT, 0.8);
        validGraphics.strokeCircle(15, 15, 12);
        validGraphics.fillStyle(GameConfig.COLORS.VALID_PLACEMENT, 0.2);
        validGraphics.fillCircle(15, 15, 12);
        validGraphics.generateTexture('validPlacement', 30, 30);
        validGraphics.destroy();

        // Invalid placement indicator (red circle)
        const invalidGraphics = this.add.graphics();
        invalidGraphics.lineStyle(3, GameConfig.COLORS.INVALID_PLACEMENT, 0.8);
        invalidGraphics.strokeCircle(15, 15, 12);
        invalidGraphics.fillStyle(GameConfig.COLORS.INVALID_PLACEMENT, 0.2);
        invalidGraphics.fillCircle(15, 15, 12);
        // Add X mark
        invalidGraphics.lineStyle(2, GameConfig.COLORS.INVALID_PLACEMENT);
        invalidGraphics.beginPath();
        invalidGraphics.moveTo(9, 9);
        invalidGraphics.lineTo(21, 21);
        invalidGraphics.moveTo(21, 9);
        invalidGraphics.lineTo(9, 21);
        invalidGraphics.strokePath();
        invalidGraphics.generateTexture('invalidPlacement', 30, 30);
        invalidGraphics.destroy();
    }

    loadMapConfiguration() {
        // Load the map configuration
        // In the future, this could be made dynamic to support map selection
        this.currentMapConfig = DefaultMap;
    }

    create() {
        // Initialize game systems
        this.pathManager = new PathManager(this.currentMapConfig);
        this.gameStateManager = new GameStateManager(this);
        this.waveManager = new WaveManager(this);
        this.towerPlacementManager = new TowerPlacementManager(this, this.pathManager);
        this.effectsManager = new EffectsManager(this);
        
        // No longer need this.path; use this.pathManager instead

        // Add the enemy path SVG image instead of drawing with graphics
        this.add.image(GameConfig.GAME_WIDTH / 2, GameConfig.GAME_HEIGHT / 2, 'enemyPath').setOrigin(0.5);

        // Create groups
        this.towers = this.add.group();
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();

        // Initialize UI manager
        this.uiManager = new UIManager(this);
        this.uiManager.createUI();

        // Set initial sound state based on user preference
        if (!this.uiManager.soundEnabled) {
            this.sound.setMute(true);
        }

        // Input handling
        this.input.on('pointerdown', this.handleClick, this);
        this.input.on('pointermove', this.handleMouseMove, this);

        // Keyboard shortcuts for wave and speed control
        this.input.keyboard.on('keydown', (event) => {
            if (this.gameOver) return;
            if (event.code === 'Space') {
                if (!this.waveActive) {
                    this.startWave();
                } else {
                    if (this._isPaused) {
                        this.resumeGame();
                        if (this.uiManager && this.uiManager.playPauseText) {
                            this.uiManager.playPauseState = 'play';
                            this.uiManager.playPauseText.setText('⏸');
                        }
                    } else {
                        this.pauseGame();
                        if (this.uiManager && this.uiManager.playPauseText) {
                            this.uiManager.playPauseState = 'pause';
                            this.uiManager.playPauseText.setText('▶️');
                        }
                    }
                }
            } else if (event.key >= '0' && event.key <= '9' && this.waveActive) {
                const keyNum = parseInt(event.key, 10);
                if (keyNum === 0) {
                    // 0 key pauses/unpauses the game
                    if (this._isPaused) {
                        this.resumeGame();
                        if (this.uiManager && this.uiManager.playPauseText) {
                            this.uiManager.playPauseState = 'play';
                            this.uiManager.playPauseText.setText('⏸');
                        }
                    } else {
                        this.pauseGame();
                        if (this.uiManager && this.uiManager.playPauseText) {
                            this.uiManager.playPauseState = 'pause';
                            this.uiManager.playPauseText.setText('▶️');
                        }
                    }
                } else {
                    // Keys 1-9 set speed multipliers
                    const speed = keyNum;
                    this.setGameSpeed(speed);
                    if (this.uiManager && this.uiManager.speedText) {
                        this.uiManager.speedState = speed;
                        this.uiManager.speedText.setText(`${speed}x`);
                    }
                }
            } else if (['b','r','c','m','B','R','C','M'].includes(event.key)) {
                // Keyboard shortcuts for tower buttons: b=basic, r=rapid, c=cannon, m=multishot
                if (this.gameOver) return;
                const keyToType = {
                    b: 'basicTower',
                    r: 'rapidTower',
                    c: 'cannonTower',
                    m: 'multishotTower',
                    B: 'basicTower',
                    R: 'rapidTower',
                    C: 'cannonTower',
                    M: 'multishotTower',
                };
                const type = keyToType[event.key];
                if (type && this.uiManager && this.uiManager.towerButtons) {
                    // Find the index in TOWER_TYPES (order matches towerButtons)
                    const idx = ['basicTower','rapidTower','cannonTower','multishotTower'].indexOf(type);
                    if (idx !== -1) {
                        const container = this.uiManager.towerButtons[idx];
                        if (container) {
                            // Find the button by its custom type property
                            const button = container.list.find(child => child.type === type);
                            if (button && button.input && button.input.enabled && typeof this.uiManager.handleTowerButtonClick === 'function') {
                                this.uiManager.handleTowerButtonClick(button, type);
                            }
                        }
                    }
                }
            } else if (event.key === 'u' || event.key === 'U') {
                // Keyboard shortcut for Upgrade button
                if (
                    this.uiManager &&
                    this.uiManager.upgradeButton &&
                    typeof this.uiManager.handleUpgradeButtonClick === 'function'
                ) {
                    // Use the same pattern as updateUpgradeButtonText() - find by custom type property
                    const button = this.uiManager.upgradeButton.list.find(child => child.type === 'upgradeTower');
                    if (button && button.input && button.input.enabled) {
                        this.uiManager.handleUpgradeButtonClick(button);
                    }
                }
            } else if (event.key === 'Escape') {
                // Close help dialog
                if (this.uiManager && this.uiManager.helpDialog && this.uiManager.helpDialog.visible) {
                    this.uiManager.hideHelpDialog();
                }
            }
        });

        // Set up physics overlap for bullet-enemy collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyCollision, null, this);
    }

    handleMouseMove(pointer) {
        this.towerPlacementManager.handleMouseMove(pointer);
        if (this.uiManager && this.uiManager.updateTooltipPosition) {
            this.uiManager.updateTooltipPosition(pointer.worldX, pointer.worldY);
        }
        if (this.uiManager && this.uiManager.updateEnemyTooltipPosition) {
            this.uiManager.updateEnemyTooltipPosition(pointer.worldX, pointer.worldY);
        }
    }

    handleClick(pointer) {
        this.towerPlacementManager.handleClick(pointer);
    }

    handleBulletEnemyCollision(bullet, enemy) {
        if (!bullet.active || !enemy.active) return;

        // Simple circle-based collision
        const bulletRadius = bullet.displayWidth / 2;
        const enemyRadius = enemy.displayWidth / 2;
        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bulletRadius + enemyRadius) {
            if (bullet.onHitEnemy) {
                bullet.onHitEnemy(enemy);
            }
        }
    }

    endGame() {
        this.gameStateManager.gameOver = true;
        this.waveManager.waveActive = false;
        this.waveManager.spawnTimer.paused = true;
        
        // Stop all game activity
        this.enemies.children.entries.forEach(enemy => {
            enemy.destroy();
        });
        this.bullets.children.entries.forEach(bullet => {
            bullet.destroy();
        });
        
        // Create game over effect
        this.effectsManager.createGameOverEffect();
        
        // Show game over screen
        this.uiManager.showGameOver();
    }

    restartGame() {
        // Reset all game systems
        this.gameStateManager.reset();
        this.waveManager.reset();
        this.towerPlacementManager.clearSelection();

        // Clear all game objects robustly
        while (this.towers.getLength() > 0) {
            const tower = this.towers.getFirstAlive();
            if (tower) tower.destroy();
            else break;
        }
        while (this.enemies.getLength() > 0) {
            const enemy = this.enemies.getFirstAlive();
            if (enemy) enemy.destroy();
            else break;
        }
        while (this.bullets.getLength() > 0) {
            const bullet = this.bullets.getFirstAlive();
            if (bullet) bullet.destroy();
            else break;
        }
        // As a fallback, clear the groups
        if (this.towers.clear) this.towers.clear(true, true);
        if (this.enemies.clear) this.enemies.clear(true, true);
        if (this.bullets.clear) this.bullets.clear(true, true);

        // Clear ghost tower
        this.towerPlacementManager.hideGhostTower();

        // Ensure wave is not active so Start Wave button is shown
        this.waveActive = false;

        // Resume game (unpause physics, timers, etc.)
        this.resumeGame();

        // Hide game over screen and update UI
        this.uiManager.hideGameOver();
        this.uiManager.updateUI();
        this.uiManager.updateAllButtonStates();
        if (this.uiManager && this.uiManager.updateWaveControlButtons) {
            this.uiManager.updateWaveControlButtons();
        }
    }
    update(time, delta) {
        if (this.gameStateManager.gameOver) return;
        if (this._isPaused) return;

        // Move enemies (iterate backwards to avoid skipping any on removal)
        const enemiesArr = this.enemies.children.entries;
        for (let i = enemiesArr.length - 1; i >= 0; i--) {
            const enemy = enemiesArr[i];
            const stillAlive = enemy.move(delta, this.pathManager.path);
            if (!stillAlive) {
                // Enemy was destroyed (reached end or died)
                this.enemies.remove(enemy);
            }
        }

        // Update tower rotations and shooting
        this.towers.children.entries.forEach(tower => {
            tower.updateRotation();
            const shot = tower.shoot(time);
            if (Array.isArray(shot)) {
                // Multishot returns an array of bullets
                shot.forEach(bullet => {
                    this.bullets.add(bullet);
                    if (bullet.body) {
                        bullet.body.setVelocity(bullet.dirX * bullet.speed, bullet.dirY * bullet.speed);
                    }
                });
            } else if (shot) {
                this.bullets.add(shot);
                if (shot.body) {
                    shot.body.setVelocity(shot.dirX * shot.speed, shot.dirY * shot.speed);
                }
            }
        });

        // Move bullets
        this.bullets.children.entries.forEach(bullet => {
            if (!bullet.active) {
                this.bullets.remove(bullet);
                return;
            }
            // Check if bullet has traveled its range
            const traveled = Phaser.Math.Distance.Between(bullet.startX, bullet.startY, bullet.x, bullet.y);
            if (traveled > bullet.range) {
                bullet.destroy();
                this.bullets.remove(bullet);
            }
        });

        // Check wave completion
        if (this.waveManager.checkWaveCompletion()) {
            this.endWave();
        }

        // Check game over
        if (this.gameStateManager.health <= 0) {
            this.endGame();
        }
    }

    startWave() {
        this.waveManager.startWave();
        // Create wave start effect
        this.effectsManager.createWaveStartEffect(this.waveManager.currentWave);
        if (this.uiManager && this.uiManager.updateWaveControlButtons) {
            this.uiManager.updateWaveControlButtons();
        }
    }

    endWave() {
        this.waveManager.endWave();
        // Do not reset game speed here; keep the current multiplier
        if (this.uiManager && this.uiManager.updateWaveControlButtons) {
            this.uiManager.updateWaveControlButtons();
        }
        
        // Auto-start next wave if enabled and game is not over
        if (this.uiManager && this.uiManager.getAutoStartState() && !this.gameOver) {
            // Add a brief delay before auto-starting the next wave
            this.time.delayedCall(1500, () => {
                if (!this.gameOver && !this.waveManager.waveActive) {
                    this.startWave();
                }
            });
        }
    }

    upgradeTower() {
        this.towerPlacementManager.upgradeTower();
    }

    sellTower() {
        this.towerPlacementManager.sellTower();
    }

    createBossSpawnEffect(x, y) {
        this.effectsManager.createBossSpawnEffect(x, y);
    }

    createBossDeathEffect(x, y) {
        this.effectsManager.createBossDeathEffect(x, y);
    }

    createUpgradeEffect(tower) {
        this.effectsManager.createUpgradeEffect(tower);
    }

    createMuzzleFlash(x, y) {
        this.effectsManager.createMuzzleFlash(x, y);
    }

    createDeathEffect(x, y) {
        this.effectsManager.createDeathEffect(x, y);
    }

    createPlacementEffect(x, y) {
        this.effectsManager.createPlacementEffect(x, y);
    }

    updateUI() {
        this.uiManager.updateUI();
    }

    // Getters for backward compatibility
    get health() { return this.gameStateManager.health; }
    set health(value) { this.gameStateManager.health = value; }
    
    get money() { return this.gameStateManager.money; }
    set money(value) { this.gameStateManager.money = value; }
    
    get wave() { return this.waveManager.currentWave; }
    set wave(value) { this.waveManager.currentWave = value; }
    
    get enemiesInWave() { return this.waveManager.enemiesInWave; }
    set enemiesInWave(value) { this.waveManager.enemiesInWave = value; }
    
    get enemiesSpawned() { return this.waveManager.enemiesSpawned; }
    set enemiesSpawned(value) { this.waveManager.enemiesSpawned = value; }
    
    get selectedTowerType() { return this.towerPlacementManager.selectedTowerType; }
    set selectedTowerType(value) { this.towerPlacementManager.setSelectedTowerType(value); }
    
    get selectedTower() { return this.towerPlacementManager.selectedTower; }
    set selectedTower(value) { this.towerPlacementManager.selectedTower = value; }
    
    get waveActive() { return this.waveManager.waveActive; }
    set waveActive(value) { this.waveManager.waveActive = value; }
    
    get gameOver() { return this.gameStateManager.gameOver; }
    set gameOver(value) { this.gameStateManager.gameOver = value; }
    
    get towersBuilt() { return this.gameStateManager.towersBuilt; }
    set towersBuilt(value) { this.gameStateManager.towersBuilt = value; }
    
    get enemiesDefeated() { return this.gameStateManager.enemiesDefeated; }
    set enemiesDefeated(value) { this.gameStateManager.enemiesDefeated = value; }
}

// Game Configuration
const config = {
    type: Phaser.AUTO,
    width: GameConfig.GAME_WIDTH,
    height: GameConfig.GAME_HEIGHT,
    parent: 'gameContainer',
    backgroundColor: GameConfig.COLORS.BACKGROUND,
    scene: TowerDefenseGame,
    physics: {
        default: 'arcade'
    }
};

const game = new Phaser.Game(config);
