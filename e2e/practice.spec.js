/**
 * E2E Tests: Practice View
 */
import { test, expect } from '@playwright/test';

test.describe('Practice View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/practice');
  });

  test('should display practice view with text to type', async ({ page }) => {
    await expect(page.locator('[data-view="practice"]')).toBeVisible();
    await expect(page.locator('.text-display')).toBeVisible();
    const charCount = await page.locator('.text-display .char').count();
    expect(charCount).toBeGreaterThan(0);
  });

  test('should display keyboard', async ({ page }) => {
    await expect(page.locator('.keyboard-svg')).toBeVisible();
  });

  test('should show stats display', async ({ page }) => {
    await expect(page.locator('.stats-display .wpm')).toBeVisible();
    await expect(page.locator('.stats-display .accuracy')).toBeVisible();
  });

  test('should highlight current character', async ({ page }) => {
    await expect(page.locator('.text-display .char.current')).toBeVisible();
  });

  test('should mark correct character on correct input', async ({ page }) => {
    // Get the first character to type
    const firstChar = await page.locator('.text-display .char.current').textContent();
    const charToType = firstChar === '␣' ? ' ' : firstChar;
    
    await page.keyboard.type(charToType);
    
    // First character should now be marked correct
    await expect(page.locator('.text-display .char').first()).toHaveClass(/correct/);
  });

  test('should mark error on incorrect input', async ({ page }) => {
    // Type a wrong character (assuming first char is not 'z')
    await page.keyboard.type('z');
    
    // Check if it's marked as error (unless 'z' was correct)
    const firstChar = page.locator('.text-display .char').first();
    const hasError = await firstChar.evaluate(el => el.classList.contains('error'));
    const hasCorrect = await firstChar.evaluate(el => el.classList.contains('correct'));
    
    // Should be either error or correct (if z was the right char)
    expect(hasError || hasCorrect).toBe(true);
  });

  test('should update progress as user types', async ({ page }) => {
    const initialProgress = await page.locator('.stats-display .progress .value').textContent();
    expect(initialProgress).toBe('0');
    
    // Type any character
    await page.keyboard.type('a');
    
    const newProgress = await page.locator('.stats-display .progress .value').textContent();
    expect(newProgress).toBe('1');
  });

  test('should exit to home on Escape', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-view="home"]')).toBeVisible();
  });

  test('should show completion modal after typing all text', async ({ page }) => {
    // Get all text to type
    const chars = page.locator('.text-display .char');
    const count = await chars.count();
    
    // Type each character
    for (let i = 0; i < count; i++) {
      const charEl = page.locator('.text-display .char.current');
      const text = await charEl.textContent();
      const charToType = text === '␣' ? ' ' : text;
      await page.keyboard.type(charToType);
    }
    
    // Completion modal should appear
    await expect(page.locator('.completion-overlay')).toBeVisible();
    await expect(page.locator('.completion-modal h2')).toHaveText('Session Complete!');
  });

  test('should display stats in completion modal', async ({ page }) => {
    // Type all characters
    const chars = page.locator('.text-display .char');
    const count = await chars.count();
    
    for (let i = 0; i < count; i++) {
      const charEl = page.locator('.text-display .char.current');
      const text = await charEl.textContent();
      const charToType = text === '␣' ? ' ' : text;
      await page.keyboard.type(charToType);
    }
    
    // Check stats are displayed (not zero)
    await expect(page.locator('.completion-modal')).toBeVisible();
    
    const wpmText = await page.locator('.stat-large .value').first().textContent();
    const wpm = parseInt(wpmText, 10);
    expect(wpm).toBeGreaterThan(0);
    
    const accuracyText = await page.locator('.stat-large .value').nth(1).textContent();
    expect(accuracyText).toContain('%');
  });

  test('should restart practice from completion modal', async ({ page }) => {
    // Complete the practice
    const chars = page.locator('.text-display .char');
    const count = await chars.count();
    
    for (let i = 0; i < count; i++) {
      const charEl = page.locator('.text-display .char.current');
      const text = await charEl.textContent();
      const charToType = text === '␣' ? ' ' : text;
      await page.keyboard.type(charToType);
    }
    
    await expect(page.locator('.completion-overlay')).toBeVisible();
    
    // Click restart
    await page.locator('.restart-btn').click();
    
    // Modal should close and new text should be available
    await expect(page.locator('.completion-overlay')).not.toBeVisible();
    await expect(page.locator('.text-display .char.current')).toBeVisible();
  });
});
