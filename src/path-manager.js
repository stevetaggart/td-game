// Path Manager Class for smooth enemy movement
class PathManager {
    constructor() {
        this.precomputedPaths = new Map();
    }

    // Load and precompute path from SVG path data
    async loadPathFromSVG(mapName, svgPathData) {
        try {
            // Validate input
            if (!svgPathData || typeof svgPathData !== 'string') {
                throw new Error(`Invalid SVG path data: ${svgPathData}`);
            }
            
            console.log('Loading SVG path data:', svgPathData);
            
            // Dynamic import to handle potential bundling issues
            const svgPathPropertiesModule = await import('svg-path-properties');
            console.log('svgPathPropertiesModule:', svgPathPropertiesModule);
            
            // Create path properties instance
            let pathProps;
            if (typeof svgPathPropertiesModule.svgPathProperties === 'function') {
                pathProps = svgPathPropertiesModule.svgPathProperties(svgPathData);
            } else if (typeof svgPathPropertiesModule.default === 'function') {
                pathProps = svgPathPropertiesModule.default(svgPathData);
            } else {
                throw new Error('svg-path-properties not properly imported. Available: ' + Object.keys(svgPathPropertiesModule));
            }
            const totalLength = pathProps.getTotalLength();
            
            // Precompute path points for smooth movement
            const pathPoints = this.precomputePath(pathProps, totalLength);
            
            // Store precomputed path
            this.precomputedPaths.set(mapName, {
                points: pathPoints,
                totalLength: totalLength,
                pathProps: pathProps
            });
            
            return pathPoints;
        } catch (error) {
            console.error('Error loading SVG path:', error);
            console.error('SVG path data that caused error:', svgPathData);
            console.error('Map name:', mapName);
            
            // Fallback: use simple linear interpolation for basic paths
            console.log('Attempting fallback linear interpolation...');
            try {
                const pathPoints = this.createLinearFallbackPath(svgPathData);
                if (pathPoints && pathPoints.length > 0) {
                    const totalLength = this.calculatePathLength(pathPoints);
                    this.precomputedPaths.set(mapName, {
                        points: pathPoints,
                        totalLength: totalLength,
                        pathProps: null // No svg-path-properties object
                    });
                    console.log('Fallback path created successfully');
                    return pathPoints;
                }
            } catch (fallbackError) {
                console.error('Fallback path creation also failed:', fallbackError);
            }
            
            return null;
        }
    }

    // Precompute path points at regular intervals
    precomputePath(pathProps, totalLength) {
        const points = [];
        const resolution = 2; // Points every 2 pixels for smooth movement
        
        for (let distance = 0; distance <= totalLength; distance += resolution) {
            const point = pathProps.getPointAtLength(distance);
            const tangent = pathProps.getTangentAtLength(distance);
            
            points.push({
                x: point.x,
                y: point.y,
                angle: Math.atan2(tangent.y, tangent.x),
                distance: distance,
                progress: distance / totalLength
            });
        }
        
        return points;
    }

    // Get precomputed path for a specific map
    getPath(mapName) {
        return this.precomputedPaths.get(mapName);
    }

    // Get position at specific distance along path
    getPositionAtDistance(mapName, distance) {
        const pathData = this.precomputedPaths.get(mapName);
        if (!pathData) return null;
        
        const index = Math.floor(distance / 2); // Resolution is 2 pixels
        const point = pathData.points[index];
        
        if (!point) {
            // Return last point if we've gone past the end
            return pathData.points[pathData.points.length - 1];
        }
        
        return point;
    }

    // Get total path length for a map
    getPathLength(mapName) {
        const pathData = this.precomputedPaths.get(mapName);
        return pathData ? pathData.totalLength : 0;
    }

