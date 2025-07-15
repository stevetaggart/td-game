// Multishot ghost colors
// (add these inside COLORS below)
// Game Configuration and Constants
const GameConfig = {
    // Game dimensions and UI
    GAME_WIDTH: 1200,
    GAME_HEIGHT: 800,
    UI_TOP_HEIGHT: 80,
    UI_BOTTOM_HEIGHT: 80,
    GAME_AREA_TOP: 80,
    GAME_AREA_BOTTOM: 720,
    
    // Colors
    COLORS: {
        // Multishot ghost colors
        GHOST_MULTISHOT_BASE: 0x6C63FF,
        GHOST_MULTISHOT_CORE: 0xF9A825,
        GHOST_MULTISHOT_BARREL: 0x3F3D56,
        GHOST_MULTISHOT_CENTER: 0xFFFFFF,
        BACKGROUND: '#2c3e50',
        UI_PANEL: 0x000000,
        UI_PANEL_ALPHA: 0.7,
        HEALTH_TEXT: '#fff',
        MONEY_TEXT: '#fff',
        WAVE_TEXT: '#fff',
        ENEMIES_TEXT: '#fff',
        BUTTON_BLUE: 0x3498db,
        BUTTON_BLUE_HOVER: 0x2980b9,
        BUTTON_DISABLED: 0x7f8c8d,
        BUTTON_GREEN: 0x2ecc71,
        BUTTON_GREEN_HOVER: 0x27ae60,
        BUTTON_RED: 0xe74c3c,
        BUTTON_RED_HOVER: 0xc0392b,
        BUTTON_SHADOW: 0x000000,
        BUTTON_SHADOW_ALPHA: 0.3,
        SELECTION_YELLOW: 0xffff00,
        SELECTION_GLOW: 0xffff00,
        VALID_PLACEMENT: 0x27ae60,
        INVALID_PLACEMENT: 0xe74c3c,
        HEALTH_BAR_BG: 0xff0000,
        HEALTH_BAR_FILL: 0x00ff00,
        BOSS_HEALTH_BAR_BG: 0x8b0000,
        BOSS_HEALTH_BAR_FILL: 0x00ff00,
        BOSS_HEALTH_BAR_BORDER: 0xffffff,
        BULLET_BASIC: 0xf1c40f,
        BULLET_BASIC_CORE: 0xffffff,
        CANNON_BALL_OUTER: 0x2c3e50,
        CANNON_BALL_MIDDLE: 0x95a5a6,
        CANNON_BALL_INNER: 0x34495e,
        GHOST_TOWER_ALPHA: 0.5,
        GHOST_BASIC_BASE: 0x8b4513,
        GHOST_BASIC_BODY: 0xa0522d,
        GHOST_BASIC_DETAIL: 0x696969,
        GHOST_BASIC_ACCENT: 0x2ecc71,
        GHOST_RAPID_BASE: 0x8b4513,
        GHOST_RAPID_BODY: 0x2c3e50,
        GHOST_RAPID_DETAIL: 0x696969,
        GHOST_RAPID_ACCENT: 0xe74c3c,
        GHOST_CANNON_BASE: 0x8b4513,
        GHOST_CANNON_BODY: 0x34495e,
        GHOST_CANNON_DETAIL: 0x696969,
        GHOST_CANNON_BARREL: 0x2c3e50,
        GHOST_CANNON_ACCENT: 0x9b59b6,
        MUZZLE_FLASH_WHITE: 0xffffff,
        MUZZLE_FLASH_YELLOW: 0xf1c40f,
        DEATH_EFFECT_RED: 0xe74c3c,
        DEATH_EFFECT_ORANGE: 0xf39c12,
        DEATH_EFFECT_WHITE: 0xffffff,
        PLACEMENT_EFFECT: 0x27ae60,
        UPGRADE_EFFECT_BLUE: 0x3498db,
        UPGRADE_EFFECT_PURPLE: 0x9b59b6,
        BOSS_SPAWN_RED: 0xe74c3c,
        BOSS_SPAWN_ORANGE: 0xf39c12,
        BOSS_SPAWN_WHITE: 0xffffff
    },
    
    // Tower configurations
    TOWERS: {
        multishotTower: {
            name: 'Multishot',
            cost: 100,
            damage: 15,
            range: 90,
            fireRate: 1200,
            spriteKey: 'multishotTower', // Now uses its own sprite
            ghostSpriteKey: 'ghostMultishotTower',
            bulletTexture: 'bullet',
            upgradeCost: 60, // Twice as expensive as normal upgrades
            damageIncrease: 10,
            rangeIncrease: 10,
            baseProjectiles: 3,
            projectileSpread: 30 // degrees
        },
        basicTower: {
            name: 'Basic Tower',
            cost: 20,
            damage: 20,
            range: 80,
            fireRate: 1000,
            spriteKey: 'basicTower',
            ghostSpriteKey: 'ghostBasicTower',
            bulletTexture: 'bullet',
            upgradeCost: 30,
            damageIncrease: 10,
            rangeIncrease: 10
        },
        rapidTower: {
            name: 'Rapid Fire',
            cost: 40,
            damage: 10,
            range: 60,
            fireRate: 300,
            spriteKey: 'rapidTower',
            ghostSpriteKey: 'ghostRapidTower',
            bulletTexture: 'bullet',
            upgradeCost: 30,
            damageIncrease: 10,
            rangeIncrease: 10
        },
        cannonTower: {
            name: 'Cannon',
            cost: 60,
            damage: 50,
            range: 100,
            fireRate: 1500,
            spriteKey: 'cannonTower',
            ghostSpriteKey: 'ghostCannonTower',
            bulletTexture: 'cannonBall',
            upgradeCost: 30,
            damageIncrease: 10,
            rangeIncrease: 10
        }
    },
    
    // Enemy configurations
    ENEMIES: {
        basic: {
            spriteKey: 'enemy',
            baseHealth: 50,
            healthIncrease: 20,
            baseSpeed: 50,
            speedIncrease: 10,
            baseValue: 5,
            valueIncrease: 1,
            healthBarWidth: 20,
            healthBarHeight: 4,
            damageToPlayer: 5
        },
        strong: {
            spriteKey: 'strongEnemy',
            baseHealth: 100,
            healthIncrease: 30,
            baseSpeed: 40,
            speedIncrease: 8,
            baseValue: 10,
            valueIncrease: 3,
            healthBarWidth: 20,
            healthBarHeight: 4,
            damageToPlayer: 10
        },
        boss: {
            spriteKey: 'bossEnemy',
            baseHealth: 1500,
            healthIncrease: 50,
            baseSpeed: 30,
            speedIncrease: 5,
            baseValue: 50,
            valueIncrease: 10,
            healthBarWidth: 40,
            healthBarHeight: 6,
            damageToPlayer: 90,
            scale: 1.2,
            spawnWave: 10
        },
        superBoss: {
            spriteKey: 'bossEnemy',
            baseHealth: 15000,
            healthIncrease: 500,
            baseSpeed: 25,
            speedIncrease: 3,
            baseValue: 200,
            valueIncrease: 50,
            healthBarWidth: 60,
            healthBarHeight: 8,
            damageToPlayer: 100,
            scale: 1.5,
            spawnWave: 30
        }
    },
    
    // Wave configurations
    WAVES: {
        baseEnemies: 7,
        enemiesIncrease: 2,
        waveBonus: 50,
        strongEnemyChance: 0.3,
        strongEnemyStartWave: 3
    },
    
    // Game settings
    GAME: {
        startingHealth: 100,
        startingMoney: 300,
        startingWave: 1,
        bulletSpeed: 300,
        towerPlacementRadius: 30,
        pathClearance: 40,
        ghostTowerAlpha: 0.7,
        placementIndicatorAlpha: 0.8,
        rangePreviewAlpha: 0.4,
        rangePreviewFillAlpha: 0.1
    },
    
    // UI settings
    UI: {
        buttonWidth: 200,
        buttonHeight: 50,
        buttonSpacing: 40,
        buttonStartX: 40,
        buttonY: 730,
        startWaveButtonWidth: 140,
        startWaveButtonHeight: 50,
        startWaveButtonX: 1100,
        startWaveButtonY: 755,
        textFontSize: '24px',
        buttonFontSize: '20px',
        gameOverFontSize: '48px',
        gameOverStatsFontSize: '32px'
    },
    
    // Map configuration
    MAPS: {
        default: 'assets/maps/default-map.js',
        spiral: 'assets/maps/spiral-map.js'
    },
    
    // Asset paths
    ASSETS: {
        basicTower: 'assets/basic_tower_topdown_40x40.svg',
        rapidTower: 'assets/rapid_tower_topdown_40x40.svg',
        cannonTower: 'assets/canon_tower_topdown_40x40.svg',
        multishotTower: 'assets/multishot_tower_topdown_40x40.svg',
        enemy: 'assets/enemy_basic.svg',
        strongEnemy: 'assets/enemy_strong.svg',
        bossEnemy: 'assets/enemy_boss.svg',
        enemyPath: 'assets/maps/enemy_path_no_bg.svg',
        bullet: 'assets/bullet_basic.svg',
        cannonBall: 'assets/bullet_cannon.svg',
        speakerOn: 'assets/speaker-on.svg',
        speakerOff: 'assets/speaker-off.svg'
    },
    
    // Effect settings
    EFFECTS: {
        muzzleFlash: {
            duration: 100,
            scale: 2,
            outerRadius: 8,
            innerRadius: 5
        },
        deathEffect: {
            duration: 200,
            scale: 3,
            innerRadius: 3,
            middleRadius: 6,
            outerRadius: 9
        },
        placementEffect: {
            duration: 300,
            scale: 3,
            radius: 5
        },
        upgradeEffect: {
            duration: 400,
            scale: 2,
            innerRadius: 10,
            outerRadius: 15
        },
        bossSpawnEffect: {
            duration: 800,
            scale: 3,
            innerRadius: 20,
            outerRadius: 30,
            centerRadius: 10,
            shakeDuration: 500,
            shakeIntensity: 0.02
        },
        bossDeathEffect: {
            duration: 500,
            scale: 4,
            shakeDuration: 300,
            shakeIntensity: 0.03
        }
    }
};

// Export for use in other files
export default GameConfig;