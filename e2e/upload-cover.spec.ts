import path from "node:path";
import { test, expect } from "@playwright/test";

test.describe("Cover image upload (Vercel Blob)", () => {
  test("uploads a JPG and stores the Blob URL in the form preview", async ({
    page,
  }) => {
    await page.goto("/creer");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(process.cwd(), "public/logo.jpg")
    );

    const preview = page.locator('img[alt="Aperçu de l\'illustration"]');
    await expect(preview).toBeVisible({ timeout: 30_000 });

    const src = await preview.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toMatch(
      /^https:\/\/[^.]+\.public\.blob\.vercel-storage\.com\/party-cover\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/
    );
  });

  test("rejects an SVG with embedded script (anti-XSS guard)", async ({
    page,
  }) => {
    await page.goto("/creer");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "evil.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script></svg>'
      ),
    });

    await expect(
      page.getByText(/Format non supporté/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("rejects a non-image file even if MIME claims image/jpeg", async ({
    page,
  }) => {
    await page.goto("/creer");

    const fileInput = page.locator('input[type="file"]');
    // Plain text bytes, but client lies and claims image/jpeg.
    // Magic byte detection on the server should catch this.
    await fileInput.setInputFiles({
      name: "fake.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("not actually an image, just text"),
    });

    await expect(
      page.getByText(/Format non supporté/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});
