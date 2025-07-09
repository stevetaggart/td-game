// Responsive Configuration and Scaling Utilities
class ResponsiveConfig {
    constructor() {
        this.updateDimensions();
        this.setupResizeListener();
        this.setupFullScreenHandling();
    }

    updateDimensions() {
        // Get viewport dimensions - use visual viewport for more accurate mobile detection
        const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        
        // For mobile devices, ensure we don't exceed the available space
        let effectiveHeight = viewportHeight;
        if (this.isMobileDevice()) {
            // Use a more conservative approach for mobile
            const screenHeight = window.screen.height;
            const maxHeight = Math.min(screenHeight * 0.85, viewportHeight); // Use 85% of screen height as max
            effectiveHeight = Math.min(viewportHeight, maxHeight);
        }
        
        // Define base dimensions (desktop)
        const baseWidth = 1200;
        const baseHeight = 800;
        
        // Calculate scale factors
        this.scaleX = viewportWidth / baseWidth;
        this.scaleY = effectiveHeight / baseHeight;
        this.scale = Math.min(this.scaleX, this.scaleY, 1); // Don't scale up beyond 1
        
        // Calculate actual game dimensions
        this.gameWidth = Math.floor(baseWidth * this.scale);
        this.gameHeight = Math.floor(baseHeight * this.scale);
        
        // Calculate offsets to center the game
        this.offsetX = (viewportWidth - this.gameWidth) / 2;
        this.offsetY = (effectiveHeight - this.gameHeight) / 2;
        
        // Determine if we're on mobile - use actual device detection instead of just screen width
        const isMobileDevice = this.isMobileDevice();
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = viewportWidth <= 926;
        
        // More reliable mobile detection
        this.isMobile = isMobileDevice || (isTouchDevice && isSmallScreen);
        this.isTablet = !this.isMobile && viewportWidth > 926 && viewportWidth <= 1366;
        
        // Debug logging disabled for production
        // console.log('Responsive Config:', {
        //     viewportWidth,
        //     isMobileDevice,
        //     isTouchDevice,
        //     isSmallScreen,
        //     isMobile: this.isMobile,
        //     isTablet: this.isTablet
        // });
        
        // Debug info disabled for production
        // this.showDebugInfo();
        
        // Update UI dimensions based on screen size
        this.updateUIDimensions();
    }

    updateUIDimensions() {
        if (this.isMobile) {
            // Mobile UI adjustments - use right-side panel instead of bottom
            this.uiTopHeight = Math.floor(60 * this.scale);
            this.uiBottomHeight = 0; // No bottom UI on mobile
            this.uiRightWidth = Math.floor(120 * this.scale); // Right-side panel for buttons
            this.buttonHeight = Math.floor(40 * this.scale);
            this.buttonWidth = Math.floor(80 * this.scale);
            this.textFontSize = Math.floor(16 * this.scale) + 'px';
            this.buttonFontSize = Math.floor(14 * this.scale) + 'px';
            this.towerButtonSpacing = Math.floor(8 * this.scale);
        } else if (this.isTablet) {
            // Tablet UI adjustments
            this.uiTopHeight = Math.floor(70 * this.scale);
            this.uiBottomHeight = Math.floor(90 * this.scale);
            this.uiRightWidth = 0; // No right UI on tablet
            this.buttonHeight = Math.floor(45 * this.scale);
            this.buttonWidth = Math.floor(100 * this.scale);
            this.textFontSize = Math.floor(20 * this.scale) + 'px';
            this.buttonFontSize = Math.floor(18 * this.scale) + 'px';
            this.towerButtonSpacing = Math.floor(12 * this.scale);
        } else {
            // Desktop UI (original)
            this.uiTopHeight = Math.floor(80 * this.scale);
            this.uiBottomHeight = Math.floor(80 * this.scale);
            this.uiRightWidth = 0; // No right UI on desktop
            this.buttonHeight = Math.floor(50 * this.scale);
            this.buttonWidth = Math.floor(110 * this.scale);
            this.textFontSize = Math.floor(24 * this.scale) + 'px';
            this.buttonFontSize = Math.floor(15 * this.scale) + 'px';
            this.towerButtonSpacing = Math.floor(16 * this.scale);
        }
        
        // Calculate game area boundaries
        this.gameAreaTop = this.uiTopHeight;
        this.gameAreaBottom = this.gameHeight - this.uiBottomHeight;
        this.gameAreaLeft = 0;
        this.gameAreaRight = this.gameWidth - (this.uiRightWidth || 0);
    }

