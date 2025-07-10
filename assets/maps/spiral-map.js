// Spiral Map Configuration
const SpiralMap = {
    name: 'Spiral Map',
    description: 'A winding path with alternating high and low sections',
    pathImage: 'assets/maps/spiral-map.svg',
    
    // Path coordinates for enemy movement (matching the SVG path)
    path: [
        { x: 0, y: 400 },
        { x: 200, y: 400 },
        { x: 200, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 600 },
        { x: 600, y: 600 },
        { x: 600, y: 150 },
        { x: 800, y: 150 },
        { x: 800, y: 650 },
        { x: 1000, y: 650 },
        { x: 1000, y: 300 },
        { x: 1200, y: 300 }
    ],
    
    // Map-specific settings
    settings: {
        // This map has a moderate challenge with a non-intersecting path
        // Provides good strategic placement opportunities
        difficulty: 'medium',
        pathLength: 'moderate'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpiralMap;
} 