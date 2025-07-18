// Default Map Configuration
const DefaultMap = {
    name: 'Default Map',
    description: 'The original tower defense map',
    pathImage: '/assets/maps/enemy_path_no_bg.svg',
    
    // Path coordinates for enemy movement (adjusted for narrower game area)
    path: [
        { x: 0, y: 400 },
        { x: 180, y: 400 },
        { x: 180, y: 200 },
        { x: 350, y: 200 },
        { x: 350, y: 500 },
        { x: 520, y: 500 },
        { x: 520, y: 300 },
        { x: 690, y: 300 },
        { x: 690, y: 400 },
        { x: 860, y: 400 },
        { x: 860, y: 200 },
        { x: 950, y: 200 }
    ],
    
    // Map-specific settings
    settings: {
        // Any map-specific configurations can go here
        // For now, using default game settings
    }
};

// Export for use in other files
export default DefaultMap; 