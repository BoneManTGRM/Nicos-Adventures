import { expect, test } from '@playwright/test';
import { focusNavigationHeading } from '../src/app/navigationFocus';

test('deferred heading focus preserves a user-selected control in the new destination', async ({ page }) => {
  // Real DOM focus with no server or network. Exercise the exact application callback.
  await page.setContent('<button id="old-nav">Previous navigation</button><main id="main-content"><h1 id="page-title" tabindex="-1">Art Studio</h1><input aria-label="Title"><textarea aria-label="Caption"></textarea><button id="new-action">New action</button><h2 id="jump-target" tabindex="-1">Tools</h2></main>');
  await page.locator('#old-nav').focus();
  await page.evaluate(focusNavigationHeading);
  await expect(page.locator('#page-title')).toBeFocused();
  for (const selector of ['input', 'textarea', '#new-action', '#jump-target']) {
    await page.locator(selector).focus();
    // The user can focus/type while a double-animation-frame callback is still queued.
    await page.evaluate(focusNavigationHeading);
    await expect(page.locator(selector)).toBeFocused();
  }
  await page.getByLabel('Title', { exact: true }).fill('My unfinished picture');
  await page.evaluate(focusNavigationHeading);
  await expect(page.getByLabel('Title', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('My unfinished picture');
});
