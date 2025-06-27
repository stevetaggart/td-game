// Effects Manager Class
class EffectsManager {
    constructor(scene) {
        this.scene = scene;
    }

    // Boss spawn effect
    createBossSpawnEffect(x, y) {
        const spawnEffect = this.scene.add.graphics();
        const config = GameConfig.EFFECTS.bossSpawnEffect;
        
        // Outer ring
        spawnEffect.lineStyle(4, GameConfig.COLORS.BOSS_SPAWN_RED, 1);
        spawnEffect.strokeCircle(x, y, config.outerRadius);
        
        // Inner ring
        spawnEffect.lineStyle(2, GameConfig.COLORS.BOSS_SPAWN_ORANGE, 1);
        spawnEffect.strokeCircle(x, y, config.innerRadius);
        
        // Center flash
        spawnEffect.fillStyle(GameConfig.COLORS.BOSS_SPAWN_WHITE, 0.8);
        spawnEffect.fillCircle(x, y, config.centerRadius);
        
        this.scene.tweens.add({
            targets: spawnEffect,
            alpha: 0,
            scaleX: config.scale,
            scaleY: config.scale,
            duration: config.duration,
            ease: 'Power2',
            onComplete: () => spawnEffect.destroy()
        });
        
        // Add screen shake effect
        this.scene.cameras.main.shake(config.shakeDuration, config.shakeIntensity);
    }

    // Boss death effect
    createBossDeathEffect(x, y) {
        const explosion = this.scene.add.graphics();
        const config = GameConfig.EFFECTS.bossDeathEffect;
        
        // Multiple explosion rings
        explosion.lineStyle(3, GameConfig.COLORS.DEATH_EFFECT_RED, 0.8);
        explosion.strokeCircle(x, y, 5);
        explosion.lineStyle(2, GameConfig.COLORS.DEATH_EFFECT_ORANGE, 0.6);
        explosion.strokeCircle(x, y, 10);
        explosion.lineStyle(1, GameConfig.COLORS.DEATH_EFFECT_WHITE, 0.4);
        explosion.strokeCircle(x, y, 15);
        
        // Center explosion
        explosion.fillStyle(GameConfig.COLORS.DEATH_EFFECT_RED, 0.8);
        explosion.fillCircle(x, y, 8);
        explosion.fillStyle(GameConfig.COLORS.DEATH_EFFECT_ORANGE, 0.6);
        explosion.fillCircle(x, y, 12);
        explosion.fillStyle(GameConfig.COLORS.DEATH_EFFECT_WHITE, 0.4);
        explosion.fillCircle(x, y, 16);
        
        this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: config.scale,
            scaleY: config.scale,
            duration: config.duration,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
        
        // Add screen shake for boss death
        this.scene.cameras.main.shake(config.shakeDuration, config.shakeIntensity);
    }

