// Maps Configuration for Tower Defense Game
const MapsConfig = {
    // Map 1: Classic Path (original path)
    classic: {
        id: 'classic',
        name: 'Classic Route',
        description: 'The original tower defense path',
        thumbnail: 'assets/maps/classic_thumbnail.png',
        backgroundAsset: 'assets/enemy_path_no_bg.svg',
        difficulty: 'Easy',
        path: [
            { x: 0, y: 400 },
            { x: 200, y: 400 },
            { x: 200, y: 200 },
            { x: 400, y: 200 },
            { x: 400, y: 500 },
            { x: 600, y: 500 },
            { x: 600, y: 300 },
            { x: 800, y: 300 },
            { x: 800, y: 400 },
            { x: 1000, y: 400 },
            { x: 1000, y: 200 },
            { x: 1200, y: 200 }
        ]
    },

    // Map 2: Serpentine Path
    serpentine: {
        id: 'serpentine',
        name: 'Serpentine Valley',
        description: 'A winding path through the valley',
        thumbnail: 'assets/maps/serpentine_thumbnail.png',
        backgroundAsset: 'assets/maps/serpentine_path.svg',
        difficulty: 'Medium',
        path: [
            { x: 0, y: 300 },
            { x: 150, y: 300 },
            { x: 150, y: 150 },
            { x: 300, y: 150 },
            { x: 300, y: 450 },
            { x: 450, y: 450 },
            { x: 450, y: 200 },
            { x: 600, y: 200 },
            { x: 600, y: 500 },
            { x: 750, y: 500 },
            { x: 750, y: 250 },
            { x: 900, y: 250 },
            { x: 900, y: 400 },
            { x: 1200, y: 400 }
        ]
    },

    // Map 3: Spiral Path
    spiral: {
        id: 'spiral',
        name: 'Spiral Fortress',
        description: 'Enemies spiral inward to the center',
        thumbnail: 'assets/maps/spiral_thumbnail.png',
        backgroundAsset: 'assets/maps/spiral_path.svg',
        difficulty: 'Hard',
        path: [
            { x: 0, y: 600 },
            { x: 1000, y: 600 },
            { x: 1000, y: 150 },
            { x: 200, y: 150 },
            { x: 200, y: 450 },
            { x: 800, y: 450 },
            { x: 800, y: 300 },
            { x: 400, y: 300 },
            { x: 400, y: 350 },
            { x: 600, y: 350 },
            { x: 600, y: 375 }
        ]
    },

    // Map 4: Cross Roads
    crossroads: {
        id: 'crossroads',
        name: 'Cross Roads',
        description: 'Multiple paths converge at the center',
        thumbnail: 'assets/maps/crossroads_thumbnail.png',
        backgroundAsset: 'assets/maps/crossroads_path.svg',
        difficulty: 'Expert',
        path: [
            { x: 0, y: 200 },
            { x: 400, y: 200 },
            { x: 400, y: 400 },
            { x: 200, y: 400 },
            { x: 200, y: 600 },
            { x: 600, y: 600 },
            { x: 600, y: 300 },
            { x: 800, y: 300 },
            { x: 800, y: 500 },
            { x: 1000, y: 500 },
            { x: 1000, y: 100 },
            { x: 1200, y: 100 }
        ]
    }
};

// Helper functions
const MapUtils = {
    // Get all available maps
    getAllMaps() {
        return Object.values(MapsConfig);
    },

    // Get map by ID
    getMapById(id) {
        return MapsConfig[id] || null;
    },

    // Get map names for UI
    getMapNames() {
        return Object.keys(MapsConfig);
    },

    // Validate if a map exists
    isValidMap(id) {
        return id in MapsConfig;
    },

    // Get scaled path for responsive design
    getScaledPath(mapId, responsiveConfig) {
        const map = this.getMapById(mapId);
        if (!map) return [];

        if (responsiveConfig && responsiveConfig.IS_MOBILE) {
            // For mobile: scale and center path within available game area
            const gameAreaWidth = responsiveConfig.GAME_AREA_RIGHT - responsiveConfig.GAME_AREA_LEFT;
            const gameAreaHeight = responsiveConfig.GAME_AREA_BOTTOM - responsiveConfig.GAME_AREA_TOP;
            
            // Calculate scale to fit path within available game area
            const pathScale = Math.min(
                (gameAreaWidth * 0.9) / 1200, // 1200 is original path width
                (gameAreaHeight * 0.9) / 600,  // Approximate original path height
                responsiveConfig.SCALE
            );

            // Calculate offsets to center the path in the game area
            const offsetX = (responsiveConfig.gameAreaLeft || 0) + (gameAreaWidth - 1200 * pathScale) / 2;
            const offsetY = responsiveConfig.gameAreaTop + (gameAreaHeight - 600 * pathScale) / 2;

            return map.path.map(point => ({
                x: offsetX + point.x * pathScale,
                y: offsetY + point.y * pathScale
            }));
        } else {
            return map.path.map(point => ({
                x: point.x * responsiveConfig.SCALE,
                y: point.y * responsiveConfig.SCALE
            }));
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapsConfig, MapUtils };
}

// Make globally accessible
if (typeof window !== 'undefined') {
    window.MapsConfig = MapsConfig;
    window.MapUtils = MapUtils;
}