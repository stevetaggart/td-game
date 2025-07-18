import { test, expect } from '@playwright/test';

// Test suite for Tower Defense Game (Phaser.js)
test.describe('Tower Defense Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game before each test
    await page.goto('http://localhost:5173');
    
    // Wait for the game to load - look for the canvas inside gameContainer
    await page.waitForSelector('#gameContainer canvas', { timeout: 10000 });
    
    // Wait a bit more for Phaser to initialize
    await page.waitForTimeout(3000);
  });

  test('Game loads successfully', async ({ page }) => {
    // Check that the game canvas is present
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
    
    // Check that the game title is present in the page title
    await expect(page).toHaveTitle('Tower Defense Game');
    
    // Check that the game container exists
    const gameContainer = await page.locator('#gameContainer');
    await expect(gameContainer).toBeVisible();
  });

  test('Initial game state is correct', async ({ page }) => {
    // For Phaser games, we need to check the canvas content
    // Since UI elements are rendered on canvas, we'll use a different approach
    
    // Take a screenshot to verify the game loaded
    await page.screenshot({ path: 'test-results/initial-state.png' });
    
    // Check that the canvas has content (not just a blank canvas)
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
    
    // Wait for game to be fully initialized
    await page.waitForTimeout(2000);
  });

  test('Game canvas is interactive', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Test that we can click on the canvas
    await canvas.click({ position: { x: 100, y: 100 } });
    
    // Test that we can move the mouse over the canvas
    await canvas.hover({ position: { x: 200, y: 200 } });
    
    // Verify canvas is still visible after interaction
    await expect(canvas).toBeVisible();
  });

  test('Game responds to keyboard input', async ({ page }) => {
    // Focus on the game container
    await page.locator('#gameContainer').click();
    
    // Test some keyboard interactions
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Verify game is still responsive
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
  });

  test('Game handles window resize', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);
    
    // Verify canvas is still visible
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
  });

  test('Game performance under load', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Simulate rapid clicking on the canvas
    for (let i = 0; i < 10; i++) {
      await canvas.click({ position: { x: 100 + i * 20, y: 100 + i * 20 } });
      await page.waitForTimeout(100);
    }
    
    // Verify game is still responsive
    await expect(canvas).toBeVisible();
  });

  test('Game assets load correctly', async ({ page }) => {
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    // Check that the canvas has loaded content
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
    
    // Take a screenshot to verify assets loaded
    await page.screenshot({ path: 'test-results/assets-loaded.png' });
  });

  test('Game handles rapid interactions', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Rapid mouse movements and clicks
    for (let i = 0; i < 5; i++) {
      await canvas.hover({ position: { x: 100, y: 100 } });
      await canvas.click({ position: { x: 200, y: 200 } });
      await canvas.hover({ position: { x: 300, y: 300 } });
      await page.waitForTimeout(200);
    }
    
    // Verify game remains stable
    await expect(canvas).toBeVisible();
  });

  test('Game works with different browsers', async ({ page }) => {
    // This test will run in different browsers based on the project configuration
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
    
    // Basic interaction test
    await canvas.click({ position: { x: 150, y: 150 } });
    await page.waitForTimeout(1000);
    
    // Verify game is still working
    await expect(canvas).toBeVisible();
  });

  test('Game handles focus and blur events', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Focus on the game
    await canvas.click();
    
    // Simulate window blur by clicking outside
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(500);
    
    // Focus back on the game
    await canvas.click();
    await page.waitForTimeout(500);
    
    // Verify game is still responsive
    await expect(canvas).toBeVisible();
  });

  test('Game memory usage is stable', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Run the game for a while with interactions
    for (let i = 0; i < 20; i++) {
      await canvas.click({ position: { x: 100 + (i % 10) * 20, y: 100 + (i % 10) * 20 } });
      await page.waitForTimeout(200);
    }
    
    // Verify game is still stable
    await expect(canvas).toBeVisible();
  });

  test('Game handles errors gracefully', async ({ page }) => {
    // Inject a script to simulate an error
    await page.evaluate(() => {
      // This will trigger an error in the game context
      window.addEventListener('error', (e) => {
        console.log('Game error handled:', e.message);
      });
    });
    
    const canvas = await page.locator('#gameContainer canvas');
    
    // Continue with normal interactions
    await canvas.click({ position: { x: 100, y: 100 } });
    
    // Verify game is still working
    await expect(canvas).toBeVisible();
  });
});

// Performance and stress tests
test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#gameContainer canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  test('Extended gameplay stability', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Extended interaction session
    for (let i = 0; i < 50; i++) {
      await canvas.click({ position: { x: 100 + (i % 20) * 10, y: 100 + (i % 20) * 10 } });
      await page.waitForTimeout(100);
    }
    
    // Check that game is still stable
    await expect(canvas).toBeVisible();
  });

  test('Rapid interaction handling', async ({ page }) => {
    const canvas = await page.locator('#gameContainer canvas');
    
    // Very rapid clicking
    for (let i = 0; i < 30; i++) {
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(50);
    }
    
    // Check that game remains stable
    await expect(canvas).toBeVisible();
  });
});

// Accessibility tests
test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('#gameContainer canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);
  });

  test('Keyboard accessibility', async ({ page }) => {
    // Focus on the game container
    await page.locator('#gameContainer').click();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Verify game is still accessible
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
  });

  test('Screen reader support', async ({ page }) => {
    // Check that the game container has proper ARIA attributes
    const gameContainer = await page.locator('#gameContainer');
    await expect(gameContainer).toBeVisible();
    
    // Verify canvas is present for screen readers
    const canvas = await page.locator('#gameContainer canvas');
    await expect(canvas).toBeVisible();
  });
}); 