    // Regular enemy death effect
    createDeathEffect(x, y) {
        const explosion = this.scene.add.graphics();
        const config = GameConfig.EFFECTS.deathEffect;
        
        explosion.fillStyle(GameConfig.COLORS.DEATH_EFFECT_RED, 0.8);
        explosion.fillCircle(x, y, config.innerRadius);
        explosion.fillStyle(GameConfig.COLORS.DEATH_EFFECT_ORANGE, 0.6);
        explosion.fillCircle(x, y, config.middleRadius);
        explosion.fillStyle(GameConfig.COLORS.DEATH_EFFECT_WHITE, 0.4);
        explosion.fillCircle(x, y, config.outerRadius);
        
        this.scene.tweens.add({
            targets: explosion,
            alpha: 0,
            scaleX: config.scale,
            scaleY: config.scale,
            duration: config.duration,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
    }

    // Tower placement effect
    createPlacementEffect(x, y) {
        const effect = this.scene.add.graphics();
        const config = GameConfig.EFFECTS.placementEffect;
        
        effect.lineStyle(3, GameConfig.COLORS.PLACEMENT_EFFECT, 1);
        effect.strokeCircle(x, y, config.radius);
        
        this.scene.tweens.add({
            targets: effect,
            alpha: 0,
            scaleX: config.scale,
            scaleY: config.scale,
            duration: config.duration,
            ease: 'Power2',
            onComplete: () => effect.destroy()
        });
    }

    // Tower upgrade effect
    createUpgradeEffect(x, y) {
        const upgrade = this.scene.add.graphics();
        const config = GameConfig.EFFECTS.upgradeEffect;
        
        upgrade.lineStyle(2, GameConfig.COLORS.UPGRADE_EFFECT_BLUE, 1);
        upgrade.strokeCircle(x, y, config.innerRadius);
        upgrade.lineStyle(2, GameConfig.COLORS.UPGRADE_EFFECT_PURPLE, 1);
        upgrade.strokeCircle(x, y, config.outerRadius);
        
        this.scene.tweens.add({
            targets: upgrade,
            alpha: 0,
            scaleX: config.scale,
            scaleY: config.scale,
            duration: config.duration,
            ease: 'Power2',
            onComplete: () => upgrade.destroy()
        });
    }

    // Muzzle flash effect
    createMuzzleFlash(x, y) {
        const flash = this.scene.add.graphics();
        const config = GameConfig.EFFECTS.muzzleFlash;
        
        flash.fillStyle(GameConfig.COLORS.MUZZLE_FLASH_WHITE, 0.8);
        flash.fillCircle(x, y, config.outerRadius);
        flash.fillStyle(GameConfig.COLORS.MUZZLE_FLASH_YELLOW, 0.6);
        flash.fillCircle(x, y, config.innerRadius);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: config.scale,
            scaleY: config.scale,
            duration: config.duration,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }

    // Money gain effect
    createMoneyEffect(x, y, amount) {
        const moneyText = this.scene.add.text(x, y, `+${amount}`, {
            fontSize: '16px',
            fill: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: moneyText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => moneyText.destroy()
        });
    }

    // Health loss effect
    createHealthLossEffect(x, y, amount) {
        const healthText = this.scene.add.text(x, y, `-${amount}`, {
            fontSize: '16px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: healthText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => healthText.destroy()
        });
    }

    // Wave start effect
    createWaveStartEffect(waveNumber) {
        const waveText = this.scene.add.text(GameConfig.GAME_WIDTH / 2, GameConfig.GAME_HEIGHT / 2, `WAVE ${waveNumber}`, {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add glow effect
        waveText.setShadow(0, 0, '#ffff00', 10);

        this.scene.tweens.add({
            targets: waveText,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => waveText.destroy()
        });

        // Add screen flash
        const flash = this.scene.add.rectangle(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT, 0xffffff, 0.3);
        flash.setOrigin(0, 0);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }

    // Game over effect
    createGameOverEffect() {
        // Add dramatic screen shake
        this.scene.cameras.main.shake(1000, 0.05);
        
        // Add red flash
        const flash = this.scene.add.rectangle(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT, 0xff0000, 0.2);
        flash.setOrigin(0, 0);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });
    }

    // Victory effect
    createVictoryEffect() {
        // Add celebratory screen shake
        this.scene.cameras.main.shake(500, 0.02);
        
        // Add golden flash
        const flash = this.scene.add.rectangle(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT, 0xffd700, 0.3);
        flash.setOrigin(0, 0);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => flash.destroy()
        });

        // Add victory text
        const victoryText = this.scene.add.text(GameConfig.GAME_WIDTH / 2, GameConfig.GAME_HEIGHT / 2, 'VICTORY!', {
            fontSize: '64px',
            fill: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        victoryText.setShadow(0, 0, '#ffffff', 15);

        this.scene.tweens.add({
            targets: victoryText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: 2,
            ease: 'Power2',
            onComplete: () => victoryText.destroy()
        });
    }

    // Button click effect
    createButtonClickEffect(button) {
        this.scene.tweens.add({
            targets: button,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            yoyo: true,
            ease: 'Power2'
        });
    }

    // Button hover effect
    createButtonHoverEffect(button) {
        this.scene.tweens.add({
            targets: button,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 100,
            ease: 'Power2'
        });
    }

    // Button unhover effect
    createButtonUnhoverEffect(button) {
        this.scene.tweens.add({
            targets: button,
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power2'
        });
    }

    // Tower selection effect
    createTowerSelectionEffect(tower) {
        // Add a pulsing glow around the selected tower
        const glow = this.scene.add.graphics();
        glow.lineStyle(3, GameConfig.COLORS.SELECTION_YELLOW, 0.8);
        glow.strokeCircle(tower.x, tower.y, tower.displayWidth / 2 + 10);

        this.scene.tweens.add({
            targets: glow,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => glow.destroy()
        });
    }

    // Enemy spawn effect
    createEnemySpawnEffect(x, y) {
        const spawnEffect = this.scene.add.graphics();
        
        spawnEffect.lineStyle(2, GameConfig.COLORS.DEATH_EFFECT_RED, 0.6);
        spawnEffect.strokeCircle(x, y, 15);
        
        spawnEffect.fillStyle(GameConfig.COLORS.DEATH_EFFECT_ORANGE, 0.4);
        spawnEffect.fillCircle(x, y, 8);
        
        this.scene.tweens.add({
            targets: spawnEffect,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => spawnEffect.destroy()
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EffectsManager;
} 