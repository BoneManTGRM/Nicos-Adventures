import { expect, type Locator } from '@playwright/test';

/** Test-only check: a visible image box is not proof that its bytes have loaded. */
export async function expectImageReady(image: Locator, options: { timeout?: number } = {}) {
  await expect.poll(
    () => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    { message: 'Image must finish loading with positive intrinsic width', ...options },
  ).toBe(true);
}
