import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { parties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PartyPoster } from "@/lib/pdf/party-poster";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 401 });
  }

  // Fetch party and verify admin token
  const party = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
  });

  if (!party) {
    return NextResponse.json({ error: "Fête non trouvée" }, { status: 404 });
  }

  if (party.adminToken !== token) {
    return NextResponse.json({ error: "Token invalide" }, { status: 403 });
  }

  // Generate QR code
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://voisinons.fr";
  const partyUrl = `${appUrl}/${party.slug}`;
  const qrCodeDataUrl = await QRCode.toDataURL(partyUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#3D3D3D",
      light: "#FFFFFF",
    },
  });

  // Extract time from dateStart and dateEnd using date-fns for consistency
  const timeStart = format(party.dateStart, "HH:mm", { locale: fr });
  const timeEnd = party.dateEnd
    ? format(party.dateEnd, "HH:mm", { locale: fr })
    : null;

  try {
    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <PartyPoster
        name={party.name}
        date={party.dateStart}
        timeStart={timeStart}
        timeEnd={timeEnd}
        address={party.address}
        slug={party.slug}
        description={party.description}
        qrCodeDataUrl={qrCodeDataUrl}
      />
    );

    // Return PDF as Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="affiche-${party.slug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
