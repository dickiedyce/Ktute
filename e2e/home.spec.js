/**
 * E2E Tests: Home View
 */
import { test, expect } from '@playwright/test';

test.describe('Home View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page with title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Ktute');
    await expect(page.locator('.subtitle')).toHaveText('Keyboard Typing Tutor');
  });

  test('should display keyboard preview', async ({ page }) => {
    await expect(page.locator('.keyboard-container')).toBeVisible();
    await expect(page.locator('.keyboard-svg')).toBeVisible();
  });

  test('should show command menu on / key', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('.command-menu-overlay')).toBeVisible();
    await expect(page.locator('.command-menu-input')).toBeFocused();
  });

  test('should close command menu on Escape', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('.command-menu-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.command-menu-overlay')).not.toBeVisible();
  });

  test('should navigate to practice via command menu', async ({ page }) => {
    await page.keyboard.press('/');
    await page.locator('.command-menu-input').fill('practice');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-view="practice"]')).toBeVisible();
  });
});
