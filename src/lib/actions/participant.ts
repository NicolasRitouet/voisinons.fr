"use server";

import { db } from "@/lib/db";
import { participants, parties } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/crypto";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  sendParticipantEditEmail,
  sendOrganizerNewParticipantEmail,
} from "@/lib/email";
import {
  joinPartySchema,
  updateParticipantSchema,
  adminUpdateOrganizerSchema,
  type JoinPartyInput,
  type UpdateParticipantInput,
  type AdminUpdateOrganizerInput,
  deleteParticipantSchema,
  type DeleteParticipantInput,
  adminDeleteParticipantSchema,
  type AdminDeleteParticipantInput,
} from "@/lib/validations/participant";

export async function joinParty(data: JoinPartyInput) {
  const validated = joinPartySchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.issues[0]?.message || "Données invalides",
    };
  }

  const editToken = generateToken();

  try {
    const [participant] = await db
      .insert(participants)
      .values({
        partyId: validated.data.partyId,
        editToken,
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        guestCount: validated.data.guestCount,
        bringing: validated.data.bringing,
        isOrganizer: false,
      })
      .returning({ id: participants.id });

    const party = await db.query.parties.findFirst({
      where: eq(parties.id, validated.data.partyId),
    });

    if (party) {
      const sends: Array<Promise<unknown>> = [];
      if (validated.data.email) {
        sends.push(
          sendParticipantEditEmail({
            to: validated.data.email,
            participantName: validated.data.name,
            partyName: party.name,
            partySlug: party.slug,
            editToken,
            partyDate: party.dateStart,
            partyAddress: party.address,
          })
        );
      }
      if (party.notifyOnNewParticipant && party.organizerEmail) {
        sends.push(
          sendOrganizerNewParticipantEmail({
            to: party.organizerEmail,
            organizerName: party.organizerName,
            partyName: party.name,
            partySlug: party.slug,
            adminToken: party.adminToken,
            participantName: validated.data.name,
            participantBringing: validated.data.bringing ?? null,
            participantGuestCount: validated.data.guestCount,
          })
        );
      }
      const results = await Promise.allSettled(sends);
      for (const r of results) {
        if (r.status === "rejected") {
          console.error("Failed to send participant/organizer email:", r.reason);
        }
      }
    }

    return { success: true as const, participantId: participant.id, editToken };
  } catch (error) {
    console.error("Failed to join party:", error);
    return {
      success: false as const,
      error: "Une erreur est survenue lors de l'inscription",
    };
  }
}

// Get participant by edit token. Only the editToken proves ownership of an
// RSVP; lookup by participant UUID alone is intentionally unsupported because
// Server Actions are publicly callable and a UUID is not a credential.
export async function getParticipantByToken(editToken: string) {
  try {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.editToken, editToken))
      .limit(1);

    return participant || null;
  } catch (error) {
    console.error("Failed to get participant by token:", error);
    return null;
  }
}

// RGPD right to erasure for a participant. Like updateParticipant, the
// editToken is the only credential that proves ownership of the RSVP.
export async function deleteParticipant(data: DeleteParticipantInput) {
  const validated = deleteParticipantSchema.safeParse(data);

  if (!validated.success) {
    return { success: false as const, error: "Données invalides" };
  }

  try {
    const [deleted] = await db
      .delete(participants)
      .where(eq(participants.editToken, validated.data.editToken))
      .returning({ id: participants.id, partyId: participants.partyId });

    if (!deleted) {
      return { success: false as const, error: "Participant non trouvé" };
    }

    const party = await db.query.parties.findFirst({
      where: eq(parties.id, deleted.partyId),
      columns: { slug: true },
    });
    if (party) {
      revalidatePath(`/${party.slug}`);
      revalidatePath(`/${party.slug}/participer`);
    }

    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete participant:", error);
    return {
      success: false as const,
      error: "Une erreur est survenue lors de la suppression",
    };
  }
}

export async function updateParticipant(data: UpdateParticipantInput) {
  const validated = updateParticipantSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.issues[0]?.message || "Données invalides",
    };
  }

  try {
    const [updated] = await db
      .update(participants)
      .set({
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        guestCount: validated.data.guestCount,
        bringing: validated.data.bringing,
      })
      .where(eq(participants.editToken, validated.data.editToken))
      .returning({ id: participants.id });

    if (!updated) {
      return {
        success: false as const,
        error: "Participant non trouvé",
      };
    }

    return { success: true as const };
  } catch (error) {
    console.error("Failed to update participant:", error);
    return {
      success: false as const,
      error: "Une erreur est survenue lors de la mise à jour",
    };
  }
}

// Update the organizer's own RSVP line from the admin dashboard. Unlike
// updateParticipant, this is authorized by the party's adminToken (the
// organizer has no editToken) and the WHERE clause is locked to
// isOrganizer = true so it can only ever touch the organizer's own row.
export async function adminUpdateOrganizerParticipant(
  data: AdminUpdateOrganizerInput
) {
  const validated = adminUpdateOrganizerSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.issues[0]?.message || "Données invalides",
    };
  }

  const { partyId, token, name, email, phone, guestCount, bringing } =
    validated.data;

  if (!(await requireAdmin({ partyId }, token))) {
    return { success: false as const, error: "Non autorisé" };
  }

  try {
    const [updated] = await db
      .update(participants)
      .set({ name, email, phone, guestCount, bringing })
      .where(
        and(
          eq(participants.partyId, partyId),
          eq(participants.isOrganizer, true)
        )
      )
      .returning({ id: participants.id });

    if (!updated) {
      return {
        success: false as const,
        error: "Participant organisateur non trouvé",
      };
    }

    return { success: true as const };
  } catch (error) {
    console.error("Failed to update organizer participant:", error);
    return {
      success: false as const,
      error: "Une erreur est survenue lors de la mise à jour",
    };
  }
}

// Remove someone else's RSVP from the admin dashboard. Authorized by the
// party's adminToken, and the WHERE clause carries the guarantees: partyId so
// an organizer can never reach another party's row, and isOrganizer = false so
// the organizer's own row -- the anchor adminUpdateOrganizerParticipant relies
// on -- can't be deleted from here.
export async function adminDeleteParticipant(
  data: AdminDeleteParticipantInput
) {
  const validated = adminDeleteParticipantSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.issues[0]?.message || "Données invalides",
    };
  }

  const { partyId, participantId, token } = validated.data;

  let slug: string;

  // requireAdmin hits the database, so it belongs inside the try: an error
  // thrown out of a Server Action reaches the global error boundary and wipes
  // the dashboard instead of surfacing here.
  try {
    const party = await requireAdmin({ partyId }, token);

    if (!party) {
      return { success: false as const, error: "Non autorisé" };
    }

    slug = party.slug;

    const [deleted] = await db
      .delete(participants)
      .where(
        and(
          eq(participants.id, participantId),
          eq(participants.partyId, partyId),
          eq(participants.isOrganizer, false)
        )
      )
      .returning({ id: participants.id });

    if (!deleted) {
      return { success: false as const, error: "Participant non trouvé" };
    }
  } catch (error) {
    console.error("Failed to delete participant as admin:", error);
    return {
      success: false as const,
      error: "Une erreur est survenue lors de la suppression",
    };
  }

  // The row is gone for good past this point, so a revalidation failure must
  // never surface as a failed deletion.
  try {
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/participer`);
  } catch (error) {
    console.error("Failed to revalidate after participant deletion:", error);
  }

  return { success: true as const };
}
