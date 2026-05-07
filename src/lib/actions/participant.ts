"use server";

import { db } from "@/lib/db";
import { participants, parties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "@/lib/crypto";
import {
  sendParticipantEditEmail,
  sendOrganizerNewParticipantEmail,
} from "@/lib/email";
import {
  joinPartySchema,
  updateParticipantSchema,
  type JoinPartyInput,
  type UpdateParticipantInput,
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
