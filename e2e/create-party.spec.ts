import { test, expect } from "@playwright/test";

test.describe("Create Party Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/creer");
  });

  test.describe("Create Party Page", () => {
    test("should display create party form", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Créer");

      // Check form fields exist by label
      await expect(page.getByLabel("Votre nom")).toBeVisible();
      await expect(page.getByLabel("Votre email")).toBeVisible();
      await expect(page.getByPlaceholder("Commencez à taper une adresse")).toBeVisible();
    });

    test("should have submit button", async ({ page }) => {
      const submitButton = page.locator("button[type='submit']");
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toContainText("Créer");
    });
  });

  test.describe("Form Interactions", () => {
    test("should show place type selector", async ({ page }) => {
      // Check that place type label exists
      await expect(page.getByText("Type de lieu")).toBeVisible();
    });

    test("should allow date selection", async ({ page }) => {
      // Check date picker is present
      const dateInput = page.locator("button").filter({ hasText: /mai|juin|juillet/i }).first();
      await expect(dateInput).toBeVisible();
    });

    test("should allow time selection", async ({ page }) => {
      // Check time inputs are present
      await expect(page.getByText("Heure de début")).toBeVisible();
    });

    test("should fill organizer fields", async ({ page }) => {
      // Fill organizer info using labels
      await page.getByLabel("Votre nom").fill("Jean Dupont");
      await page.getByLabel("Votre email").fill("jean@example.com");

      // Verify values
      await expect(page.getByLabel("Votre nom")).toHaveValue("Jean Dupont");
      await expect(page.getByLabel("Votre email")).toHaveValue("jean@example.com");
    });
  });

  test.describe("Navigation", () => {
    test("should be accessible from landing page", async ({ page }) => {
      await page.goto("/");

      // Click on create button
      await page.locator("a[href='/creer']").first().click();

      await expect(page).toHaveURL("/creer");
      await expect(page.locator("h1")).toContainText("Créer");
    });

    test("should have back navigation to home", async ({ page }) => {
      // Check logo links back to home
      const logo = page.locator("a[href='/']").first();
      await expect(logo).toBeVisible();

      await logo.click();
      await expect(page).toHaveURL("/");
    });
  });
});

test.describe("Party Page (Public View)", () => {
  // These tests assume a party exists - in a real setup, you'd seed the database
  // For now, we just test that the route structure works

  test("should show 404 for non-existent party", async ({ page }) => {
    await page.goto("/non-existent-party-slug-12345");

    // Should show not found page
    await expect(page.locator("body")).toContainText(/not found|introuvable|404/i);
  });
});
