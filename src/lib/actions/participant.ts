"use server";

import { db } from "@/lib/db";
import { participants, parties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import { sendParticipantEditEmail } from "@/lib/email";

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

  const editToken = randomBytes(32).toString("hex");

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

    if (validated.data.email) {
      try {
        const party = await db.query.parties.findFirst({
          where: eq(parties.id, validated.data.partyId),
        });

        if (party) {
          await sendParticipantEditEmail({
            to: validated.data.email,
            participantName: validated.data.name,
            partyName: party.name,
            partySlug: party.slug,
            editToken,
            partyDate: party.dateStart,
            partyAddress: party.address,
          });
        }
      } catch (err) {
        console.error("Failed to send participant email:", err);
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

// Get participant by edit token
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

// Update participant
const updateParticipantSchema = z
  .object({
    participantId: z.string().uuid().optional(),
    editToken: z.string().min(10).optional(),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
  })
  .refine((data) => data.participantId || data.editToken, {
    message: "Identifiant requis",
    path: ["participantId"],
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

  const whereClause = validated.data.editToken
    ? eq(participants.editToken, validated.data.editToken)
    : eq(participants.id, validated.data.participantId as string);

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
      .where(whereClause)
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
