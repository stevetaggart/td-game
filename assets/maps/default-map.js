// Default Map Configuration
const DefaultMap = {
    name: 'Default Map',
    description: 'The original tower defense map',
    pathImage: 'assets/maps/enemy_path_no_bg.svg',
    
    // Path coordinates for enemy movement
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
    ],
    
    // Map-specific settings
    settings: {
        // Any map-specific configurations can go here
        // For now, using default game settings
    }
};

// Export for use in other files
export default DefaultMap; 