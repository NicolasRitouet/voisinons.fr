"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { parties, participants, partyUpdates, discussionChannels, needs } from "@/lib/db/schema";
import { sendPartyCreatedEmail } from "@/lib/email";
import {
  createPartySchema,
  updatePartyDetailsSchema,
  type CreatePartyInput,
  type UpdatePartyDetailsInput,
} from "@/lib/validations/party";
import {
  createChannelSchema,
  updateChannelSchema,
  deleteChannelSchema,
  type CreateChannelInput,
  type UpdateChannelInput,
  type DeleteChannelInput,
} from "@/lib/validations/channel";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { generateToken } from "@/lib/crypto";
import { defaultNeedCategories } from "@/lib/needs";
import { setAdminSessionCookie } from "@/lib/auth/admin-session";

const VERCEL_BLOB_HOST = ".public.blob.vercel-storage.com";

export async function createParty(data: CreatePartyInput) {
  const validated = createPartySchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const {
    slug,
    date,
    timeStart,
    timeEnd,
    latitude,
    longitude,
    coverImageUrl,
    ...rest
  } = validated.data;

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
          coverImageUrl: coverImageUrl || null,
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

      // Seed default bring categories
      await tx.insert(needs).values(
        defaultNeedCategories.map((category) => ({
          partyId: newParty.id,
          category: category.category,
          description: category.label,
        }))
      );

      return newParty;
    });

    // Set the admin session cookie so the creator can navigate to the admin
    // dashboard without the token in the URL.
    await setAdminSessionCookie(party.slug, party.adminToken);

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

// React.cache() deduplicates this query within a single request
// (e.g., when called from both generateMetadata and Page component)
export const getPartyBySlug = cache(async (slug: string) => {
  return db.query.parties.findFirst({
    where: eq(parties.slug, slug),
    with: {
      participants: true,
      needs: {
        orderBy: (needs, { asc }) => [asc(needs.createdAt)],
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
});

export async function getPartyForAdmin(slug: string, token: string) {
  const party = await db.query.parties.findFirst({
    where: eq(parties.slug, slug),
    with: {
      participants: true,
      needs: {
        orderBy: (needs, { asc }) => [asc(needs.createdAt)],
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
  // Verify admin token - only fetch needed columns
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    columns: { id: true, adminToken: true },
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

export async function updatePartyDetails(data: UpdatePartyDetailsInput) {
  const validated = updatePartyDetailsSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const {
    partyId,
    token,
    date,
    timeStart,
    timeEnd,
    address,
    latitude,
    longitude,
    coverImageUrl,
  } = validated.data;

  // Fetch columns needed for auth validation + the previous cover image
  // so we can clean up the old blob if it gets replaced.
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    columns: { id: true, adminToken: true, coverImageUrl: true },
  });

  if (!party || party.adminToken !== token) {
    return { success: false as const, error: { _form: ["Non autorisé"] } };
  }

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

  try {
    await db
      .update(parties)
      .set({
        address,
        dateStart,
        dateEnd,
        latitude: latitude?.toString() ?? null,
        longitude: longitude?.toString() ?? null,
        coverImageUrl: coverImageUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(parties.id, partyId));

    const previousCover = party.coverImageUrl;
    if (
      previousCover &&
      previousCover !== coverImageUrl &&
      previousCover.includes(VERCEL_BLOB_HOST)
    ) {
      await del(previousCover).catch((err) => {
        console.warn("Failed to delete previous cover blob:", err);
      });
    }

    return { success: true as const };
  } catch (error) {
    console.error("Failed to update party details:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de la mise à jour"] },
    };
  }
}

export async function createDiscussionChannel(data: CreateChannelInput) {
  const validated = createChannelSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { partyId, token, type, name, url } = validated.data;

  // Only fetch columns needed for auth validation
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    columns: { id: true, adminToken: true },
  });

  if (!party || party.adminToken !== token) {
    return { success: false as const, error: { _form: ["Non autorisé"] } };
  }

  try {
    await db.insert(discussionChannels).values({
      partyId,
      type,
      name,
      url,
    });

    return { success: true as const };
  } catch (error) {
    console.error("Failed to create discussion channel:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de l'ajout du canal"] },
    };
  }
}

export async function updateDiscussionChannel(data: UpdateChannelInput) {
  const validated = updateChannelSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { channelId, token, type, name, url } = validated.data;

  // Fetch channel with its party relation in a single query
  const channel = await db.query.discussionChannels.findFirst({
    where: eq(discussionChannels.id, channelId),
    with: {
      party: true,
    },
  });

  if (!channel) {
    return { success: false as const, error: { _form: ["Canal introuvable"] } };
  }

  if (!channel.party || channel.party.adminToken !== token) {
    return { success: false as const, error: { _form: ["Non autorisé"] } };
  }

  try {
    await db
      .update(discussionChannels)
      .set({
        type,
        name,
        url,
      })
      .where(eq(discussionChannels.id, channelId));

    return { success: true as const };
  } catch (error) {
    console.error("Failed to update discussion channel:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de la mise à jour"] },
    };
  }
}

export async function deleteDiscussionChannel(data: DeleteChannelInput) {
  const validated = deleteChannelSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { channelId, token } = validated.data;

  // Fetch channel with its party relation in a single query
  const channel = await db.query.discussionChannels.findFirst({
    where: eq(discussionChannels.id, channelId),
    with: {
      party: true,
    },
  });

  if (!channel) {
    return { success: false as const, error: { _form: ["Canal introuvable"] } };
  }

  if (!channel.party || channel.party.adminToken !== token) {
    return { success: false as const, error: { _form: ["Non autorisé"] } };
  }

  try {
    await db.delete(discussionChannels).where(eq(discussionChannels.id, channelId));
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete discussion channel:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de la suppression"] },
    };
  }
}
