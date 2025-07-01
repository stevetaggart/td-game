// Game Entity Classes

// Tower Class
class Tower extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, towerType) {
        const config = GameConfig.TOWERS[towerType];
        super(scene, x, y, config.spriteKey);
        // Always clear tint so SVG colors are correct (especially for multishot)
        this.clearTint();
        this.scene = scene;
        this.towerType = towerType;
        this.damage = config.damage;
        this.range = config.range;
        this.fireRate = config.fireRate;
        this.level = 1;
        this.lastFired = 0;

        // Track total money spent on this tower (purchase + upgrades)
        this.moneySpent = config.cost;
        
        // New stats tracking
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.oofs = 0;
        
        // Add range indicator
        this.rangeGraphics = scene.add.graphics();
        this.rangeGraphics.lineStyle(1, 0xffffff, 0.3);
        this.rangeGraphics.strokeCircle(x, y, config.range);
        this.rangeGraphics.setVisible(false);
        
        // Make interactive
        this.setInteractive();
        // Tooltip events
        this.on('pointerover', (pointer) => {
            const config = GameConfig.TOWERS[this.towerType];
            const upgradeCost = this.getUpgradeCost();
            const hitPercentage = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
            const stats = `Name: ${config.name}\nLevel: ${this.level}\nDamage: ${this.damage}\nRange: ${this.range}\nFire Rate: ${this.fireRate}ms\nUpgrade Cost: $${upgradeCost}\nHit %: ${hitPercentage}%\nOofs: ${this.oofs}`;
            if (this.scene.uiManager && this.scene.uiManager.showTooltip) {
                this.scene.uiManager.showTooltip(pointer.worldX, pointer.worldY, stats);
            }
        });
        this.on('pointerout', () => {
            if (this.scene.uiManager && this.scene.uiManager.hideTooltip) {
                this.scene.uiManager.hideTooltip();
            }
        });
        
