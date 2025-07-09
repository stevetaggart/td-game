// Map Selection Scene for Tower Defense Game
class MapSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectionScene' });
        this.selectedMapId = null;
        this.mapCards = [];
        this.titleText = null;
        this.playButton = null;
    }

    preload() {
        // Load map thumbnails (we'll create placeholders for now)
        this.createMapThumbnails();
        
        // Load background
        this.load.image('menuBackground', 'assets/enemy_path_no_bg.svg');
    }

    createMapThumbnails() {
        // Create thumbnail graphics for each map since we don't have actual thumbnail images yet
        const maps = window.MapUtils.getAllMaps();
        
        maps.forEach(map => {
            this.createMapThumbnailGraphic(map);
        });
    }

    createMapThumbnailGraphic(map) {
        // Create a simple thumbnail representation of the map
        const thumbnailWidth = 300;
        const thumbnailHeight = 200;
        
        const graphics = this.add.graphics();
        
        // Background
        graphics.fillStyle(0x2c3e50, 1);
        graphics.fillRect(0, 0, thumbnailWidth, thumbnailHeight);
        
        // Draw a simplified version of the path
        graphics.lineStyle(4, 0x34495e, 1);
        
        // Scale the path to fit in thumbnail
        const scaleX = thumbnailWidth / 1200;
        const scaleY = thumbnailHeight / 600;
        const scale = Math.min(scaleX, scaleY) * 0.8; // 80% to leave margins
        
        const offsetX = (thumbnailWidth - 1200 * scale) / 2;
        const offsetY = (thumbnailHeight - 600 * scale) / 2;
        
        // Draw the path
        graphics.beginPath();
        map.path.forEach((point, index) => {
            const x = offsetX + point.x * scale;
            const y = offsetY + point.y * scale;
            
            if (index === 0) {
                graphics.moveTo(x, y);
            } else {
                graphics.lineTo(x, y);
            }
        });
        graphics.strokePath();
        
        // Add some decorative elements based on map type
        if (map.id === 'classic') {
            graphics.fillStyle(0x27ae60, 0.6);
            graphics.fillRect(10, 10, 20, 20);
        } else if (map.id === 'serpentine') {
            graphics.fillStyle(0x3498db, 0.6);
            graphics.fillCircle(30, 30, 15);
        } else if (map.id === 'spiral') {
            graphics.fillStyle(0xe74c3c, 0.6);
            graphics.fillTriangle(280, 20, 270, 40, 290, 40);
        } else if (map.id === 'crossroads') {
            graphics.fillStyle(0x9b59b6, 0.6);
            graphics.fillRect(270, 10, 20, 20);
        }
        
        // Generate texture
        graphics.generateTexture(`${map.id}_thumbnail`, thumbnailWidth, thumbnailHeight);
        graphics.destroy();
    }

    create() {
        // Get responsive configuration
        this.responsiveConfig = window.responsiveConfig.getGameConfig();
        
        // Add background with slight tint
        const bg = this.add.image(this.responsiveConfig.GAME_WIDTH / 2, this.responsiveConfig.GAME_HEIGHT / 2, 'menuBackground');
        bg.setScale(this.responsiveConfig.SCALE);
        bg.setTint(0x34495e);
        bg.setAlpha(0.3);

        // Create overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, this.responsiveConfig.GAME_WIDTH, this.responsiveConfig.GAME_HEIGHT);

        // Title
        this.titleText = this.add.text(
            this.responsiveConfig.GAME_WIDTH / 2, 
            100, 
            'Select a Map', 
            {
                fontSize: this.responsiveConfig.IS_MOBILE ? '32px' : '48px',
                fill: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            }
        );
        this.titleText.setOrigin(0.5);

        // Create map cards
        this.createMapCards();

        // Create play button (initially disabled)
        this.createPlayButton();

        // Add input handling
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MapSelectionScene');
        });
    }

    createMapCards() {
        const maps = window.MapUtils.getAllMaps();
        const cardsPerRow = this.responsiveConfig.IS_MOBILE ? 1 : 2;
        const cardWidth = 320;
        const cardHeight = 280;
        const cardSpacing = 40;
        const totalWidth = (cardWidth * cardsPerRow) + (cardSpacing * (cardsPerRow - 1));
        const startX = (this.responsiveConfig.GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
        const startY = this.responsiveConfig.IS_MOBILE ? 200 : 220;

        maps.forEach((map, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            
            const x = startX + col * (cardWidth + cardSpacing);
            const y = startY + row * (cardHeight + cardSpacing);

            this.createMapCard(map, x, y, cardWidth, cardHeight);
        });
    }

    createMapCard(map, x, y, width, height) {
        // Card container
        const cardContainer = this.add.container(x, y);
        
        // Card background
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x34495e, 1);
        cardBg.lineStyle(3, 0x7f8c8d, 1);
        cardBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
        cardBg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
        cardContainer.add(cardBg);

        // Thumbnail
        const thumbnail = this.add.image(0, -40, `${map.id}_thumbnail`);
        thumbnail.setScale(0.8);
        cardContainer.add(thumbnail);

        // Map name
        const nameText = this.add.text(0, 60, map.name, {
            fontSize: this.responsiveConfig.IS_MOBILE ? '18px' : '22px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        nameText.setOrigin(0.5);
        cardContainer.add(nameText);

        // Difficulty
        const difficultyColors = {
            'Easy': '#27ae60',
            'Medium': '#f39c12',
            'Hard': '#e74c3c',
            'Expert': '#8e44ad'
        };
        
        const difficultyText = this.add.text(0, 85, map.difficulty, {
            fontSize: this.responsiveConfig.IS_MOBILE ? '14px' : '16px',
            fill: difficultyColors[map.difficulty] || '#ffffff',
            fontFamily: 'Arial, sans-serif'
        });
        difficultyText.setOrigin(0.5);
        cardContainer.add(difficultyText);

        // Description
        const descText = this.add.text(0, 105, map.description, {
            fontSize: this.responsiveConfig.IS_MOBILE ? '12px' : '14px',
            fill: '#bdc3c7',
            fontFamily: 'Arial, sans-serif',
            wordWrap: { width: width - 20 }
        });
        descText.setOrigin(0.5);
        cardContainer.add(descText);

        // Make card interactive
        const hitArea = new Phaser.Geom.Rectangle(-width/2, -height/2, width, height);
        cardContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        // Hover effects
        cardContainer.on('pointerover', () => {
            if (this.selectedMapId !== map.id) {
                cardBg.clear();
                cardBg.fillStyle(0x34495e, 1);
                cardBg.lineStyle(3, 0x3498db, 1);
                cardBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
                cardBg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
            }
        });

        cardContainer.on('pointerout', () => {
            if (this.selectedMapId !== map.id) {
                cardBg.clear();
                cardBg.fillStyle(0x34495e, 1);
                cardBg.lineStyle(3, 0x7f8c8d, 1);
                cardBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
                cardBg.strokeRoundedRect(-width/2, -height/2, width, height, 10);
            }
        });

        // Click handler
        cardContainer.on('pointerdown', () => {
            this.selectMap(map.id);
        });

        // Store reference
        this.mapCards.push({
            container: cardContainer,
            background: cardBg,
            mapId: map.id,
            width: width,
            height: height
        });
    }

    selectMap(mapId) {
        // Clear previous selection
        this.mapCards.forEach(card => {
            if (card.mapId === this.selectedMapId) {
                card.background.clear();
                card.background.fillStyle(0x34495e, 1);
                card.background.lineStyle(3, 0x7f8c8d, 1);
                card.background.fillRoundedRect(-card.width/2, -card.height/2, card.width, card.height, 10);
                card.background.strokeRoundedRect(-card.width/2, -card.height/2, card.width, card.height, 10);
            }
        });

        // Highlight selected card
        this.selectedMapId = mapId;
        const selectedCard = this.mapCards.find(card => card.mapId === mapId);
        if (selectedCard) {
            selectedCard.background.clear();
            selectedCard.background.fillStyle(0x34495e, 1);
            selectedCard.background.lineStyle(4, 0x27ae60, 1);
            selectedCard.background.fillRoundedRect(-selectedCard.width/2, -selectedCard.height/2, selectedCard.width, selectedCard.height, 10);
            selectedCard.background.strokeRoundedRect(-selectedCard.width/2, -selectedCard.height/2, selectedCard.width, selectedCard.height, 10);
        }

        // Enable play button
        this.updatePlayButton();
        
        // Trigger haptic feedback on mobile
        if (this.responsiveConfig.IS_MOBILE && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    createPlayButton() {
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonY = this.responsiveConfig.GAME_HEIGHT - 100;

        // Button container
        this.playButton = this.add.container(this.responsiveConfig.GAME_WIDTH / 2, buttonY);

        // Button background
        this.playButtonBg = this.add.graphics();
        this.playButton.add(this.playButtonBg);

        // Button text
        this.playButtonText = this.add.text(0, 0, 'Play Selected Map', {
            fontSize: this.responsiveConfig.IS_MOBILE ? '18px' : '22px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        });
        this.playButtonText.setOrigin(0.5);
        this.playButton.add(this.playButtonText);

        // Make button interactive
        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight);
        this.playButton.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // Button click handler
        this.playButton.on('pointerdown', () => {
            if (this.selectedMapId) {
                this.startGame();
            }
        });

        // Update button appearance
        this.updatePlayButton();
    }

    updatePlayButton() {
        const buttonWidth = 200;
        const buttonHeight = 60;
        const isEnabled = this.selectedMapId !== null;

        this.playButtonBg.clear();
        
        if (isEnabled) {
            // Enabled state
            this.playButtonBg.fillStyle(0x27ae60, 1);
            this.playButtonBg.lineStyle(3, 0x2ecc71, 1);
            this.playButtonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            this.playButtonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            this.playButtonText.setColor('#ffffff');
            
            // Hover effect
            this.playButton.off('pointerover');
            this.playButton.off('pointerout');
            
            this.playButton.on('pointerover', () => {
                this.playButtonBg.clear();
                this.playButtonBg.fillStyle(0x2ecc71, 1);
                this.playButtonBg.lineStyle(3, 0x27ae60, 1);
                this.playButtonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
                this.playButtonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            });

            this.playButton.on('pointerout', () => {
                this.playButtonBg.clear();
                this.playButtonBg.fillStyle(0x27ae60, 1);
                this.playButtonBg.lineStyle(3, 0x2ecc71, 1);
                this.playButtonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
                this.playButtonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            });
        } else {
            // Disabled state
            this.playButtonBg.fillStyle(0x7f8c8d, 1);
            this.playButtonBg.lineStyle(3, 0x95a5a6, 1);
            this.playButtonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            this.playButtonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            this.playButtonText.setColor('#bdc3c7');
        }
    }

    startGame() {
        if (!this.selectedMapId) return;

        // Store selected map in global variable for the game scene to use
        window.selectedMapId = this.selectedMapId;
        
        // Start the game scene
        this.scene.start('TowerDefenseGame');
    }

    handleResize(newConfig) {
        // Update responsive configuration
        this.responsiveConfig = newConfig;
        
        // Recreate the scene content with new dimensions
        this.scene.restart();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapSelectionScene;
}