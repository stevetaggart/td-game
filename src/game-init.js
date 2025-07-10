// Game Initialization - Desktop Only
class GameInitializer {
    constructor() {
        this.game = null;
        this.init();
    }

    init() {
        this.createGame();
    }

    createGame() {
        // Create Phaser game configuration with fixed desktop dimensions
        const config = {
            type: Phaser.AUTO,
            parent: 'gameContainer',
            width: GameConfig.GAME_WIDTH,
            height: GameConfig.GAME_HEIGHT,
            backgroundColor: GameConfig.COLORS.BACKGROUND,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: TowerDefenseGame,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: GameConfig.GAME_WIDTH,
                height: GameConfig.GAME_HEIGHT,
                parent: 'gameContainer'
            },
            dom: {
                createContainer: true
            }
        };

        // Create the game instance
        this.game = new Phaser.Game(config);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GameInitializer();
}); 