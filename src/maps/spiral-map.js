// Spiral Map Configuration
const SpiralMap = {
    name: 'Spiral Map',
    description: 'A winding path with alternating high and low sections',
    pathImage: '/assets/maps/spiral-map.svg',
    
    // Path coordinates for enemy movement (adjusted for narrower game area)
    path: [
        { x: 0, y: 400 },
        { x: 180, y: 400 },
        { x: 180, y: 200 },
        { x: 350, y: 200 },
        { x: 350, y: 600 },
        { x: 520, y: 600 },
        { x: 520, y: 150 },
        { x: 690, y: 150 },
        { x: 690, y: 650 },
        { x: 860, y: 650 },
        { x: 860, y: 300 },
        { x: 950, y: 300 }
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