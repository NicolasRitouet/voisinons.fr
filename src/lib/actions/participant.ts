"use server";

import { db } from "@/lib/db";
import { participants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const joinPartySchema = z.object({
  partyId: z.string().uuid(),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

type JoinPartyInput = z.infer<typeof joinPartySchema>;

export async function joinParty(data: JoinPartyInput) {
  const validated = joinPartySchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.issues[0]?.message || "Données invalides",
    };
  }

  try {
    const [participant] = await db
      .insert(participants)
      .values({
        partyId: validated.data.partyId,
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        guestCount: validated.data.guestCount,
        bringing: validated.data.bringing,
        isOrganizer: false,
      })
      .returning({ id: participants.id });

    return { success: true as const, participantId: participant.id };
  } catch (error) {
    console.error("Failed to join party:", error);
    return {
      success: false as const,
      error: "Une erreur est survenue lors de l'inscription",
    };
  }
}

// Get participant by ID
export async function getParticipantById(participantId: string) {
  try {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    return participant || null;
  } catch (error) {
    console.error("Failed to get participant:", error);
    return null;
  }
}

// Update participant
const updateParticipantSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;

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
      .where(eq(participants.id, validated.data.participantId))
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