    setupResizeListener() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.dispatchResizeEvent();
        });
        
        // Handle visual viewport changes (important for mobile browsers)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.updateDimensions();
                this.dispatchResizeEvent();
            });
        }
    }
    
    dispatchResizeEvent() {
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('gameResize', {
            detail: {
                scale: this.scale,
                gameWidth: this.gameWidth,
                gameHeight: this.gameHeight,
                isMobile: this.isMobile
            }
        }));
    }
    
    setupFullScreenHandling() {
        // Request full-screen on mobile devices
        if (this.isMobileDevice()) {
            // Add a tap-to-fullscreen overlay for first-time users
            this.createFullScreenPrompt();
            
            // Auto-request full-screen after a short delay
            setTimeout(() => {
                this.requestFullScreen();
            }, 1000);
        }
    }
    
    createFullScreenPrompt() {
        // Only show if user hasn't dismissed it before
        if (localStorage.getItem('fullScreenPromptDismissed')) return;
        
        const prompt = document.createElement('div');
        prompt.id = 'fullScreenPrompt';
        prompt.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <h2 style="margin-bottom: 20px;">🎮 Full-Screen Mode</h2>
                <p style="margin-bottom: 30px; line-height: 1.5;">
                    For the best gaming experience, tap below to enter full-screen mode.<br>
                    This will hide the browser UI and give you more screen space.
                </p>
                <button id="enterFullScreen" style="
                    background: #007AFF;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 15px;
                ">Enter Full-Screen</button>
                <button id="dismissPrompt" style="
                    background: transparent;
                    color: #999;
                    border: 1px solid #999;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 14px;
                ">Maybe Later</button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Handle button clicks
        document.getElementById('enterFullScreen').addEventListener('click', () => {
            this.requestFullScreen();
            prompt.remove();
        });
        
        document.getElementById('dismissPrompt').addEventListener('click', () => {
            localStorage.setItem('fullScreenPromptDismissed', 'true');
            prompt.remove();
        });
    }
    
    requestFullScreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
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
            UI_RIGHT_WIDTH: this.uiRightWidth || 0,
            GAME_AREA_TOP: this.gameAreaTop,
            GAME_AREA_BOTTOM: this.gameAreaBottom,
            GAME_AREA_LEFT: this.gameAreaLeft || 0,
            GAME_AREA_RIGHT: this.gameAreaRight || this.gameWidth,
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
    getScaledPath(customPath = null) {
        const pathToScale = customPath || GameConfig.PATH;
        
        if (this.isMobile) {
            // For mobile: scale and center path within available game area
            const gameAreaWidth = (this.gameAreaRight || this.gameWidth) - (this.gameAreaLeft || 0);
            const gameAreaHeight = this.gameAreaBottom - this.gameAreaTop;
            
            // Calculate scale to fit path within available game area
            const pathScale = Math.min(
                (gameAreaWidth * 0.9) / 1200, // 1200 is original path width
                (gameAreaHeight * 0.9) / 600,  // Approximate original path height
                this.scale
            );
            
            // Calculate offsets to center the path in the game area
            const offsetX = (this.gameAreaLeft || 0) + (gameAreaWidth - 1200 * pathScale) / 2;
            const offsetY = this.gameAreaTop + (gameAreaHeight - 600 * pathScale) / 2;
            
            return pathToScale.map(point => ({
                x: offsetX + point.x * pathScale,
                y: offsetY + point.y * pathScale
            }));
        } else {
            // For desktop/tablet: use original edge-to-edge scaling
            return pathToScale.map(point => ({
                x: this.scaleValue(point.x),
                y: this.scaleValue(point.y)
            }));
        }
    }

    // Detect if we're on an actual mobile device (not just screen size)
    isMobileDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
        
        // Debug logging disabled for production
        // console.log('Mobile Detection:', {
        //     userAgent: navigator.userAgent,
        //     maxTouchPoints: navigator.maxTouchPoints,
        //     isMobileDevice: isMobile,
        //     viewportWidth: window.innerWidth,
        //     isMobile: this.isMobile
        // });
        
        return isMobile;
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
    
    showDebugInfo() {
        // Remove existing debug info
        if (this.debugElement) {
            this.debugElement.remove();
        }
        
        // Create debug info element
        this.debugElement = document.createElement('div');
        this.debugElement.id = 'mobileDebugInfo';
        this.debugElement.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        const viewportWidth = window.innerWidth;
        const isMobileDevice = this.isMobileDevice();
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = viewportWidth <= 926;
        
        this.debugElement.innerHTML = `
            <strong>📱 Mobile Debug Info:</strong><br>
            Viewport: ${viewportWidth}px<br>
            Mobile Device: ${isMobileDevice ? '✅' : '❌'}<br>
            Touch Device: ${isTouchDevice ? '✅' : '❌'}<br>
            Small Screen: ${isSmallScreen ? '✅' : '❌'}<br>
            <strong>Final Result: ${this.isMobile ? 'MOBILE MODE ✅' : 'DESKTOP MODE ❌'}</strong><br>
            <small>Tap to hide</small>
        `;
        
        // Make it dismissible
        this.debugElement.addEventListener('click', () => {
            this.debugElement.remove();
        });
        
        document.body.appendChild(this.debugElement);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (this.debugElement) {
                this.debugElement.remove();
            }
        }, 10000);
    }
}

// Create global instance
window.responsiveConfig = new ResponsiveConfig(); 