        // Add to scene
        scene.add.existing(this);
    }

    // Calculate upgrade cost based on current level
    getUpgradeCost() {
        const config = GameConfig.TOWERS[this.towerType];
        let baseUpgradeCost = config.upgradeCost;
        // No extra multiplier needed; config already sets correct cost for each tower
        return Math.floor(baseUpgradeCost + (this.level - 1) * (baseUpgradeCost * 0.5));
    }

    // Get hit percentage
    getHitPercentage() {
        return this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
    }

    // Record a shot fired
    recordShot() {
        this.shotsFired++;
    }

    // Record a hit
    recordHit() {
        this.shotsHit++;
    }

    // Record an oof
    recordOof() {
        this.oofs++;
    }

    updateRotation() {
        // Only rotate rapid and cannon towers
        if (this.towerType !== 'rapidTower' && this.towerType !== 'cannonTower') {
            return;
        }

        const enemiesInRange = this.scene.enemies.children.entries.filter(enemy => 
            Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.range
        );

        if (enemiesInRange.length > 0) {
            const target = enemiesInRange[0];
            const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.setRotation(angleToTarget);
        }
    }

    canShoot(time) {
        return time - this.lastFired >= this.fireRate;
    }

    shoot(time) {
        if (!this.canShoot(time)) return null;

        const enemiesInRange = this.scene.enemies.children.entries.filter(enemy => 
            Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.range
        );

        if (enemiesInRange.length > 0) {
            const target = enemiesInRange[0];
            const config = GameConfig.TOWERS[this.towerType];

            // Multishot: shoot multiple projectiles in a spread
            if (this.towerType === 'multishotTower') {
                // Calculate number of projectiles: base + (level-1)
                const numProjectiles = (config.baseProjectiles || 3) + (this.level - 1);
                const spreadAngle = config.projectileSpread || 30; // degrees
                const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                const halfSpread = ((numProjectiles - 1) * spreadAngle * Math.PI / 180) / 2;
                let bullets = [];
                for (let i = 0; i < numProjectiles; i++) {
                    // Evenly space projectiles within the spread
                    const angle = baseAngle - halfSpread + i * (spreadAngle * Math.PI / 180);
                    // Fake a target at this angle
                    const fakeTarget = {
                        x: this.x + Math.cos(angle) * this.range,
                        y: this.y + Math.sin(angle) * this.range
                    };
                    const bullet = new Bullet(this.scene, this.x, this.y, fakeTarget, this.damage, this.range, config.bulletTexture, this);
                    bullets.push(bullet);
                }
                this.lastFired = time;
                this.recordShot();
                this.scene.sound.play('shot', { volume: 0.7 });
                if (this.scene.effectsManager) {
                    this.scene.effectsManager.createMuzzleFlash(this.x, this.y);
                }
                return bullets;
            }

            // Rotate rapid and cannon towers to face the enemy
            if (this.towerType === 'rapidTower' || this.towerType === 'cannonTower') {
                const angleToTarget = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                this.setRotation(angleToTarget);
            }
            
            const bullet = new Bullet(this.scene, this.x, this.y, target, this.damage, this.range, config.bulletTexture, this);
            this.lastFired = time;
            
            // Record the shot
            this.recordShot();
            
            // Play sound effect based on tower type
            if (this.towerType === 'cannonTower') {
                this.scene.sound.play('cannon', { volume: 0.8 });
            } else {
                // Basic and rapid towers use the same shot sound
                this.scene.sound.play('shot', { volume: 0.7 });
            }
            
            // Create muzzle flash effect
            if (this.scene.effectsManager) {
                this.scene.effectsManager.createMuzzleFlash(this.x, this.y);
            }
            
            return bullet;
        }
        
        return null;
    }

    upgrade() {
        const config = GameConfig.TOWERS[this.towerType];
        const upgradeCost = this.getUpgradeCost();
        // Check if player has enough money
        if (this.scene.money < upgradeCost) {
            return false;
        }
        this.level++;
        this.damage += config.damageIncrease;
        this.range += config.rangeIncrease;
        // Track upgrade cost for sell refund
        this.moneySpent += upgradeCost;
        // Deduct money
        this.scene.money -= upgradeCost;
        // Emit money change event
        window.gameEvents.emit('moneyChanged', { newAmount: this.scene.money, change: -upgradeCost });
        // Update range graphics
        if (this.rangeGraphics) {
            this.rangeGraphics.clear();
            this.rangeGraphics.lineStyle(1, 0xffffff, 0.3);
            this.rangeGraphics.strokeCircle(this.x, this.y, this.range);
        }
        return true;
    }

    // Calculate sell value (70% of all money spent)
    getSellValue() {
        return Math.floor(this.moneySpent * 0.7);
    }

    select() {
        this.rangeGraphics.setVisible(true);
        this.setTint(GameConfig.COLORS.SELECTION_YELLOW);

        // Add pulsing effect
        this.setScale(1, 1);
        this.pulseTween = this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }

    deselect() {
        this.rangeGraphics.setVisible(false);
        this.clearTint();
        this.setScale(1, 1);
        
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
    }

    destroy() {
        if (this.rangeGraphics) {
            this.rangeGraphics.destroy();
        }
        if (this.pulseTween) {
            this.pulseTween.stop();
        }
        super.destroy();
    }
}

