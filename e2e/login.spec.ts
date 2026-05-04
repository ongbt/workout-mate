import { test, expect } from '@playwright/test';

test.describe('Login screen', () => {
  test.beforeEach(async ({ page }) => {
    // Disable auth bypass to show the login screen
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__E2E_AUTH__ = {
        isAuthenticated: false,
      };
    });
  });

  test('renders app title', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Workout Mate');
  });

  test('renders tagline', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/voice-guided timers/i)).toBeVisible();
  });

  test('has a sign in with Google button', async ({ page }) => {
    await page.goto('/');

    const signInButton = page.getByText(/sign in with google/i);
    await expect(signInButton).toBeVisible();
  });
});
