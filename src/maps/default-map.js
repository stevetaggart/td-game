// Default Map Configuration
const DefaultMap = {
    name: 'Default Map',
    description: 'The original tower defense map',
    pathImage: '/assets/maps/enemy_path_no_bg.svg',
    
    // SVG path data for smooth enemy movement 
    svgPathData: 'M 0 400 L 200 400 L 200 200 L 400 200 L 400 500 L 600 500 L 600 300 L 800 300 L 800 400 L 1000 400 L 1000 200 L 1200 200',
    
    // Fallback path coordinates for compatibility
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