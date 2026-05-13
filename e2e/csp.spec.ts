import { test, expect } from '@playwright/test';

test.describe('CSP headers', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__E2E_AUTH__ = {
        isAuthenticated: true,
      };
      localStorage.setItem('ga_consent', 'granted');
    });
  });

  test('serves CSP meta tag with required security directives', async ({
    page,
  }) => {
    await page.goto('/');

    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(cspMeta).toBeAttached();

    const content = await cspMeta.getAttribute('content');
    expect(content).toBeTruthy();
    const policy = content!;

    // Required security directives
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("font-src 'self'");

    // Hardened GA domain (not wildcard)
    expect(policy).toContain('https://www.google-analytics.com');
    expect(policy).not.toContain('https://*.google-analytics.com');

    // Sensitive directives
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("worker-src 'self'");
  });

  test('home page renders without CSP violations', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        msg.text().includes('Content-Security-Policy')
      ) {
        violations.push(msg.text());
      }
    });

    await page.goto('/');

    // Give CSP violation reports a moment to appear
    await page.waitForTimeout(500);

    if (violations.length > 0) {
      console.log('CSP violations detected:', violations);
    }
    // We don't fail on violations since the dev server may load
    // third-party scripts that aren't yet in the CSP. Instead,
    // log them for manual review.
    expect(violations).toHaveLength(0);
  });
});
