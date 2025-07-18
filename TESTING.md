# Tower Defense Game Testing Guide

This document provides instructions for running automated tests for the Tower Defense Game using Playwright.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- The game should be running at `http://localhost:5173`

## Installation

1. Install Playwright and its dependencies:
```bash
npm install
npm run test:install
```

This will install Playwright and the required browser binaries.

## Running Tests

### Basic Test Execution

Run all tests:
```bash
npm test
```

### Test Options

- **Headed mode** (see browser while tests run):
```bash
npm run test:headed
```

- **UI mode** (interactive test runner):
```bash
npm run test:ui
```

- **Debug mode** (step through tests):
```bash
npm run test:debug
```

- **View test report**:
```bash
npm run test:report
```

### Running Specific Tests

Run tests in a specific file:
```bash
npx playwright test tower-defense-game.spec.js
```

Run tests with a specific name:
```bash
npx playwright test -g "Game loads successfully"
```

Run tests in a specific browser:
```bash
npx playwright test --project=chromium
```

## Test Structure

The test suite is organized into several categories:

### Core Game Tests
- **Game Loading**: Verifies the game loads correctly
- **Initial State**: Checks initial health, money, and wave values
- **UI Elements**: Validates all UI components are present
- **Tower Placement**: Tests tower selection and placement mechanics
- **Wave Management**: Tests wave starting and progression
- **Game Controls**: Tests pause/resume, speed controls, auto-start

### Gameplay Tests
- **Tower Functionality**: Tests tower upgrades, selling, and combat
- **Money Management**: Tests cost calculations and insufficient funds
- **Wave Progression**: Tests multiple waves and difficulty scaling
- **Game Over**: Tests game over conditions and restart functionality

### Performance Tests
- **Memory Usage**: Tests game stability during extended gameplay
- **UI Responsiveness**: Tests rapid interactions and system stability
- **Load Testing**: Tests game performance with many towers and enemies

### Accessibility Tests
- **Keyboard Navigation**: Tests keyboard accessibility
- **Screen Reader**: Tests screen reader compatibility

## Test Configuration

The tests are configured in `playwright.config.js` with the following features:

- **Multiple Browsers**: Tests run on Chromium, Firefox, WebKit, and mobile browsers
- **Screenshots**: Automatic screenshots on test failures
- **Video Recording**: Video capture on test failures
- **Trace Collection**: Detailed traces for debugging failed tests
- **Parallel Execution**: Tests run in parallel for faster execution
- **Retry Logic**: Failed tests are retried on CI

## Test Reports

After running tests, you can view detailed reports:

1. **HTML Report**: Open `playwright-report/index.html` in your browser
2. **JSON Report**: Check `test-results/results.json` for programmatic access
3. **JUnit Report**: Check `test-results/results.xml` for CI integration

## Continuous Integration

The test configuration includes CI-specific settings:

- Tests run in headless mode on CI
- Failed tests are retried twice
- Parallel execution is limited to prevent resource issues
- Detailed reporting for CI systems

## Debugging Tests

### Using Debug Mode
```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through tests line by line
- Inspect page state at each step
- Modify test actions in real-time

### Using UI Mode
```bash
npm run test:ui
```

This opens Playwright UI where you can:
- Run tests interactively
- See live browser actions
- Debug specific test cases

### Viewing Traces
When tests fail, traces are automatically generated. View them with:
```bash
npx playwright show-trace trace.zip
```

## Writing New Tests

To add new tests:

1. Create a new test file in the `tests/` directory
2. Follow the existing test structure and naming conventions
3. Use descriptive test names that explain what is being tested
4. Include appropriate assertions and error handling
5. Add the test to the appropriate test suite

### Test Example
```javascript
test('New feature works correctly', async ({ page }) => {
  // Navigate to the game
  await page.goto('http://localhost:5173');
  
  // Perform actions
  await page.click('text=Some Button');
  
  // Verify results
  await expect(page.locator('text=Expected Result')).toBeVisible();
});
```

## Common Issues and Solutions

### Game Not Loading
- Ensure the development server is running: `npm run dev`
- Check that the game is accessible at `http://localhost:5173`
- Verify all assets are loading correctly

### Tests Timing Out
- Increase timeout values in test configuration
- Add explicit waits for game initialization
- Check for slow network conditions

### Flaky Tests
- Add explicit waits for UI elements
- Use more specific selectors
- Avoid timing-dependent assertions

### Browser Issues
- Reinstall browser binaries: `npm run test:install`
- Check browser compatibility
- Update Playwright to latest version

## Performance Testing

For performance testing, consider:

- Running tests with different browser configurations
- Testing on various device sizes
- Monitoring memory usage during extended gameplay
- Testing with different network conditions

## Security Testing

Consider adding tests for:

- Input validation
- XSS prevention
- CSRF protection
- Secure communication

## Contributing

When contributing to the test suite:

1. Follow existing code style and conventions
2. Add appropriate comments and documentation
3. Ensure tests are reliable and not flaky
4. Update this documentation when adding new test features
5. Include both positive and negative test cases 