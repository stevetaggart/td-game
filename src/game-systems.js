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
            const superBoss = new Enemy(this.scene, this.scene.path[0].x, this.scene.path[0].y, 'superBoss', this.currentWave);
            this.scene.enemies.add(superBoss);
            this.enemiesSpawned++;
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createSuperBossSpawnEffect(this.scene.path[0].x, this.scene.path[0].y);
            }
            return;
        }

        // Spawn boss enemy on wave 10
        if (this.currentWave === GameConfig.ENEMIES.boss.spawnWave && this.enemiesSpawned === 0) {
            const boss = new Enemy(this.scene, this.scene.path[0].x, this.scene.path[0].y, 'boss', this.currentWave);
            this.scene.enemies.add(boss);
            this.enemiesSpawned++;
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createBossSpawnEffect(this.scene.path[0].x, this.scene.path[0].y);
            }
            return;
        }

        // Use stronger enemies in later waves
        const enemyType = this.currentWave > GameConfig.WAVES.strongEnemyStartWave && Math.random() < GameConfig.WAVES.strongEnemyChance ? 'strong' : 'basic';
        const enemy = new Enemy(this.scene, this.scene.path[0].x, this.scene.path[0].y, enemyType, this.currentWave);
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

// Path Manager Class
class PathManager {
    constructor() {
        // Use responsive path if available, otherwise fall back to original
        this.path = window.responsiveConfig ? window.responsiveConfig.getScaledPath() : GameConfig.PATH;
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
        
        // Gesture control properties - will be updated dynamically
        this.gestureState = {
            isLongPressing: false,
            longPressTimer: null,
            longPressDuration: 500, // 500ms for long press
            dragStartPosition: null,
            isDragging: false,
            dragThreshold: 10 // pixels
        };
        
        // Visual feedback for gestures
        this.gestureFeedback = {
            longPressIndicator: null,
            dragIndicator: null,
            instructionOverlay: null,
            mobileHint: null
        };
        
        // Update mobile detection and show instructions if needed
        this.updateMobileDetection();
        
        // Listen for resize events to update mobile detection
        window.addEventListener('gameResize', (event) => {
            this.updateMobileDetection();
        });
    }
    
    // Method to update mobile detection dynamically
    updateMobileDetection() {
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();
        this.isMobile = responsiveConfig.IS_MOBILE;
        
        // Debug logging disabled for production
        // console.log('TowerPlacementManager mobile detection:', {
        //     isMobile: this.isMobile,
        //     responsiveConfig: responsiveConfig.IS_MOBILE
        // });
        
        // Show gesture instructions on mobile (only on first load)
        if (this.isMobile && !localStorage.getItem('gestureTutorialShown')) {
            this.showGestureInstructions();
            localStorage.setItem('gestureTutorialShown', 'true');
        }
        
        // Mobile indicator disabled for production
        // this.showMobileIndicator();
    }
    
