"use server";

import { db } from "@/lib/db";
import { needs, parties } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  createNeedSchema,
  deleteNeedSchema,
  type CreateNeedInput,
  type DeleteNeedInput,
} from "@/lib/validations/need";

export async function createNeedCategory(data: CreateNeedInput) {
  const validated = createNeedSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { partyId, token, category, description } = validated.data;

  // Validate token inline - only fetch if token matches
  const party = await db.query.parties.findFirst({
    where: eq(parties.id, partyId),
    columns: { id: true, adminToken: true },
  });

  if (!party || party.adminToken !== token) {
    return { success: false as const, error: { _form: ["Non autorisé"] } };
  }

  try {
    await db.insert(needs).values({
      partyId,
      category,
      description,
    });

    return { success: true as const };
  } catch (error) {
    console.error("Failed to create need category:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de l'ajout"] },
    };
  }
}

export async function deleteNeedCategory(data: DeleteNeedInput) {
  const validated = deleteNeedSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false as const,
      error: validated.error.flatten().fieldErrors,
    };
  }

  const { needId, token } = validated.data;

  // Single query with party relation instead of two sequential queries
  const need = await db.query.needs.findFirst({
    where: eq(needs.id, needId),
    with: {
      party: true,
    },
  });

  if (!need) {
    return { success: false as const, error: { _form: ["Catégorie introuvable"] } };
  }

  if (!need.party || need.party.adminToken !== token) {
    return { success: false as const, error: { _form: ["Non autorisé"] } };
  }

  try {
    await db.delete(needs).where(eq(needs.id, needId));
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete need category:", error);
    return {
      success: false as const,
      error: { _form: ["Une erreur est survenue lors de la suppression"] },
    };
  }
}