// Enemy Class
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemyType, wave) {
        const config = GameConfig.ENEMIES[enemyType];
        super(scene, x, y, config.spriteKey);
        
        this.scene = scene;
        this.enemyType = enemyType;
        this.wave = wave;
        this.pathIndex = 0;
        
        // Calculate stats based on wave
        this.health = config.baseHealth + (wave - 1) * config.healthIncrease;
        this.maxHealth = this.health;
        // Store the true base speed for consistent speed scaling
        this.baseSpeed = config.baseSpeed + (wave - 1) * config.speedIncrease;
        // Always set speed based on baseSpeed and current multiplier
        this.speed = this.baseSpeed * (scene._enemySpeedMult || 1);
        this.value = config.baseValue + (wave - 1) * config.valueIncrease;
        this.damageToPlayer = config.damageToPlayer;
        
        // Boss-specific properties
        if (enemyType === 'boss' || enemyType === 'superBoss') {
            this.isBoss = true;
            this.setScale(config.scale);
        }
        
        // Create health bar
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Tooltip events for enemy
        this.setInteractive();
        this.on('pointerover', (pointer) => {
            const config = GameConfig.ENEMIES[this.enemyType];
            let enemyName = this.enemyType.charAt(0).toUpperCase() + this.enemyType.slice(1);
            if (this.enemyType === 'superBoss') {
                enemyName = 'Super Boss';
            }
            let stats = `Name: ${enemyName}`;
            stats += `\nHealth: ${this.health} / ${this.maxHealth}`;
            stats += `\nSpeed: ${this.speed}`;
            stats += `\nValue: ${this.value}`;
            if (this.isBoss) stats += `\nType: Boss`;
            if (this.scene.uiManager && this.scene.uiManager.showEnemyTooltip) {
                this.scene.uiManager.showEnemyTooltip(pointer.worldX, pointer.worldY, stats);
            }
        });
        this.on('pointerout', () => {
            if (this.scene.uiManager && this.scene.uiManager.hideEnemyTooltip) {
                this.scene.uiManager.hideEnemyTooltip();
            }
        });
    }

    updateHealthBar() {
        this.healthBar.clear();
        const config = this.isBoss ? GameConfig.ENEMIES[this.enemyType] : GameConfig.ENEMIES.basic;
        const barWidth = config.healthBarWidth;
        const barHeight = config.healthBarHeight;
        const healthPercent = this.health / this.maxHealth;
        
        // Calculate position based on enemy size
        const enemyHeight = this.displayHeight || 32;
        const barY = this.y - enemyHeight/2 - 10; // Position above the enemy
        
        // Background (red)
        this.healthBar.fillStyle(GameConfig.COLORS.HEALTH_BAR_BG);
        this.healthBar.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Health (green)
        this.healthBar.fillStyle(GameConfig.COLORS.HEALTH_BAR_FILL);
        this.healthBar.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border for boss
        if (this.isBoss) {
            this.healthBar.lineStyle(1, GameConfig.COLORS.BOSS_HEALTH_BAR_BORDER);
            this.healthBar.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
        }
    }

    updateBossHealthBar() {
        this.healthBar.clear();
        const config = GameConfig.ENEMIES[this.enemyType];
        const barWidth = config.healthBarWidth;
        const barHeight = config.healthBarHeight;
        const healthPercent = this.health / this.maxHealth;
        
        // Calculate position based on boss size
        const bossHeight = this.displayHeight || 48; // Boss is larger
        const barY = this.y - bossHeight/2 - 15; // Position above the boss
        
        // Background (dark red)
        this.healthBar.fillStyle(GameConfig.COLORS.BOSS_HEALTH_BAR_BG);
        this.healthBar.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Health (bright green with gradient effect)
        this.healthBar.fillStyle(GameConfig.COLORS.BOSS_HEALTH_BAR_FILL);
        this.healthBar.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border
        this.healthBar.lineStyle(2, GameConfig.COLORS.BOSS_HEALTH_BAR_BORDER);
        this.healthBar.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Create or update boss label text
        const bossLabelText = this.enemyType === 'superBoss' ? 'SUPER BOSS' : 'BOSS';
        const labelWidth = this.enemyType === 'superBoss' ? 60 : 30;
        
        if (!this.bossLabel) {
            this.bossLabel = this.scene.add.text(this.x - labelWidth/2, barY - 10, bossLabelText, {
                fontSize: '12px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        } else {
            this.bossLabel.setPosition(this.x - labelWidth/2, barY - 10);
            this.bossLabel.setText(bossLabelText);
        }
    }

    move(delta, path) {
        if (this.pathIndex >= path.length - 1) {
            // Enemy reached the end
            this.scene.health -= this.damageToPlayer;
            if (this.scene && this.scene.uiManager && this.scene.uiManager.updateUI) {
                this.scene.uiManager.updateUI();
            }
            this.destroy();
            return false; // Enemy destroyed
        }

        const target = path[this.pathIndex + 1];
        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        
        if (distance < 5) {
            this.pathIndex++;
        } else {
            const moveDistance = (this.speed * delta) / 1000;
            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            this.x += Math.cos(angle) * moveDistance;
            this.y += Math.sin(angle) * moveDistance;
        }

        // Update health bar and boss label position
        if (this.isBoss) {
            this.updateBossHealthBar();
        } else {
            this.updateHealthBar();
        }
        
        return true; // Enemy still alive
    }

    takeDamage(damage) {
        this.health -= damage;

        if (this.health <= 0) {
            // Add money and increment enemies defeated using GameStateManager for consistency
            if (this.scene.gameStateManager) {
                this.scene.gameStateManager.addMoney(this.value);
                this.scene.gameStateManager.incrementEnemiesDefeated();
                // Also update scene.money for UI and legacy code compatibility
                this.scene.money = this.scene.gameStateManager.money;
                this.scene.enemiesDefeated = this.scene.gameStateManager.enemiesDefeated;
            } else {
                this.scene.money += this.value;
                this.scene.enemiesDefeated++;
                if (typeof window.gameEvents !== 'undefined') {
                    window.gameEvents.emit('moneyChanged', { newAmount: this.scene.money, change: this.value });
                }
            }
            this.destroy();
            return true; // Enemy oofed
        }

        // Update health bar
        if (this.isBoss) {
            this.updateBossHealthBar();
        } else {
            this.updateHealthBar();
        }

        return false; // Enemy still alive
    }

    destroy() {
        if (this.healthBar) {
            this.healthBar.destroy();
        }
        if (this.bossLabel) {
            this.bossLabel.destroy();
        }
        // Hide tooltip if this enemy is being destroyed and the tooltip is visible
        if (this.scene && this.scene.uiManager && this.scene.uiManager.hideEnemyTooltip) {
            this.scene.uiManager.hideEnemyTooltip();
        }
        super.destroy();
    }
}

// Bullet Class
class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, target, damage, range, texture, tower) {
        super(scene, x, y, texture);
        