    showMobileIndicator() {
        // Remove existing indicator
        if (this.mobileIndicator) {
            this.mobileIndicator.destroy();
        }
        
        if (this.isMobile) {
            // Create a small indicator in the top-left corner
            this.mobileIndicator = this.scene.add.text(10, 10, '📱 MOBILE MODE', {
                fontSize: '16px',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 5, y: 2 }
            });
            this.mobileIndicator.setOrigin(0, 0);
        }
    }

    setSelectedTowerType(towerType) {
        this.selectedTowerType = towerType;
        
        // Show mobile gesture hint if on mobile
        if (this.isMobile && towerType && towerType !== 'upgradeTower') {
            this.showMobileGestureHint();
        } else {
            this.hideMobileGestureHint();
        }
    }

    clearSelection() {
        this.selectedTowerType = null;
        this.clearTowerSelection();
        this.hideGhostTower();
        this.hideMobileGestureHint();
    }

    selectTower(tower) {
        // Clear previous selection
        if (this.selectedTower) {
            this.selectedTower.deselect();
        }

        this.selectedTower = tower;
        tower.select();
        
        // Trigger haptic feedback for mobile
        if (this.isMobile) {
            this.triggerHapticFeedback('success');
        }
        
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

    // Gesture control methods for mobile
    handlePointerDown(pointer) {
        if (!this.isMobile) return;

        const x = pointer.x;
        const y = pointer.y;
        
        // Get responsive configuration
        const responsiveConfig = this.scene.responsiveConfig || window.responsiveConfig.getGameConfig();

        // Don't allow gestures in UI areas
        if (y < responsiveConfig.GAME_AREA_TOP || 
            y >= responsiveConfig.GAME_AREA_BOTTOM ||
            x < responsiveConfig.GAME_AREA_LEFT ||
            x >= responsiveConfig.GAME_AREA_RIGHT) {
            return;
        }

        // Store drag start position
        this.gestureState.dragStartPosition = { x, y };
        this.gestureState.isDragging = false;

        // Start long press timer if we have a selected tower type
        if (this.selectedTowerType && this.selectedTowerType !== 'upgradeTower') {
            this.startLongPressTimer(x, y);
        }
    }

    handlePointerMove(pointer) {
        if (!this.isMobile) return;

        const x = pointer.x;
        const y = pointer.y;

        // Check if we're dragging
        if (this.gestureState.dragStartPosition) {
            const distance = Phaser.Math.Distance.Between(
                this.gestureState.dragStartPosition.x,
                this.gestureState.dragStartPosition.y,
                x, y
            );

            if (distance > this.gestureState.dragThreshold) {
                this.gestureState.isDragging = true;
                this.cancelLongPressTimer();
                this.showDragPreview(x, y);
            }
        }

        // Update ghost tower position during drag
        if (this.gestureState.isDragging && this.selectedTowerType) {
            this.handleMouseMove(pointer);
        }
    }

    handlePointerUp(pointer) {
        if (!this.isMobile) return;

        const x = pointer.x;
        const y = pointer.y;

        // Cancel long press timer
        this.cancelLongPressTimer();

        // Handle drag end
        if (this.gestureState.isDragging) {
            this.handleDragEnd(x, y);
        } else if (this.gestureState.isLongPressing) {
            // Long press completed - place tower
            this.handleLongPressComplete(x, y);
        }

        // Reset gesture state
        this.resetGestureState();
    }

    startLongPressTimer(x, y) {
        this.cancelLongPressTimer(); // Clear any existing timer
        
        this.gestureState.longPressTimer = this.scene.time.delayedCall(
            this.gestureState.longPressDuration,
            () => {
                this.gestureState.isLongPressing = true;
                this.showLongPressIndicator(x, y);
                this.triggerHapticFeedback('longPress');
            },
            [],
            this.scene
        );
    }

    cancelLongPressTimer() {
        if (this.gestureState.longPressTimer) {
            this.gestureState.longPressTimer.destroy();
            this.gestureState.longPressTimer = null;
        }
        this.gestureState.isLongPressing = false;
        this.hideGestureFeedback();
    }

    resetGestureState() {
        this.gestureState.isLongPressing = false;
        this.gestureState.isDragging = false;
        this.gestureState.dragStartPosition = null;
        this.cancelLongPressTimer();
        this.hideGestureFeedback();
    }

    showLongPressIndicator(x, y) {
        this.hideGestureFeedback();
        
        // Create pulsing circle indicator
        this.gestureFeedback.longPressIndicator = this.scene.add.graphics();
        this.gestureFeedback.longPressIndicator.lineStyle(3, GameConfig.COLORS.VALID_PLACEMENT, 0.8);
        this.gestureFeedback.longPressIndicator.strokeCircle(x, y, 30);
        
        // Add pulsing animation
        this.scene.tweens.add({
            targets: this.gestureFeedback.longPressIndicator,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    showDragPreview(x, y) {
        this.hideGestureFeedback();
        
        // Create drag indicator
        this.gestureFeedback.dragIndicator = this.scene.add.graphics();
        this.gestureFeedback.dragIndicator.lineStyle(2, GameConfig.COLORS.VALID_PLACEMENT, 0.6);
        this.gestureFeedback.dragIndicator.strokeCircle(x, y, 25);
        
        // Add subtle animation
        this.scene.tweens.add({
            targets: this.gestureFeedback.dragIndicator,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }

    hideGestureFeedback() {
        if (this.gestureFeedback.longPressIndicator) {
            this.gestureFeedback.longPressIndicator.destroy();
            this.gestureFeedback.longPressIndicator = null;
        }
        if (this.gestureFeedback.dragIndicator) {
            this.gestureFeedback.dragIndicator.destroy();
            this.gestureFeedback.dragIndicator = null;
        }
    }

    showMobileGestureHint() {
        this.hideMobileGestureHint();
        
        // Create hint text
        const hintText = this.scene.add.text(
            this.scene.responsiveConfig.GAME_WIDTH / 2,
            this.scene.responsiveConfig.GAME_HEIGHT - 120,
            '👆 Long press or drag to place tower',
            {
                fontSize: Math.floor(14 * this.scene.responsiveConfig.SCALE) + 'px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 },
                align: 'center'
            }
        );
        hintText.setOrigin(0.5);
        
        // Add subtle animation
        this.scene.tweens.add({
            targets: hintText,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
        
        this.gestureFeedback.mobileHint = hintText;
    }

    hideMobileGestureHint() {
        if (this.gestureFeedback.mobileHint) {
            this.gestureFeedback.mobileHint.destroy();
            this.gestureFeedback.mobileHint = null;
        }
    }

    showGestureInstructions() {
        // Create a container to hold both the overlay and text
        const instructionContainer = this.scene.add.container(0, 0);
        
        // Create instruction overlay background
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, this.scene.responsiveConfig.GAME_WIDTH, this.scene.responsiveConfig.GAME_HEIGHT);
        
        // Add instruction text
        const instructions = [
            '📱 Mobile Gesture Controls:',
            '',
            '👆 Tap: Select/Deselect towers',
            '👆 Long Press: Place tower',
            '👆 Drag: Preview & place tower',
            '',
            'Tap anywhere to continue'
        ];
        
        const textStyle = {
            fontSize: Math.floor(16 * this.scene.responsiveConfig.SCALE) + 'px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: this.scene.responsiveConfig.GAME_WIDTH - 40 }
        };
        
        const textY = this.scene.responsiveConfig.GAME_HEIGHT / 2 - (instructions.length * 25);
        
        // Add background to container
        instructionContainer.add(overlay);
        
        // Add text elements to container
        instructions.forEach((instruction, index) => {
            const text = this.scene.add.text(
                this.scene.responsiveConfig.GAME_WIDTH / 2,
                textY + (index * 25),
                instruction,
                textStyle
            );
            text.setOrigin(0.5);
            instructionContainer.add(text);
        });
        
        // Make container interactive to dismiss
        instructionContainer.setInteractive();
        instructionContainer.on('pointerdown', () => {
            instructionContainer.destroy();
            this.gestureFeedback.instructionOverlay = null;
        });
        
        this.gestureFeedback.instructionOverlay = instructionContainer;
        
        // Auto-dismiss after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            if (this.gestureFeedback.instructionOverlay) {
                this.gestureFeedback.instructionOverlay.destroy();
                this.gestureFeedback.instructionOverlay = null;
            }
        }, [], this.scene);
    }

    triggerHapticFeedback(type) {
        if (!this.isMobile) return;
        
        try {
            // Check if vibration API is available
            if ('vibrate' in navigator) {
                switch (type) {
                    case 'success':
                        navigator.vibrate(50); // Short vibration for success
                        break;
                    case 'error':
                        navigator.vibrate([50, 50, 50]); // Pattern for error
                        break;
                    case 'longPress':
                        navigator.vibrate(100); // Medium vibration for long press
                        break;
                    default:
                        navigator.vibrate(25); // Default short vibration
                }
            }
        } catch (error) {
            // Silently fail if vibration is not supported
            console.log('Haptic feedback not supported');
        }
    }

    // Method to reset tutorial (for testing)
    resetGestureTutorial() {
        localStorage.removeItem('gestureTutorialShown');
        if (this.isMobile) {
            this.showGestureInstructions();
        }
    }

    handleLongPressComplete(x, y) {
        // Place tower at long press location
        if (this.selectedTowerType && this.selectedTowerType !== 'upgradeTower') {
            const canPlace = this.pathManager.canPlaceTower(x, y, this.scene.towers.children.entries);
            if (canPlace) {
                this.placeTower(x, y);
                this.hideGhostTower();
                this.triggerHapticFeedback('success');
            } else {
                this.triggerHapticFeedback('error');
            }
        }
    }

    handleDragEnd(x, y) {
        // Place tower at drag end location if valid
        if (this.selectedTowerType && this.selectedTowerType !== 'upgradeTower') {
            const canPlace = this.pathManager.canPlaceTower(x, y, this.scene.towers.children.entries);
            if (canPlace) {
                this.placeTower(x, y);
                this.hideGhostTower();
                this.triggerHapticFeedback('success');
            } else {
                this.triggerHapticFeedback('error');
            }
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
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WaveManager, PathManager, GameStateManager, TowerPlacementManager, gameEvents: window.gameEvents };
} 