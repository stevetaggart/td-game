# Tower Defense Game

A browser-based tower defense game built with Phaser.js.

## How to Play

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd td-game
   ```

2. **Start the server in a terminal:**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open the game:**
   - Open your browser and navigate to `http://localhost:8000`

## Game Controls

- **Place Towers:** Click on a tower type in the bottom panel, then click on the game area to place it
- **Select Towers:** Click on an existing tower to select it
- **Upgrade Towers:** Select a tower and click the "Upgrade" button
- **Sell Towers:** Select a tower and click the "Sell" button to remove it and get 70% of the money spent back
- **Start Wave:** Click the "Start Wave" button to begin enemy spawning
- **Pause/Resume:** During a wave, click the pause button (⏸) to pause the game, or play button (▶️) to resume
- **Speed Control:** During a wave, click the "2x" button to speed up the game, or "1x" to return to normal speed

## Tower Types

- **Basic Tower ($20):** Balanced damage and range
- **Rapid Fire ($40):** Fast firing, lower damage
- **Cannon ($60):** High damage, slow firing, long range
- **Multishot ($100):** Fires multiple projectiles in a spread pattern, great for crowd control

## Objective

Defend against waves of enemies by strategically placing and upgrading towers. Don't let enemies reach the end of the path!

## Features

- Multiple tower types with different strategies
- Wave-based progression with increasing difficulty
- Tower upgrade system
- Tower selling system (70% refund of total cost)
- Pause and resume functionality
- 2x game speed option during waves
- Visual effects and animations 