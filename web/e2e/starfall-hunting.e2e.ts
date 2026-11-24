import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block", locale: "en-US" });

test("a touch hunt requires a separate net cast, saves the trophy, and returns to fishing", async ({ page }) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/games/starfall-anglers/#hunting");
  await expect(page.getByRole("heading",{name:"Starfall Hunting"})).toBeVisible();
  await page.getByRole("button",{name:"Moon Stag",exact:true}).click();
  await expect(page.getByRole("button",{name:"Track Moon Stag"})).toBeDisabled();
  await page.getByRole("button",{name:"Red Fox",exact:true}).click();
  await page.getByRole("button",{name:"Track Red Fox"}).click();
  const clue=await page.locator(".trail-sequence").innerText();
  const order=clue.match(/Leaf|Moon|Star/g)!;
  expect(order).toHaveLength(2);
  for(const mark of order) await page.getByRole("button",{name:mark,exact:true}).click();

  await expect(page.locator(".trail-hunt")).toHaveAttribute("data-phase","chase");
  const cast=page.getByRole("button",{name:"Cast star net"});
  await expect(cast).toBeEnabled();
  await cast.click();
  await expect(page.getByText("Tagged & released",{exact:true})).toBeVisible();
  await page.reload();
  const journal=page.locator(".trail-journal");
  await expect(journal.locator("summary")).toContainText("1/9");
  await journal.locator("summary").click();
  await expect(journal.locator(".trail-record").filter({hasText:"Red Fox"})).toContainText("Tags 1 · Best 100/100");
  await page.getByRole("button",{name:"Close",exact:true}).click();
  await expect(page.getByRole("button",{name:"Cast line",exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/games\/starfall-anglers\/$/);
});
