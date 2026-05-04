import { test, expect } from '@playwright/test';

test.describe('Home screen', () => {
  test.beforeEach(async ({ page }) => {
    // Enable auth bypass to show the authenticated home screen
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__E2E_AUTH__ = {
        isAuthenticated: true,
      };
    });
  });

  test('renders the app title', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Workout Mate');
  });

  test('displays empty state when no workouts exist', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/no workouts yet/i).first()).toBeVisible();
  });

  test('has a create workout button', async ({ page }) => {
    await page.goto('/');

    const createButton = page.getByRole('button', { name: /create/i });
    await expect(createButton).toBeVisible();
  });

  test('clicking create workout navigates to workout edit', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /create/i }).click();

    await expect(page).toHaveURL(/\/#\/workout\/new/);
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__E2E_AUTH__ = {
        isAuthenticated: true,
      };
    });
  });

  test('privacy route renders', async ({ page }) => {
    await page.goto('/#/privacy');

    await expect(page.locator('h1')).toContainText(/privacy/i);
  });

  test('terms route renders', async ({ page }) => {
    await page.goto('/#/terms');

    await expect(page.locator('h1')).toContainText(/terms/i);
  });
});
