import { env } from "@/lib/env";

// Single source of truth for outbound links (emails, PDF QR codes, sitemap).
// Reading process.env directly here used to shadow the validated value with a
// different fallback.
export const SITE_URL = env.NEXT_PUBLIC_APP_URL;
