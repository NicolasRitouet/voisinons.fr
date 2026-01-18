import { z } from "zod";
import { needCategoryEnum } from "@/lib/db/schema";

export const createNeedSchema = z.object({
  partyId: z.string().uuid(),
  token: z.string().min(10, "Token requis"),
  category: z.enum(needCategoryEnum.enumValues),
  description: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
});

export type CreateNeedInput = z.infer<typeof createNeedSchema>;

export const deleteNeedSchema = z.object({
  needId: z.string().uuid(),
  token: z.string().min(10, "Token requis"),
});

export type DeleteNeedInput = z.infer<typeof deleteNeedSchema>;
