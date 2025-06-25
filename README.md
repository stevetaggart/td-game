# Tower Defense Game

A browser-based tower defense game built with Phaser.js.

## How to Play

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd td_game
   ```

2. **Start the server in a terminal:**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open the game:**
   - Open your browser and navigate to `http://localhost:8000`
   - Click on `tower_defense_game.html`

## Game Controls

- **Place Towers:** Click on a tower type in the bottom panel, then click on the game area to place it
- **Select Towers:** Click on an existing tower to select it
- **Upgrade Towers:** Select a tower and click the "Upgrade" button
- **Start Wave:** Click the "Start Wave" button to begin enemy spawning

## Tower Types

- **Basic Tower ($20):** Balanced damage and range
- **Rapid Fire ($40):** Fast firing, lower damage
- **Cannon ($60):** High damage, slow firing, long range

## Objective

Defend against waves of enemies by strategically placing and upgrading towers. Don't let enemies reach the end of the path!

## Features

- Multiple tower types with different strategies
- Wave-based progression with increasing difficulty
- Tower upgrade system
- Visual effects and animations 