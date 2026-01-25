import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("Navbar", () => {
    test("should display logo and navigation links on desktop", async ({ page }) => {
      // Check logo
      await expect(page.locator("nav")).toContainText("voisinons.fr");

      // Check desktop navigation links are visible
      const navLinks = page.locator("nav .hidden.md\\:flex a");
      await expect(navLinks.nth(0)).toContainText("Comment ça marche");
      await expect(navLinks.nth(1)).toContainText("Fonctionnalités");
      await expect(navLinks.nth(2)).toContainText("Confidentialité");

      // Check CTA button
      await expect(page.locator("nav a[href='/creer']")).toBeVisible();
    });

    test("should have working navigation links", async ({ page }) => {
      // Click on "Comment ça marche" link
      await page.locator("nav .hidden.md\\:flex a").first().click();
      await expect(page).toHaveURL(/#comment-ca-marche/);
    });

    test("should navigate to create page when clicking CTA", async ({ page }) => {
      await page.locator("nav a[href='/creer']").click();
      await expect(page).toHaveURL("/creer");
    });
  });

  test.describe("Hero Section", () => {
    test("should display main heading", async ({ page }) => {
      await expect(page.locator("h1, h2").first()).toContainText("Faites vibrer");
      await expect(page.locator("h1, h2").first()).toContainText("quartier");
    });

    test("should display CTA button", async ({ page }) => {
      // The main hero CTA button
      const ctaButton = page.locator("section a[href='/creer']").first();
      await expect(ctaButton).toBeVisible();
    });

    test("should display trust badges", async ({ page }) => {
      await expect(page.getByText("100% Gratuit", { exact: false })).toBeVisible();
      await expect(page.getByText("Respectueux RGPD")).toBeVisible();
    });
  });

  test.describe("How It Works Section", () => {
    test("should display how it works section", async ({ page }) => {
      // Scroll to section
      await page.locator("#comment-ca-marche").scrollIntoViewIfNeeded();
      await expect(page.locator("#comment-ca-marche")).toBeVisible();
    });
  });

  test.describe("CTA Section", () => {
    test("should display final CTA", async ({ page }) => {
      await page.locator("#creer").scrollIntoViewIfNeeded();

      await expect(page.locator("#creer")).toContainText("Bonjour");
      await expect(page.locator("#creer a[href='/creer']")).toBeVisible();
    });
  });

  test.describe("Footer", () => {
    test("should display footer with legal links", async ({ page }) => {
      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();

      await expect(footer).toContainText("Voisinons.fr");
      await expect(page.locator("a[href='/mentions-legales']")).toBeVisible();
      await expect(page.locator("a[href='/confidentialite']")).toBeVisible();
      await expect(page.locator("a[href='/cgu']")).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should show hamburger menu on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Hamburger button should be visible
      const hamburger = page.locator("nav button[aria-label='Menu']");
      await expect(hamburger).toBeVisible();

      // Desktop nav should be hidden
      const desktopNav = page.locator("nav .hidden.md\\:flex");
      await expect(desktopNav).not.toBeVisible();
    });

    test("should hide hamburger menu on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });

      // Hamburger should be hidden
      const hamburger = page.locator("nav button[aria-label='Menu']");
      await expect(hamburger).not.toBeVisible();

      // Desktop nav should be visible
      const desktopNav = page.locator("nav .hidden.md\\:flex");
      await expect(desktopNav).toBeVisible();
    });
  });
});
