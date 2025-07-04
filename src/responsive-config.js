// Responsive Configuration and Scaling Utilities
class ResponsiveConfig {
    constructor() {
        this.updateDimensions();
        this.setupResizeListener();
    }

    updateDimensions() {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Define base dimensions (desktop)
        const baseWidth = 1200;
        const baseHeight = 800;
        
        // Calculate scale factors
        this.scaleX = viewportWidth / baseWidth;
        this.scaleY = viewportHeight / baseHeight;
        this.scale = Math.min(this.scaleX, this.scaleY, 1); // Don't scale up beyond 1
        
        // Calculate actual game dimensions
        this.gameWidth = Math.floor(baseWidth * this.scale);
        this.gameHeight = Math.floor(baseHeight * this.scale);
        
        // Calculate offsets to center the game
        this.offsetX = (viewportWidth - this.gameWidth) / 2;
        this.offsetY = (viewportHeight - this.gameHeight) / 2;
        
        // Determine if we're on mobile
        // Updated breakpoint to accommodate modern mobile devices (iPhone 14 Pro Max = 896px)
        this.isMobile = viewportWidth <= 1024;
        this.isTablet = viewportWidth > 1024 && viewportWidth <= 1366;
        
        // Update UI dimensions based on screen size
        this.updateUIDimensions();
    }

    updateUIDimensions() {
        if (this.isMobile) {
            // Mobile UI adjustments
            this.uiTopHeight = Math.floor(60 * this.scale);
            this.uiBottomHeight = Math.floor(100 * this.scale);
            this.buttonHeight = Math.floor(40 * this.scale);
            this.buttonWidth = Math.floor(80 * this.scale);
            this.textFontSize = Math.floor(16 * this.scale) + 'px';
            this.buttonFontSize = Math.floor(14 * this.scale) + 'px';
            this.towerButtonSpacing = Math.floor(8 * this.scale);
        } else if (this.isTablet) {
            // Tablet UI adjustments
            this.uiTopHeight = Math.floor(70 * this.scale);
            this.uiBottomHeight = Math.floor(90 * this.scale);
            this.buttonHeight = Math.floor(45 * this.scale);
            this.buttonWidth = Math.floor(100 * this.scale);
            this.textFontSize = Math.floor(20 * this.scale) + 'px';
            this.buttonFontSize = Math.floor(18 * this.scale) + 'px';
            this.towerButtonSpacing = Math.floor(12 * this.scale);
        } else {
            // Desktop UI (original)
            this.uiTopHeight = Math.floor(80 * this.scale);
            this.uiBottomHeight = Math.floor(80 * this.scale);
            this.buttonHeight = Math.floor(50 * this.scale);
            this.buttonWidth = Math.floor(110 * this.scale);
            this.textFontSize = Math.floor(24 * this.scale) + 'px';
            this.buttonFontSize = Math.floor(15 * this.scale) + 'px';
            this.towerButtonSpacing = Math.floor(16 * this.scale);
        }
        
        // Calculate game area boundaries
        this.gameAreaTop = this.uiTopHeight;
        this.gameAreaBottom = this.gameHeight - this.uiBottomHeight;
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            this.updateDimensions();
            // Dispatch custom event for other components to listen to
            window.dispatchEvent(new CustomEvent('gameResize', {
                detail: {
                    scale: this.scale,
                    gameWidth: this.gameWidth,
                    gameHeight: this.gameHeight,
                    isMobile: this.isMobile
                }
            }));
        });
    }

    // Utility methods for scaling
    scaleValue(value) {
        return Math.floor(value * this.scale);
    }

    scalePosition(x, y) {
        return {
            x: this.scaleValue(x),
            y: this.scaleValue(y)
        };
    }

    // Get responsive game config
    getGameConfig() {
        return {
            GAME_WIDTH: this.gameWidth,
            GAME_HEIGHT: this.gameHeight,
            UI_TOP_HEIGHT: this.uiTopHeight,
            UI_BOTTOM_HEIGHT: this.uiBottomHeight,
            GAME_AREA_TOP: this.gameAreaTop,
            GAME_AREA_BOTTOM: this.gameAreaBottom,
            SCALE: this.scale,
            IS_MOBILE: this.isMobile,
            IS_TABLET: this.isTablet,
            BUTTON_HEIGHT: this.buttonHeight,
            BUTTON_WIDTH: this.buttonWidth,
            TEXT_FONT_SIZE: this.textFontSize,
            BUTTON_FONT_SIZE: this.buttonFontSize,
            TOWER_BUTTON_SPACING: this.towerButtonSpacing
        };
    }

    // Scale path coordinates
    getScaledPath() {
        return GameConfig.PATH.map(point => ({
            x: this.scaleValue(point.x),
            y: this.scaleValue(point.y)
        }));
    }

    // Get touch-friendly button dimensions
    getTouchButtonConfig() {
        if (this.isMobile) {
            return {
                minWidth: 44, // Apple's recommended minimum touch target
                minHeight: 44,
                padding: 8
            };
        }
        return {
            minWidth: 32,
            minHeight: 32,
            padding: 4
        };
    }
}

// Create global instance
window.responsiveConfig = new ResponsiveConfig(); 