        this.scene = scene;
        this.damage = damage;
        this.range = range;
        this.target = target;
        this.speed = GameConfig.GAME.bulletSpeed;
        this.startX = x;
        this.startY = y;
        this.tower = tower; // Reference to the tower that fired this bullet
        
        // Calculate direction
        this.angleToTarget = Phaser.Math.Angle.Between(x, y, target.x, target.y);
        this.dirX = Math.cos(this.angleToTarget);
        this.dirY = Math.sin(this.angleToTarget);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // Set velocity toward target
        this.body.setVelocity(this.dirX * this.speed, this.dirY * this.speed);
    }

    move(delta) {
        if (typeof this.startX !== 'number' || typeof this.startY !== 'number') {
            this.destroy();
            return false;
        }
        // Remove manual movement, let physics handle it
        const traveled = Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y);
        if (traveled > this.range) {
            this.destroy();
            return false;
        }
        return true; // Bullet still active
    }

    onHitEnemy(enemy) {
        if (!enemy.active) return;

        // Record the hit for the tower
        if (this.tower) {
            this.tower.recordHit();
        }

        const oofed = enemy.takeDamage(this.damage);

        // Record the oof for the tower
        if (oofed && this.tower) {
            this.tower.recordOof();
        }

        if (oofed) {
            // Ensure money and UI update immediately after enemy death
            if (this.scene && this.scene.uiManager && this.scene.uiManager.updateUI) {
                this.scene.uiManager.updateUI();
            }
            if (this.scene && typeof window.gameEvents !== 'undefined') {
                window.gameEvents.emit('moneyChanged', { newAmount: this.scene.money, change: enemy.value });
            }
            if (this.scene.effectsManager) {
                if (enemy.enemyType === 'superBoss') {
                    this.scene.effectsManager.createSuperBossDeathEffect(enemy.x, enemy.y);
                } else if (enemy.isBoss) {
                    this.scene.effectsManager.createBossDeathEffect(enemy.x, enemy.y);
                } else {
                    this.scene.effectsManager.createDeathEffect(enemy.x, enemy.y);
                }
            }
        }
        this.destroy();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Tower, Enemy, Bullet };
}