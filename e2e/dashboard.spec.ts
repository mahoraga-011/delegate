import { test, expect, type Page } from "playwright/test";

test.setTimeout(60000);

async function clickNavTab(page: Page, name: string) {
  await page.evaluate((n) => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b) => b.textContent?.trim() === n);
    btn?.click();
  }, name);
  await page.waitForTimeout(500);
}

test.describe("Evaluate Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
  });

  test("renders dashboard with hero and tabs", async ({ page }) => {
    await expect(page.locator("header")).toContainText("Delegate");
    await expect(page.getByRole("heading", { name: "Policy checks before agents act." })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/dashboard-full.png", fullPage: true });
  });

  test("policy selector shows rules", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Safe default" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Ops review gate" })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/policy-selector.png", fullPage: true });
  });

  test("evaluation shows allow for safe request", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Evaluation" })).toBeVisible();
    await expect(page.getByText("allow").first()).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/action-form.png", fullPage: true });
  });

  test("audit log shows seeded entries", async ({ page }) => {
    await expect(page.getByText("dlg-v7k2-m9x4")).toBeVisible();
    await expect(page.getByText("dlg-a3f1-p2w8")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/audit-log.png", fullPage: true });
  });

  test("submit adds new audit entry", async ({ page }) => {
    await page.getByRole("button", { name: "Add to audit log" }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/after-submit.png", fullPage: true });
  });

  test("switch policy updates description", async ({ page }) => {
    await page.getByRole("tab", { name: "Ops review gate" }).click();
    await expect(page.getByText("denies elevated risk")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/ops-review-gate.png", fullPage: true });
  });

  test("changing fields updates evaluation", async ({ page }) => {
    await page.locator("#actionType").fill("execute");
    await page.locator("#tool").fill("exec");
    await page.locator("#target").fill("prod-server");
    await expect(page.getByText("deny").first()).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/deny-evaluation.png", fullPage: true });
  });
});

test.describe("Theme Tabs — No Wallet", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
  });

  test("Trust tab", async ({ page }) => {
    await clickNavTab(page, "Trust");
    await expect(page.getByText("Connect wallet to access Trust features")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/trust-tab-no-wallet.png", fullPage: true });
  });

  test("Cooperate tab", async ({ page }) => {
    await clickNavTab(page, "Cooperate");
    await expect(page.getByText("Connect wallet to access Cooperate features")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/cooperate-tab-no-wallet.png", fullPage: true });
  });

  test("Pay tab", async ({ page }) => {
    await clickNavTab(page, "Pay");
    await expect(page.getByText("Connect wallet to access Pay features")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/pay-tab-no-wallet.png", fullPage: true });
  });
});

test.describe("With Wallet", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const ANVIL_URL = "http://127.0.0.1:8545";
      const ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      let rid = 0;
      (window as any).ethereum = {
        isMetaMask: true,
        _e: {} as Record<string, Function[]>,
        on(ev: string, fn: Function) { ((this._e[ev] ??= []) as Function[]).push(fn); return this; },
        removeListener(ev: string, fn: Function) { this._e[ev] = (this._e[ev] || []).filter((f: Function) => f !== fn); return this; },
        emit(ev: string, ...a: unknown[]) { (this._e[ev] || []).forEach((f: Function) => f(...a)); },
        async request({ method, params }: { method: string; params?: unknown[] }) {
          if (method === "eth_requestAccounts" || method === "eth_accounts") return [ACCOUNT];
          if (method === "eth_chainId") return "0x7a69";
          if (method === "net_version") return "31337";
          if (method === "wallet_switchEthereumChain") return null;
          const r = await fetch(ANVIL_URL, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: ++rid, method, params: params || [] }),
          });
          const j = await r.json();
          if (j.error) throw new Error(j.error.message);
          return j.result;
        },
      };
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Try connecting
    const connected = await page.getByText("0xf39F").isVisible().catch(() => false);
    if (!connected) {
      const btn = page.getByRole("button", { name: "Connect Wallet" });
      const enabled = await btn.isEnabled().catch(() => false);
      if (enabled) await btn.click();
      await expect(page.getByText("0xf39F")).toBeVisible({ timeout: 15000 });
    }
  });

  test("wallet connected", async ({ page }) => {
    await expect(page.getByText("0xf39F")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/wallet-connected.png", fullPage: true });
  });

  test("Trust tab with wallet", async ({ page }) => {
    await clickNavTab(page, "Trust");
    await expect(page.getByText("Agent Identity Registry")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/trust-tab-connected.png", fullPage: true });
  });

  test("Cooperate tab with wallet", async ({ page }) => {
    await clickNavTab(page, "Cooperate");
    await expect(page.getByText("Bilateral Agreements")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/cooperate-tab-connected.png", fullPage: true });
  });

  test("Pay tab with wallet", async ({ page }) => {
    await clickNavTab(page, "Pay");
    await expect(page.getByText("Vault & Spending")).toBeVisible();
    await expect(page.getByText("Vault balance")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/pay-tab-connected.png", fullPage: true });
  });

  test("Verification visible", async ({ page }) => {
    await expect(page.getByText("Verify a decision")).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/verification-connected.png", fullPage: true });
  });

  test("attest on-chain", async ({ page }) => {
    await page.getByRole("button", { name: "Attest + log" }).click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: "e2e/screenshots/attested-decision.png", fullPage: true });
  });
});
