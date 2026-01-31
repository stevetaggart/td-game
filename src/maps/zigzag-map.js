// Zig-Zag Map Configuration
const ZigZagMap = {
    id: 'zigzag',
    name: 'Zig-Zag Map',
    description: 'A sharp back-and-forth path that rewards corner coverage',
    pathImage: '/assets/maps/zigzag-map.svg',
    
    // Path coordinates for enemy movement (matching the SVG path)
    path: [
        { x: 0, y: 140 },
        { x: 180, y: 140 },
        { x: 260, y: 300 },
        { x: 220, y: 600 },
        { x: 420, y: 620 },
        { x: 520, y: 420 },
        { x: 460, y: 200 },
        { x: 700, y: 180 },
        { x: 820, y: 360 },
        { x: 760, y: 660 },
        { x: 1000, y: 640 },
        { x: 1200, y: 540 }
    ],
    
    // Map-specific settings
    settings: {
        // Longer lanes with frequent turns
        difficulty: 'medium',
        pathLength: 'long'
    }
};

// Export for use in other files
export default ZigZagMap;
