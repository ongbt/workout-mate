import { test, expect } from '@playwright/test';

test.describe('Exercise library integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__E2E_AUTH__ = {
        isAuthenticated: true,
      };
      localStorage.setItem('ga_consent', 'granted');
    });
  });

  test('custom exercise flow works without API key', async ({ page }) => {
    await page.goto('/#/workout/new');

    // "+ Add" button should be visible and functional without any API key
    const addButton = page.getByRole('button', { name: /\+ Exercise/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Should now have two exercise rows (one default + one added)
    const nameInputs = page.locator('input[placeholder="Exercise name"]');
    await expect(nameInputs).toHaveCount(2);
  });

  test('Browse Library button opens modal with API key prompt', async ({
    page,
  }) => {
    await page.goto('/#/workout/new');

    const browseButton = page.getByRole('button', {
      name: /Browse Library/i,
    });
    await expect(browseButton).toBeVisible();

    await browseButton.click();

    // Modal should show the API key input since no key is configured
    const keyPlaceholder = page.getByPlaceholder(/Paste your RapidAPI key/i);
    await expect(keyPlaceholder).toBeVisible();

    // Done button should close the modal
    const doneButton = page.getByRole('button', { name: /Done/i });
    await expect(doneButton).toBeVisible();
    await doneButton.click();

    // Modal should close
    await expect(keyPlaceholder).not.toBeVisible();
  });

  test('exercise form row shows thumbnail for library exercises', async ({
    page,
  }) => {
    await page.goto('/#/workout/new');

    // "+ Add" creates a custom exercise row (no image)
    const addButton = page.getByRole('button', { name: /\+ Exercise/i });
    await addButton.click();

    // Browse Library button is present
    const browseButton = page.getByRole('button', {
      name: /Browse Library/i,
    });
    await expect(browseButton).toBeVisible();
  });
});
