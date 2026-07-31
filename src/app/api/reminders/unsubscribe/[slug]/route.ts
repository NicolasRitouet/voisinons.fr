import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * One-click opt-out from organizer reminders.
 *
 * The admin token already travels in every reminder email, so it doubles as
 * the unsubscribe credential — no second token scheme to keep in sync. Anyone
 * holding it can already administer the party.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = request.nextUrl.searchParams.get("token");

  const party = await requireAdmin({ slug }, token);
  if (!party) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 403 });
  }

  await db
    .update(parties)
    .set({ reminderOptOut: true })
    .where(eq(parties.id, party.id));

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Relances désactivées</title>
<meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; color: #3D3D3D; line-height: 1.6;">
  <h1 style="font-size: 22px;">C'est noté</h1>
  <p>Vous ne recevrez plus de rappel pour cette fête. Les emails liés à vos inscriptions continuent d'arriver normalement.</p>
  <p><a href="/${encodeURIComponent(slug)}" style="color: #E86E3A;">Revenir à la page de la fête</a></p>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    }
  );
}
