/**
 * E2E Tests: Keyboard Rendering
 * Tests that keyboard labels are displayed in the correct positions
 */
import { test, expect } from '@playwright/test';

test.describe('Keyboard Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Standard 60% layout should have correct key labels in correct positions', async ({ page }) => {
    // Navigate to settings
    await page.keyboard.press('?');
    await page.locator('.command-menu-input').fill('settings');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-view="settings"]')).toBeVisible();
    
    // Select Standard 60% layout
    const layoutSelect = page.locator('select[name="layout"]');
    await layoutSelect.selectOption({ label: /Standard 60%/i });
    
    // Wait for keyboard to render
    await expect(page.locator('.keyboard-svg')).toBeVisible();
    await page.waitForTimeout(500);
    
    // Get all key text elements
    const keyTexts = await page.locator('.keyboard-svg text.key-label').allTextContents();
    
    // Standard 60% should have these keys in order (first row)
    // We expect tab, q, w, e, r, t, y, u, i, o, p
    expect(keyTexts).toContain('tab');
    expect(keyTexts).toContain('q');
    expect(keyTexts).toContain('w');
    expect(keyTexts).toContain('e');
    
    // Check that 'q' comes after 'tab' (not at wrong position)
    const tabIndex = keyTexts.indexOf('tab');
    const qIndex = keyTexts.indexOf('q');
    expect(qIndex).toBeGreaterThan(tabIndex);
  });

  test('Ergodox layout should have correct key labels in correct positions', async ({ page }) => {
    // Navigate to settings
    await page.keyboard.press('?');
    await page.locator('.command-menu-input').fill('settings');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-view="settings"]')).toBeVisible();
    
    // Select Ergodox layout
    const layoutSelect = page.locator('select[name="layout"]');
    await layoutSelect.selectOption({ label: /Ergodox/i });
    
    // Wait for keyboard to render
    await expect(page.locator('.keyboard-svg')).toBeVisible();
    await page.waitForTimeout(500);
    
    // Get all key text elements
    const keyTexts = await page.locator('.keyboard-svg text.key-label').allTextContents();
    
    // Ergodox top row should start with: =, 1, 2, 3, 4, 5 (left) then 6, 7, 8, 9, 0, - (right)
    const equalIndex = keyTexts.indexOf('=');
    const oneIndex = keyTexts.indexOf('1');
    const twoIndex = keyTexts.indexOf('2');
    
    console.log('Ergodox key labels:', keyTexts.slice(0, 20));
    
    // '1' should come after '='
    expect(oneIndex).toBeGreaterThan(equalIndex);
    // '2' should come after '1'
    expect(twoIndex).toBeGreaterThan(oneIndex);
  });

  test('Corne layout should have correct key labels in correct positions', async ({ page }) => {
    // Navigate to settings
    await page.keyboard.press('?');
    await page.locator('.command-menu-input').fill('settings');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-view="settings"]')).toBeVisible();
    
    // Select Corne layout
    const layoutSelect = page.locator('select[name="layout"]');
    await layoutSelect.selectOption({ label: /Corne.*Colemak-DH/i });
    
    // Wait for keyboard to render
    await expect(page.locator('.keyboard-svg')).toBeVisible();
    await page.waitForTimeout(500);
    
    // Get all key text elements
    const keyTexts = await page.locator('.keyboard-svg text.key-label').allTextContents();
    
    // Corne Colemak-DH top row should be: q w f p b (left) j l u y ; (right)
    const qIndex = keyTexts.indexOf('q');
    const wIndex = keyTexts.indexOf('w');
    const fIndex = keyTexts.indexOf('f');
    
    console.log('Corne key labels:', keyTexts.slice(0, 20));
    
    // Should be in order: q, w, f
    expect(wIndex).toBeGreaterThan(qIndex);
    expect(fIndex).toBeGreaterThan(wIndex);
  });

  test('Custom layout with gaps should render keys in correct positions', async ({ page }) => {
    // Navigate to layout editor
    await page.keyboard.press('?');
    await page.locator('.command-menu-input').fill('editor');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-view="layout-editor"]')).toBeVisible();
    
    // Create a simple test layout with gaps
    const layoutDef = `[layout:test-gaps]
rows: 2
columns: 5,5
split: true

row0: ¦ a ¦ b ¦ | ¦ c ¦ d ¦
row1: e f g h i | j k l m n

fingers:
row0: . 1 . 2 . | . 6 . 7 .
row1: 1 2 3 4 4 | 5 5 6 7 8`;
    
    const textarea = page.locator('textarea[name="layout-definition"]');
    await textarea.fill(layoutDef);
    
    // Save the layout
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(500);
    
    // Wait for keyboard preview to render
    await expect(page.locator('.keyboard-svg')).toBeVisible();
    
    // Get all key text elements
    const keyTexts = await page.locator('.keyboard-svg text.key-label').allTextContents();
    
    console.log('Custom layout key labels:', keyTexts);
    
    // Should have keys: a, b, c, d, e, f, g, h, i, j, k, l, m, n (14 keys total, no gaps)
    expect(keyTexts).toHaveLength(14);
    expect(keyTexts).toContain('a');
    expect(keyTexts).toContain('b');
    expect(keyTexts).toContain('c');
    expect(keyTexts).toContain('d');
    
    // Check ordering: a should come before b
    const aIndex = keyTexts.indexOf('a');
    const bIndex = keyTexts.indexOf('b');
    expect(bIndex).toBeGreaterThan(aIndex);
    
    // e should come before f
    const eIndex = keyTexts.indexOf('e');
    const fIndex = keyTexts.indexOf('f');
    expect(fIndex).toBeGreaterThan(eIndex);
  });
});
