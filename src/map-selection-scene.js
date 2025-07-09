class MapSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectionScene' });
        this.selectedMapId = null;
    }

    preload() {
        // Load map thumbnails
        this.load.image('desertWindsThumb', GameConfig.ASSETS.desertWindsThumb);
        this.load.image('frozenPeaksThumb', GameConfig.ASSETS.frozenPeaksThumb);
        this.load.image('volcanicMazeThumb', GameConfig.ASSETS.volcanicMazeThumb);
        this.load.image('ancientRuinsThumb', GameConfig.ASSETS.ancientRuinsThumb);
        
        // Load map backgrounds for the game
        this.load.image('desertWindsBg', GameConfig.ASSETS.desertWindsBg);
        this.load.image('frozenPeaksBg', GameConfig.ASSETS.frozenPeaksBg);
        this.load.image('volcanicMazeBg', GameConfig.ASSETS.volcanicMazeBg);
        this.load.image('ancientRuinsBg', GameConfig.ASSETS.ancientRuinsBg);
    }

    create() {
        // Get responsive configuration
        this.responsiveConfig = window.responsiveConfig.getGameConfig();
        
        // Background
        this.add.rectangle(
            this.responsiveConfig.GAME_WIDTH / 2, 
            this.responsiveConfig.GAME_HEIGHT / 2, 
            this.responsiveConfig.GAME_WIDTH, 
            this.responsiveConfig.GAME_HEIGHT, 
            0x1a1a2e
        );

        // Title
        this.add.text(
            this.responsiveConfig.GAME_WIDTH / 2, 
            80, 
            'Select a Map', 
            {
                fontSize: this.responsiveConfig.IS_MOBILE ? '32px' : '48px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        // Subtitle
        this.add.text(
            this.responsiveConfig.GAME_WIDTH / 2, 
            130, 
            'Choose your battlefield wisely!', 
            {
                fontSize: this.responsiveConfig.IS_MOBILE ? '16px' : '24px',
                fontFamily: 'Arial',
                fill: '#cccccc'
            }
        ).setOrigin(0.5);

        this.createMapCards();
        this.createBackButton();
    }

    createMapCards() {
        const maps = Object.values(GameConfig.MAPS);
        const cardWidth = this.responsiveConfig.IS_MOBILE ? 140 : 200;
        const cardHeight = this.responsiveConfig.IS_MOBILE ? 180 : 250;
        const spacing = this.responsiveConfig.IS_MOBILE ? 20 : 40;
        
        // Calculate grid layout
        const cardsPerRow = this.responsiveConfig.IS_MOBILE ? 2 : 4;
        const totalWidth = (cardWidth * cardsPerRow) + (spacing * (cardsPerRow - 1));
        const startX = (this.responsiveConfig.GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
        const startY = this.responsiveConfig.IS_MOBILE ? 220 : 280;

        maps.forEach((map, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const x = startX + col * (cardWidth + spacing);
            const y = startY + row * (cardHeight + spacing + 40);

            this.createMapCard(map, x, y, cardWidth, cardHeight);
        });
    }

    createMapCard(map, x, y, width, height) {
        // Card background
        const cardBg = this.add.rectangle(x, y, width, height, 0x2d3436, 0.9);
        cardBg.setStrokeStyle(2, 0x74b9ff);

        // Map thumbnail
        const thumbnailKey = this.getAssetKeyFromPath(map.thumbnail);
        const thumbnail = this.add.image(x, y - 30, thumbnailKey);
        
        // Scale thumbnail to fit card
        const thumbnailScale = Math.min((width - 20) / 200, (height - 80) / 150);
        thumbnail.setScale(thumbnailScale);

        // Map name
        const nameText = this.add.text(x, y + height/2 - 35, map.name, {
            fontSize: this.responsiveConfig.IS_MOBILE ? '14px' : '18px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Description
        const descText = this.add.text(x, y + height/2 - 15, map.description, {
            fontSize: this.responsiveConfig.IS_MOBILE ? '10px' : '12px',
            fontFamily: 'Arial',
            fill: '#cccccc',
            wordWrap: { width: width - 10 }
        }).setOrigin(0.5);

        // Difficulty badge
        const difficultyColor = this.getDifficultyColor(map.difficulty);
        const difficultyBadge = this.add.rectangle(x + width/2 - 30, y - height/2 + 15, 60, 20, difficultyColor);
        this.add.text(x + width/2 - 30, y - height/2 + 15, map.difficulty, {
            fontSize: '10px',
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Create interactive area
        const hitArea = this.add.rectangle(x, y, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        // Hover effects
        hitArea.on('pointerover', () => {
            cardBg.setStrokeStyle(3, 0x0984e3);
            cardBg.setScale(1.02);
            thumbnail.setScale(thumbnailScale * 1.02);
            nameText.setScale(1.05);
        });

        hitArea.on('pointerout', () => {
            cardBg.setStrokeStyle(2, 0x74b9ff);
            cardBg.setScale(1);
            thumbnail.setScale(thumbnailScale);
            nameText.setScale(1);
        });

        // Click handler
        hitArea.on('pointerdown', () => {
            this.selectMap(map.id);
        });

        // Store references for cleanup
        const cardGroup = this.add.group([cardBg, thumbnail, nameText, descText, difficultyBadge, hitArea]);
        cardGroup.mapId = map.id;
    }

    getAssetKeyFromPath(assetPath) {
        // Convert asset path to the key used in ASSETS
        const pathMap = {
            'assets/maps/desert_winds_thumb.svg': 'desertWindsThumb',
            'assets/maps/frozen_peaks_thumb.svg': 'frozenPeaksThumb',
            'assets/maps/volcanic_maze_thumb.svg': 'volcanicMazeThumb',
            'assets/maps/ancient_ruins_thumb.svg': 'ancientRuinsThumb'
        };
        return pathMap[assetPath] || 'desertWindsThumb';
    }

    getDifficultyColor(difficulty) {
        const colors = {
            'Easy': 0x00b894,
            'Medium': 0xe17055,
            'Hard': 0xd63031
        };
        return colors[difficulty] || 0x74b9ff;
    }

    createBackButton() {
        // For backwards compatibility - only show if needed
        if (GameConfig.FEATURES.MAP_SELECTION) {
            const buttonY = this.responsiveConfig.GAME_HEIGHT - 60;
            const backButton = this.add.rectangle(100, buttonY, 160, 40, 0x636e72);
            backButton.setStrokeStyle(2, 0x2d3436);

            const backText = this.add.text(100, buttonY, 'Back to Game', {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            const backHitArea = this.add.rectangle(100, buttonY, 160, 40, 0x000000, 0);
            backHitArea.setInteractive({ useHandCursor: true });

            backHitArea.on('pointerover', () => {
                backButton.setFillStyle(0x2d3436);
            });

            backHitArea.on('pointerout', () => {
                backButton.setFillStyle(0x636e72);
            });

            backHitArea.on('pointerdown', () => {
                // Go back to original game with default map
                this.scene.start('TowerDefenseGame', { mapId: null });
            });
        }
    }

    selectMap(mapId) {
        this.selectedMapId = mapId;
        
        // Create selection effect
        this.createSelectionEffect();
        
        // Start the game with selected map
        this.time.delayedCall(500, () => {
            this.scene.start('TowerDefenseGame', { mapId: mapId });
        });
    }

    createSelectionEffect() {
        // Flash effect
        const flash = this.add.rectangle(
            this.responsiveConfig.GAME_WIDTH / 2, 
            this.responsiveConfig.GAME_HEIGHT / 2, 
            this.responsiveConfig.GAME_WIDTH, 
            this.responsiveConfig.GAME_HEIGHT, 
            0xffffff, 
            0.3
        );

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });

        // Success text
        const selectText = this.add.text(
            this.responsiveConfig.GAME_WIDTH / 2, 
            this.responsiveConfig.GAME_HEIGHT / 2, 
            'Loading Map...', 
            {
                fontSize: '32px',
                fontFamily: 'Arial',
                fill: '#00b894',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: selectText,
            alpha: 0,
            duration: 400,
            delay: 100,
            onComplete: () => {
                selectText.destroy();
            }
        });
    }
}