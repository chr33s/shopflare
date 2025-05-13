import { expect, test } from "@playwright/test";

test("loads", async ({ page }) => {
	await page.goto("/apps/shopflare");
	await expect(page).toHaveTitle(/ShopFlare/);
	await expect(page.getByRole("heading", { name: "Ops!" })).toBeVisible();
});
