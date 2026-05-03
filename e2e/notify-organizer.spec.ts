import { test, expect } from "@playwright/test";

test.describe("Organizer notification toggle", () => {
  test("is visible on /creer and OFF by default", async ({ page }) => {
    await page.goto("/creer");

    // Locate the toggle by its label
    const label = page.getByText("Me notifier des nouvelles inscriptions");
    await expect(label).toBeVisible();

    // The Switch is a sibling within the same FormItem; find it via role
    const toggle = page.getByRole("switch", {
      name: "Me notifier des nouvelles inscriptions",
    });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  test("activated toggle persists in DB and is shown checked on the admin page", async ({
    page,
  }) => {
    const slug = `e2e-notify-${Date.now()}`;
    const organizerEmail = `e2e-notify-${Date.now()}@example.test`;

    await page.goto("/creer");

    await page
      .getByPlaceholder("Commencez à taper une adresse")
      .fill("12 rue de la Paix, 75001 Paris");
    await page.waitForTimeout(500);

    const slugInput = page.locator('input[name="slug"]');
    await slugInput.fill(slug);

    await page.getByLabel("Votre nom").fill("E2E Organizer");
    await page.getByLabel("Votre email").fill(organizerEmail);

    const notifyToggle = page.getByRole("switch", {
      name: "Me notifier des nouvelles inscriptions",
    });
    await notifyToggle.click();
    await expect(notifyToggle).toHaveAttribute("aria-checked", "true");

    await page.getByRole("button", { name: /Créer ma fête/i }).click();
    await expect(page.locator("body")).toContainText(slug, { timeout: 15_000 });

    // createParty has set the httpOnly admin cookie. Hitting /admin reuses it.
    await page.goto(`/${slug}/admin`);

    // The admin form is hidden behind an "edit" trigger; open it.
    await page.getByRole("button", { name: /Modifier/i }).click();

    const adminToggle = page.getByRole("switch", {
      name: "Me notifier des nouvelles inscriptions",
    });
    await expect(adminToggle).toBeVisible();
    await expect(adminToggle).toHaveAttribute("aria-checked", "true");
  });
});
