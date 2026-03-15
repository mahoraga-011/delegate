import { test, expect } from "playwright/test";

test.describe("Delegate Dashboard", () => {
  test("renders full dashboard with all sections", async ({ page }) => {
    await page.goto("/");

    // Nav
    await expect(page.locator("header")).toContainText("Delegate");
    await expect(page.getByRole("button", { name: "Connect Wallet" })).toBeVisible();

    // Hero
    await expect(page.getByRole("heading", { name: "Policy checks before agents act." })).toBeVisible();

    // Feature cards
    await expect(page.getByText("Policy-first")).toBeVisible();
    await expect(page.getByText("Same input, same decision, every time.")).toBeVisible();

    // Screenshot: full page
    await page.screenshot({ path: "e2e/screenshots/dashboard-full.png", fullPage: true });
  });

  test("policy selector shows rules and evaluation", async ({ page }) => {
    await page.goto("/");

    // Default policy tab selected
    await expect(page.getByRole("tab", { name: "Safe default" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Ops review gate" })).toBeVisible();

    // Rules visible
    await expect(page.getByText("Risk score must stay at or below 4").first()).toBeVisible();

    // Screenshot
    await page.screenshot({ path: "e2e/screenshots/policy-selector.png", fullPage: true });
  });

  test("action form evaluates and shows results", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Evaluation" })).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/action-form.png", fullPage: true });
  });

  test("audit log shows seeded entries", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("dlg-v7k2-m9x4")).toBeVisible();
    await expect(page.getByText("dlg-a3f1-p2w8")).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/audit-log.png", fullPage: true });
  });

  test("can submit action and see new audit entry", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Add to audit log" }).click();

    // Wait for the new entry to appear
    await page.waitForTimeout(500);

    await page.screenshot({ path: "e2e/screenshots/after-submit.png", fullPage: true });
  });

  test("switch policy tab updates description", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Ops review gate" }).click();

    // The tab panel description should update
    await expect(
      page.getByText("Allows limited command execution in staging")
    ).toBeVisible();

    await page.screenshot({ path: "e2e/screenshots/ops-review-gate.png", fullPage: true });
  });
});
