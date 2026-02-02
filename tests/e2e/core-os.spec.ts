import { test, expect } from '@playwright/test';

test.describe('Core OS Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Boot sequence and Desktop interaction', async ({ page }) => {
    // Check if TopBar is visible
    await expect(page.locator('text=Activities')).toBeVisible();
    await expect(page.locator('text=KadirOS Desktop')).toBeVisible();

    // Check if Desktop Icon "Kadir_CV.pdf" is visible
    await expect(page.locator('text=Kadir_CV.pdf')).toBeVisible();
  });

  test('Window Management: Open, Drag, Close', async ({ page }) => {
    // Open CV app from desktop icon
    await page.locator('text=Kadir_CV.pdf').dblclick();

    // Verify window opened
    const windowHeader = page.getByTestId('window-header');
    await expect(windowHeader).toBeVisible();
    await expect(windowHeader).toContainText('Kadir Aydemir - CV');

    // Drag Window
    const initialBox = await windowHeader.boundingBox();
    if (!initialBox) throw new Error('Window header not found');

    await page.mouse.move(initialBox.x + 50, initialBox.y + 10);
    await page.mouse.down();
    await page.mouse.move(initialBox.x + 200, initialBox.y + 200, { steps: 10 });
    await page.mouse.up();

    const newBox = await windowHeader.boundingBox();
    expect(newBox?.x).toBeGreaterThan(initialBox.x);
    expect(newBox?.y).toBeGreaterThan(initialBox.y);

    // Close Window (red button)
    const closeButton = page.getByTestId('window-close');
    await closeButton.click();

    // Verify window is closed
    await expect(windowHeader).not.toBeVisible();
  });

  test('Applications Menu', async ({ page }) => {
    // Click Applications Grid icon (bottom of dock)
    // We target the DockItem that contains the text "Applications" (tooltip)
    // The tooltip is inside the DockItem div.
    const dockItem = page.locator('.relative.group', { has: page.locator('text=Applications') });

    // Click it
    await dockItem.click();

    // Check if menu opened (search input appears)
    const searchInput = page.locator('input[placeholder="Type to search..."]');
    await expect(searchInput).toBeVisible();

    // Close menu by clicking the backdrop (since it covers the dock)
    // Click near top-left (but below top bar) to avoid hitting the menu panel or top bar
    await page.locator('.fixed.inset-0').click({ position: { x: 10, y: 50 } });
    await expect(searchInput).not.toBeVisible();
  });
});