    // Extract SVG path data from SVG file content
    extractPathData(svgContent) {
        try {
            // Parse SVG content to extract path data
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            
            // Find the main path element (first one, as that's typically the enemy path)
            const pathElement = svgDoc.querySelector('path');
            if (pathElement) {
                return pathElement.getAttribute('d');
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting path data from SVG:', error);
            return null;
        }
    }

    // Load SVG file and extract path data
    async loadSVGFile(svgFilePath) {
        try {
            const response = await fetch(svgFilePath);
            const svgContent = await response.text();
            return this.extractPathData(svgContent);
        } catch (error) {
            console.error('Error loading SVG file:', error);
            return null;
        }
    }

    // Fallback method: create linear path from simple SVG commands
    createLinearFallbackPath(svgPathData) {
        console.log('Creating fallback path for:', svgPathData);
        const points = [];
        const commands = this.parseSVGPathCommands(svgPathData);
        console.log('Parsed commands:', commands);
        
        let currentX = 0;
        let currentY = 0;
        let distance = 0;
        const resolution = 2;
        
        for (const command of commands) {
            if (command.type === 'M' || command.type === 'L') {
                const targetX = command.x;
                const targetY = command.y;
                
                if (command.type === 'M') {
                    // Move to command - just update position
                    currentX = targetX;
                    currentY = targetY;
                    points.push({
                        x: currentX,
                        y: currentY,
                        angle: 0,
                        distance: distance,
                        progress: 0
                    });
                } else {
                    // Line to command - interpolate points
                    const dx = targetX - currentX;
                    const dy = targetY - currentY;
                    const segmentLength = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);
                    
                    for (let d = 0; d <= segmentLength; d += resolution) {
                        const t = d / segmentLength;
                        const x = currentX + dx * t;
                        const y = currentY + dy * t;
                        
                        points.push({
                            x: x,
                            y: y,
                            angle: angle,
                            distance: distance + d,
                            progress: 0 // Will be calculated later
                        });
                    }
                    
                    distance += segmentLength;
                    currentX = targetX;
                    currentY = targetY;
                }
            }
        }
        
        // Calculate progress for each point
        const totalLength = distance;
        points.forEach(point => {
            point.progress = point.distance / totalLength;
        });
        
        return points;
    }

    // Simple SVG path command parser for M and L commands
    parseSVGPathCommands(pathData) {
        const commands = [];
        const regex = /([ML])\s*([^ML]*)/g;
        let match;
        
        while ((match = regex.exec(pathData)) !== null) {
            const type = match[1];
            const coords = match[2].trim().split(/[\s,]+/).map(Number);
            
            for (let i = 0; i < coords.length; i += 2) {
                if (i + 1 < coords.length) {
                    commands.push({
                        type: type,
                        x: coords[i],
                        y: coords[i + 1]
                    });
                }
                // After first coordinate pair, M becomes L
                if (type === 'M') type = 'L';
            }
        }
        
        return commands;
    }

    // Calculate total path length from points
    calculatePathLength(points) {
        if (points.length === 0) return 0;
        return points[points.length - 1].distance;
    }
}

// Smooth Path Follower Class for enemy movement
class SmoothPathFollower {
    constructor(enemy, pathManager, mapName) {
        this.enemy = enemy;
        this.pathManager = pathManager;
        this.mapName = mapName;
        this.currentDistance = 0;
        this.totalLength = pathManager.getPathLength(mapName);
        this.isComplete = false;
    }

    // Update enemy position along the smooth path
    update(delta) {
        if (this.isComplete) return false;

        // Calculate movement distance based on enemy speed
        const moveDistance = (this.enemy.speed * delta) / 1000;
        this.currentDistance += moveDistance;

        // Check if enemy has reached the end
        if (this.currentDistance >= this.totalLength) {
            this.isComplete = true;
            // Enemy reached the end - damage player
            this.enemy.scene.health -= this.enemy.damageToPlayer;
            if (this.enemy.scene && this.enemy.scene.uiManager && this.enemy.scene.uiManager.updateUI) {
                this.enemy.scene.uiManager.updateUI();
            }
            this.enemy.destroy();
            return false;
        }

        // Get position at current distance
        const position = this.pathManager.getPositionAtDistance(this.mapName, this.currentDistance);
        if (position) {
            this.enemy.x = position.x;
            this.enemy.y = position.y;
            // Only set rotation if we have a valid angle
            if (typeof position.angle === 'number' && !isNaN(position.angle)) {
                this.enemy.rotation = position.angle;
            }
        }

        return true;
    }

    // Get current progress along the path (0 to 1)
    getProgress() {
        return this.currentDistance / this.totalLength;
    }

    // Get current distance along the path
    getDistance() {
        return this.currentDistance;
    }
}

export { PathManager, SmoothPathFollower };