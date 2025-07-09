// Game Initialization with Responsive Configuration
class GameInitializer {
    constructor() {
        this.game = null;
        this.init();
    }

    init() {
        // Wait for responsive config to be ready
        if (window.responsiveConfig) {
            this.createGame();
        } else {
            // Fallback if responsive config isn't loaded yet
            setTimeout(() => this.init(), 100);
        }
    }

    createGame() {
        const responsiveConfig = window.responsiveConfig.getGameConfig();
        
        // Create Phaser game configuration
        const config = {
            type: Phaser.AUTO,
            parent: 'gameContainer',
            width: responsiveConfig.GAME_WIDTH,
            height: responsiveConfig.GAME_HEIGHT,
            backgroundColor: GameConfig.COLORS.BACKGROUND,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: GameConfig.FEATURES.MAP_SELECTION ? [MapSelectionScene, TowerDefenseGame] : TowerDefenseGame,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: responsiveConfig.GAME_WIDTH,
                height: responsiveConfig.GAME_HEIGHT,
                parent: 'gameContainer'
            },
            dom: {
                createContainer: true
            },
            input: {
                touch: {
                    capture: true
                }
            }
        };

        // Create the game instance
        this.game = new Phaser.Game(config);

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.game && this.game.scale) {
                const newConfig = window.responsiveConfig.getGameConfig();
                
                // Update the scale configuration
                this.game.scale.setGameSize(newConfig.GAME_WIDTH, newConfig.GAME_HEIGHT);
                
                // Notify the scene about the resize
                if (this.game.scene.getScene('TowerDefenseGame')) {
                    this.game.scene.getScene('TowerDefenseGame').handleResize(newConfig);
                }
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameInitializer();
}); 