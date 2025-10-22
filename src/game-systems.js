import Phaser from 'phaser';
import GameConfig from './game-config.js';
import { Tower, Enemy } from './game-entities.js';
import { PathManager as SmoothPathManager } from './path-manager.js';
// Simple Event System
class EventSystem {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }
}

// Global event system instance
const gameEvents = new EventSystem();

// Make gameEvents globally accessible
if (typeof window !== 'undefined') {
    window.gameEvents = gameEvents;
}

// Game Systems Classes

// Wave Manager Class
class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = GameConfig.GAME.startingWave;
        this.enemiesInWave = GameConfig.WAVES.baseEnemies;
        this.enemiesSpawned = 0;
        this.waveActive = false;
        this.spawnTimer = null;
        
        this.createSpawnTimer();
    }

    createSpawnTimer() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
            paused: true
        });
    }

    startWave() {
        if (this.waveActive || this.scene.gameOver) return;
        
        this.waveActive = true;
        this.spawnTimer.paused = false;
    }

    endWave() {
        this.waveActive = false;
        this.spawnTimer.paused = true;
        this.scene.money += GameConfig.WAVES.waveBonus;
        window.gameEvents.emit('moneyChanged', { newAmount: this.scene.money, change: GameConfig.WAVES.waveBonus });
        this.nextWave();
    }

    nextWave() {
        this.currentWave++;
        if (this.currentWave === GameConfig.ENEMIES.boss.spawnWave) {
            // Boss wave - only spawn the boss
            this.enemiesInWave = 1;
        } else {
            this.enemiesInWave = GameConfig.WAVES.baseEnemies + (this.currentWave - 1) * GameConfig.WAVES.enemiesIncrease;
        }
        this.enemiesSpawned = 0;
    }

    spawnEnemy() {
        if (this.enemiesSpawned >= this.enemiesInWave || !this.waveActive) {
            return;
        }

        // Spawn super boss enemy on wave 30
        if (this.currentWave === GameConfig.ENEMIES.superBoss.spawnWave && this.enemiesSpawned === 0) {
            const superBoss = new Enemy(this.scene, this.scene.pathManager.path[0].x, this.scene.pathManager.path[0].y, 'superBoss', this.currentWave, this.scene.pathManager.getSmoothPathManager(), this.scene.pathManager.getMapName());
            this.scene.enemies.add(superBoss);
            this.enemiesSpawned++;
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createSuperBossSpawnEffect(this.scene.pathManager.path[0].x, this.scene.pathManager.path[0].y);
            }
            return;
        }

        // Spawn boss enemy on wave 10
        if (this.currentWave === GameConfig.ENEMIES.boss.spawnWave && this.enemiesSpawned === 0) {
            const boss = new Enemy(this.scene, this.scene.pathManager.path[0].x, this.scene.pathManager.path[0].y, 'boss', this.currentWave, this.scene.pathManager.getSmoothPathManager(), this.scene.pathManager.getMapName());
            this.scene.enemies.add(boss);
            this.enemiesSpawned++;
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createBossSpawnEffect(this.scene.pathManager.path[0].x, this.scene.pathManager.path[0].y);
            }
            return;
        }

        // Use stronger enemies in later waves
        const enemyType = this.currentWave > GameConfig.WAVES.strongEnemyStartWave && Math.random() < GameConfig.WAVES.strongEnemyChance ? 'strong' : 'basic';
        const enemy = new Enemy(this.scene, this.scene.pathManager.path[0].x, this.scene.pathManager.path[0].y, enemyType, this.currentWave, this.scene.pathManager.getSmoothPathManager(), this.scene.pathManager.getMapName());
        this.scene.enemies.add(enemy);
        this.enemiesSpawned++;
    }

    checkWaveCompletion() {
        return this.waveActive && this.enemiesSpawned >= this.enemiesInWave && this.scene.enemies.children.entries.length === 0;
    }

    reset() {
        this.currentWave = GameConfig.GAME.startingWave;
        this.enemiesInWave = GameConfig.WAVES.baseEnemies;
        this.enemiesSpawned = 0;
        this.waveActive = false;
        this.spawnTimer.paused = true;
    }

    getWaveInfo() {
        return {
            currentWave: this.currentWave,
            enemiesInWave: this.enemiesInWave,
            enemiesSpawned: this.enemiesSpawned,
            enemiesRemaining: this.enemiesInWave - this.enemiesSpawned
        };
    }
}

// Enhanced Path Manager Class with Smooth Path Support
class PathManager {
    constructor(mapConfig = null) {
        this.mapConfig = mapConfig || { path: [] };
        this.path = this.mapConfig.path;
        this.mapName = this.mapConfig.name || 'default';
        
        // Initialize smooth path manager
        this.smoothPathManager = new SmoothPathManager();
        
        // Load smooth path if SVG data is available
        if (this.mapConfig.svgPathData) {
            this.initializeSmoothPath();
        }
    }

