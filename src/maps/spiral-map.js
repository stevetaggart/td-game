// Spiral Map Configuration
const SpiralMap = {
    name: 'Spiral Map',
    description: 'A winding path with alternating high and low sections',
    pathImage: '/assets/maps/spiral-map.svg',
    
    // SVG path data for smooth enemy movement
    svgPathData: 'M 0 400 L 200 400 L 200 200 L 400 200 L 400 600 L 600 600 L 600 150 L 800 150 L 800 650 L 1000 650 L 1000 300 L 1200 300',
    
    // Fallback path coordinates for compatibility
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