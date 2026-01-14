"use server";

import { db } from "@/lib/db";
import { parties, participants, partyUpdates } from "@/lib/db/schema";
import { sendPartyCreatedEmail } from "@/lib/email";
import { createPartySchema, type CreatePartyInput } from "@/lib/validations/party";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createParty(data: CreatePartyInput) {
  const validated = createPartySchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { slug, date, timeStart, timeEnd, latitude, longitude, ...rest } = validated.data;

  // Combine date + time into dateStart and dateEnd
  const dateOnly = new Date(date);
  const [startHours, startMinutes] = timeStart.split(":").map(Number);
  const dateStart = new Date(dateOnly);
  dateStart.setHours(startHours, startMinutes, 0, 0);

  let dateEnd: Date | null = null;
  if (timeEnd && timeEnd !== "") {
    const [endHours, endMinutes] = timeEnd.split(":").map(Number);
    dateEnd = new Date(dateOnly);
    dateEnd.setHours(endHours, endMinutes, 0, 0);
  }

  // Check if slug is already taken
  const existing = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
  });

  if (existing) {
    return {
      success: false as const,
      error: { slug: ["Ce slug est déjà utilisé"] },
    };
  }

  const adminToken = generateToken();

  try {
    // Use transaction to ensure atomicity
    const party = await db.transaction(async (tx) => {
      const [newParty] = await tx
        .insert(parties)
        .values({
          slug,
          dateStart,
          dateEnd,
          latitude: latitude?.toString() ?? null,
          longitude: longitude?.toString() ?? null,
          adminToken,
          ...rest,
        })
        .returning();

      // Create the organizer as the first participant
      await tx.insert(participants).values({
        partyId: newParty.id,
        name: rest.organizerName,
        email: rest.organizerEmail,
        isOrganizer: true,
      });

      return newParty;
    });

    // Send confirmation email (awaited to ensure Vercel doesn't kill the function)
    try {
      await sendPartyCreatedEmail({
        to: rest.organizerEmail,
        organizerName: rest.organizerName,
        partyName: rest.name,
        partySlug: party.slug,
        adminToken: party.adminToken,
        partyDate: dateStart,
        partyAddress: rest.address,
      });
    } catch (err) {
      // Log but don't block party creation
      console.error("Failed to send confirmation email:", err);
    }

    return {
      success: true as const,
      party: {
        slug: party.slug,
        adminToken: party.adminToken,
      },
    };
  } catch (error) {
    console.error("Failed to create party:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const existing = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
  });
  return !existing;
}

export async function getPartyBySlug(slug: string) {
  return db.query.parties.findFirst({
    where: eq(parties.slug, slug),
    with: {
      participants: true,
      needs: {
        with: {
          contributions: {
            with: {
              participant: true,
            },
          },
        },
      },
      discussionChannels: true,
      updates: {
        orderBy: (updates, { desc }) => [desc(updates.createdAt)],
      },
    },
  });
}

export async function getPartyForAdmin(slug: string, token: string) {
  const party = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
    with: {
      participants: true,
      needs: {
        with: {
          contributions: {
            with: {
              participant: true,
            },
          },
        },
      },
      discussionChannels: true,
      updates: {
        orderBy: (updates, { desc }) => [desc(updates.createdAt)],
      },
    },
  });

  if (!party || party.adminToken !== token) {
    return null;
  }

  return party;
}

export async function createPartyUpdate(partyId: string, token: string, content: string) {
  // Verify admin token
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
  });

  if (!party || party.adminToken !== token) {
    return { success: false as const, error: "Non autorisé" };
  }

  try {
    await db.insert(partyUpdates).values({
      partyId,
      content,
    });

    return { success: true as const };
  } catch (error) {
    console.error("Failed to create update:", error);
    return { success: false as const, error: "Erreur lors de la publication" };
  }
}