    async initializeSmoothPath() {
        try {
            console.log('Initializing smooth path for:', this.mapName);
            console.log('SVG path data:', this.mapConfig.svgPathData);
            await this.smoothPathManager.loadPathFromSVG(this.mapName, this.mapConfig.svgPathData);
            console.log(`Smooth path initialized for ${this.mapName}`);
        } catch (error) {
            console.error('Failed to initialize smooth path:', error);
        }
    }

    getPath() {
        return this.path;
    }

    getStartPoint() {
        return this.path[0];
    }

    getEndPoint() {
        return this.path[this.path.length - 1];
    }

    // Get the smooth path manager for enemy creation
    getSmoothPathManager() {
        return this.smoothPathManager;
    }

    // Get the map name for smooth path system
    getMapName() {
        return this.mapName;
    }

    // Check if smooth path is available
    hasSmoothPath() {
        return this.smoothPathManager && this.smoothPathManager.getPath(this.mapName);
    }

    canPlaceTower(x, y, existingTowers) {
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
            if (Phaser.Math.Distance.Between(x, y, closestX, closestY) < GameConfig.GAME.pathClearance) {
                return false;
            }
        }

        // Check if position overlaps with existing towers
        for (let tower of existingTowers) {
            if (Phaser.Math.Distance.Between(x, y, tower.x, tower.y) < GameConfig.GAME.towerPlacementRadius) {
                return false;
            }
        }

        return true;
    }
}

// Game State Manager Class
class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.health = GameConfig.GAME.startingHealth;
        this.money = GameConfig.GAME.startingMoney;
        this.towersBuilt = 0;
        this.enemiesDefeated = 0;
        this.gameOver = false;
    }

    reset() {
        this.health = GameConfig.GAME.startingHealth;
        this.money = GameConfig.GAME.startingMoney;
        this.towersBuilt = 0;
        this.enemiesDefeated = 0;
        this.gameOver = false;
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.gameOver = true;
        }
    }

    addMoney(amount) {
        this.money += amount;
        window.gameEvents.emit('moneyChanged', { newAmount: this.money, change: amount });
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            window.gameEvents.emit('moneyChanged', { newAmount: this.money, change: -amount });
            return true;
        }
        return false;
    }

    incrementTowersBuilt() {
        this.towersBuilt++;
    }

    incrementEnemiesDefeated() {
        this.enemiesDefeated++;
    }

    isGameOver() {
        return this.gameOver;
    }

    getStats() {
        return {
            health: this.health,
            money: this.money,
            towersBuilt: this.towersBuilt,
            enemiesDefeated: this.enemiesDefeated,
            gameOver: this.gameOver
        };
    }
}

// Tower Placement Manager Class
class TowerPlacementManager {
    constructor(scene, pathManager) {
        this.scene = scene;
        this.pathManager = pathManager;
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.ghostTower = null;
        this.placementIndicator = null;
    }

    setSelectedTowerType(towerType) {
        this.selectedTowerType = towerType;
    }

    clearSelection() {
        this.selectedTowerType = null;
        this.clearTowerSelection();
        this.hideGhostTower();
    }

    selectTower(tower) {
        // Clear previous selection
        if (this.selectedTower) {
            this.selectedTower.deselect();
        }

        this.selectedTower = tower;
        tower.select();
        
        // Emit tower selection event
        window.gameEvents.emit('towerSelected', { tower: tower });
    }

    clearTowerSelection() {
        if (this.selectedTower) {
            this.selectedTower.deselect();
            this.selectedTower = null;
        }
        
        // Emit tower deselection event
        window.gameEvents.emit('towerDeselected', {});
    }

    handleMouseMove(pointer) {
        if (!this.selectedTowerType || this.scene.gameOver) {
            this.hideGhostTower();
            return;
        }

        // Only allow ghost tower for real tower types
        if (
            this.selectedTowerType === 'upgradeTower' ||
            this.selectedTowerType === 'sellTower' ||
            !GameConfig.TOWERS[this.selectedTowerType]
        ) {
            this.hideGhostTower();
            return;
        }

        const x = pointer.x;
        const y = pointer.y;

        // Check if cursor is over either UI bar
        if (y < GameConfig.GAME_AREA_TOP || y >= GameConfig.GAME_AREA_BOTTOM) {
            this.hideGhostTower();
            return;
        }

        const canPlace = this.pathManager.canPlaceTower(x, y, this.scene.towers.children.entries);
        const towerConfig = GameConfig.TOWERS[this.selectedTowerType];
        const hasEnoughMoney = this.scene.money >= towerConfig.cost;

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
        } else if (this.selectedTowerType === 'multishotTower') {
            spriteKey = 'multishotTower';
        }
        this.ghostTower = this.scene.add.sprite(x, y, spriteKey);
        this.ghostTower.setAlpha(GameConfig.GAME.ghostTowerAlpha);

