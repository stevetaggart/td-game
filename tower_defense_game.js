class TowerDefenseGame extends Phaser.Scene {
    constructor() {
        super({ key: 'TowerDefenseGame' });
    }

    preload() {
        // Load the correct image for each tower type
        this.load.image('basicTower', GameConfig.ASSETS.basicTower);
        this.load.image('rapidTower', GameConfig.ASSETS.rapidTower);
        this.load.image('cannonTower', GameConfig.ASSETS.cannonTower);
        
        // Load the enemy path SVG
        this.load.image('enemyPath', GameConfig.ASSETS.enemyPath);
        
        // Load enemy sprites
        this.load.image('enemy', GameConfig.ASSETS.enemy);
        this.load.image('strongEnemy', GameConfig.ASSETS.strongEnemy);
        this.load.image('bossEnemy', GameConfig.ASSETS.bossEnemy);
        
        this.createBulletSprites();
        this.createGhostTowerSprites();
        this.createPlacementIndicators();
    }

    createBulletSprites() {
        // Basic bullet
        const graphics1 = this.add.graphics();
        graphics1.fillStyle(GameConfig.COLORS.BULLET_BASIC);
        graphics1.fillCircle(8, 8, 6);
        graphics1.fillStyle(GameConfig.COLORS.BULLET_BASIC_CORE);
        graphics1.fillCircle(8, 8, 2);
        graphics1.generateTexture('bullet', 16, 16);
        graphics1.destroy();

        // Cannon ball
        const graphics2 = this.add.graphics();
        graphics2.fillStyle(GameConfig.COLORS.CANNON_BALL_OUTER);
        graphics2.fillCircle(12, 12, 10);
        graphics2.fillStyle(GameConfig.COLORS.CANNON_BALL_MIDDLE);
        graphics2.fillCircle(12, 12, 8);
        graphics2.fillStyle(GameConfig.COLORS.CANNON_BALL_INNER);
        graphics2.fillCircle(10, 10, 4);
        graphics2.generateTexture('cannonBall', 24, 24);
        graphics2.destroy();
    }

    createGhostTowerSprites() {
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

    create() {
        // Initialize game systems
        this.pathManager = new PathManager();
        this.gameStateManager = new GameStateManager(this);
        this.waveManager = new WaveManager(this);
        this.towerPlacementManager = new TowerPlacementManager(this, this.pathManager);
        this.effectsManager = new EffectsManager(this);
        
        // Get path from path manager
        this.path = this.pathManager.getPath();

        // Add the enemy path SVG image instead of drawing with graphics
        this.add.image(GameConfig.GAME_WIDTH / 2, GameConfig.GAME_HEIGHT / 2, 'enemyPath').setOrigin(0.5);

        // Create groups
        this.towers = this.add.group();
        this.enemies = this.add.group();
        this.bullets = this.add.group();

        // Initialize UI manager
        this.uiManager = new UIManager(this);
        this.uiManager.createUI();

        // Input handling
        this.input.on('pointerdown', this.handleClick, this);
        this.input.on('pointermove', this.handleMouseMove, this);
    }

    handleMouseMove(pointer) {
        this.towerPlacementManager.handleMouseMove(pointer);
    }

    handleClick(pointer) {
        this.towerPlacementManager.handleClick(pointer);
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

        // Clear all game objects
        this.towers.children.entries.forEach(tower => {
            tower.destroy();
        });
        this.enemies.children.entries.forEach(enemy => {
            enemy.destroy();
        });
        this.bullets.children.entries.forEach(bullet => {
            bullet.destroy();
        });

        // Clear ghost tower
        this.towerPlacementManager.hideGhostTower();

        // Hide game over screen and update UI
        this.uiManager.hideGameOver();
        this.uiManager.updateUI();
        this.uiManager.updateAllButtonStates();
    }

    update(time, delta) {
        if (this.gameStateManager.gameOver) return;

        // Move enemies
        this.enemies.children.entries.forEach(enemy => {
            const stillAlive = enemy.move(delta, this.path);
            if (!stillAlive) {
                // Enemy was destroyed (reached end or died)
                this.enemies.remove(enemy);
            }
        });

        // Update tower rotations and shooting
        this.towers.children.entries.forEach(tower => {
            tower.updateRotation();
            const bullet = tower.shoot(time);
            if (bullet) {
                this.bullets.add(bullet);
            }
        });

        // Move bullets
        this.bullets.children.entries.forEach(bullet => {
            const stillActive = bullet.move(delta);
            if (!stillActive) {
                // Bullet was destroyed (hit target or reached range)
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

        this.uiManager.updateUI();
    }

    startWave() {
        this.waveManager.startWave();
        // Create wave start effect
        this.effectsManager.createWaveStartEffect(this.waveManager.currentWave);
    }

    endWave() {
        this.waveManager.endWave();
    }

    upgradeTower() {
        this.towerPlacementManager.upgradeTower();
    }

    createBossSpawnEffect(x, y) {
        this.effectsManager.createBossSpawnEffect(x, y);
    }

    createBossDeathEffect(x, y) {
        this.effectsManager.createBossDeathEffect(x, y);
    }

    createUpgradeEffect(x, y) {
        this.effectsManager.createUpgradeEffect(x, y);
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
