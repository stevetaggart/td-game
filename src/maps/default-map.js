// Default Map Configuration
const DefaultMap = {
    name: 'Default Map',
    description: 'The original tower defense map',
    pathImage: '/assets/maps/enemy_path_no_bg.svg',
    
    // SVG path data for smooth enemy movement with curves
    svgPathData: 'M 0 400 C 100 400 100 400 200 400 C 200 300 200 300 200 200 C 300 200 300 200 400 200 C 400 350 400 350 400 500 C 500 500 500 500 600 500 C 600 425 600 425 600 300 C 700 300 700 300 800 300 C 800 350 800 350 800 400 C 900 400 900 400 1000 400 C 1000 300 1000 300 1000 200 C 1100 200 1100 200 1200 200',
    
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