        // Create placement indicator
        const indicatorTexture = canPlace ? 'validPlacement' : 'invalidPlacement';
        this.placementIndicator = this.scene.add.sprite(x, y, indicatorTexture);
        this.placementIndicator.setAlpha(GameConfig.GAME.placementIndicatorAlpha);

        // Show range preview if valid placement
        if (canPlace) {
            const towerConfig = GameConfig.TOWERS[this.selectedTowerType];
            this.ghostTower.rangePreview = this.scene.add.graphics();
            this.ghostTower.rangePreview.lineStyle(2, GameConfig.COLORS.VALID_PLACEMENT, GameConfig.GAME.rangePreviewAlpha);
            this.ghostTower.rangePreview.strokeCircle(x, y, towerConfig.range);
            this.ghostTower.rangePreview.fillStyle(GameConfig.COLORS.VALID_PLACEMENT, GameConfig.GAME.rangePreviewFillAlpha);
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

    handleClick(pointer) {
        const x = pointer.x;
        const y = pointer.y;

        // Don't allow tower placement if clicking in either UI bar
        if (y < GameConfig.GAME_AREA_TOP || y >= GameConfig.GAME_AREA_BOTTOM) {
            return;
        }

        // Check if clicking on existing tower
        const clickedTower = this.scene.towers.children.entries.find(tower => 
            Phaser.Geom.Rectangle.Contains(tower.getBounds(), x, y)
        );

        if (clickedTower) {
            // Check if the clicked tower is already selected
            if (this.selectedTower === clickedTower) {
                // Deselect the tower
                this.clearTowerSelection();
            } else {
                // Select the clicked tower
                this.selectTower(clickedTower);
            }
            this.selectedTowerType = null;
            this.hideGhostTower();
            this.scene.uiManager.clearTowerButtonSelection();
            return;
        }

        // Check if we can place a tower here
        if (this.selectedTowerType && this.selectedTowerType !== 'upgradeTower' && this.pathManager.canPlaceTower(x, y, this.scene.towers.children.entries)) {
            this.placeTower(x, y);
            this.hideGhostTower();
        }
    }

    placeTower(x, y) {
        // Don't place upgrade button as a tower
        if (this.selectedTowerType === 'upgradeTower') {
            return;
        }

        const towerConfig = GameConfig.TOWERS[this.selectedTowerType];

        if (this.scene.money >= towerConfig.cost) {
            // Create tower using the Tower class
            const tower = new Tower(this.scene, x, y, this.selectedTowerType);

            // Add visual effects for placement using effects manager
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createPlacementEffect(x, y);
            }

            // Clear any lingering placement effects (ghosts, indicators)
            this.hideGhostTower();
            // Deselect tower type and button after placement
            this.selectedTowerType = null;
            if (this.scene.uiManager && typeof this.scene.uiManager.clearTowerButtonSelection === 'function') {
                this.scene.uiManager.clearTowerButtonSelection();
            }

            this.scene.towers.add(tower);
            this.scene.money -= towerConfig.cost;
            this.scene.towersBuilt++;
            
            // Emit money change event
            window.gameEvents.emit('moneyChanged', { newAmount: this.scene.money, change: -towerConfig.cost });
            
            // Update UI
            this.scene.uiManager.updateUI();
        }
    }

    upgradeTower() {
        if (!this.selectedTower) return;

        const upgradeCost = this.selectedTower.getUpgradeCost();
        if (this.scene.money < upgradeCost) return;

        // Upgrade the tower (this will handle money deduction and stats update)
        const upgradeSuccess = this.selectedTower.upgrade();
        
        if (upgradeSuccess) {
            // Create upgrade effect using effects manager
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createUpgradeEffect(this.selectedTower);
            }
            
            // Update UI
            this.scene.uiManager.updateUI();
        }
    }

    sellTower() {
        if (!this.selectedTower) return;

        // Calculate sell value (70% of total spent)
        const sellValue = this.selectedTower.getSellValue();
        
        // Add money to player
        this.scene.money += sellValue;
        
        // Emit money change event
        window.gameEvents.emit('moneyChanged', { newAmount: this.scene.money, change: sellValue });
        
        // Remove the tower from the game
        this.scene.towers.remove(this.selectedTower);
        this.selectedTower.destroy();
        
        // Clear selection
        this.selectedTower = null;
        this.selectedTowerType = null;
        
        // Emit tower deselection event
        window.gameEvents.emit('towerDeselected', {});
        
        // Update UI
        this.scene.uiManager.updateUI();
    }
}

// Export for use in other files
export { WaveManager, PathManager, GameStateManager, TowerPlacementManager }; 