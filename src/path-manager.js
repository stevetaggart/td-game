import { svgPathProperties } from 'svg-path-properties';

// Path Manager Class for smooth enemy movement
class PathManager {
    constructor() {
        this.precomputedPaths = new Map();
    }

    // Load and precompute path from SVG path data
    async loadPathFromSVG(mapName, svgPathData) {
        try {
            // Create path properties instance
            const pathProps = svgPathProperties(svgPathData);
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
            this.enemy.rotation = position.angle;
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