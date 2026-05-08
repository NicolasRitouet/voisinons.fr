import { z } from "zod";

// Allowed URL schemes for channel links. z.string().url() alone accepts
// javascript:, data:, vbscript: which would render as active payloads when
// the public party page interpolates channel.url into an <a href>.
const SAFE_CHANNEL_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"] as const;

export function isSafeChannelUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (SAFE_CHANNEL_PROTOCOLS as readonly string[]).includes(
      parsed.protocol
    );
  } catch {
    return false;
  }
}

const channelUrlField = z
  .string()
  .url("Lien invalide")
  .max(2048, "Le lien est trop long")
  .refine(isSafeChannelUrl, {
    message: "Seuls les liens https, http, mailto et tel sont autorisés",
  });

export const channelTypes = [
  "whatsapp",
  "signal",
  "telegram",
  "discord",
  "email",
  "autre",
] as const;

export const channelTypeLabels: Record<(typeof channelTypes)[number], string> = {
  whatsapp: "WhatsApp",
  signal: "Signal",
  telegram: "Telegram",
  discord: "Discord",
  email: "Email",
  autre: "Autre",
};

export const createChannelSchema = z.object({
  partyId: z.string().uuid(),
  token: z.string().min(10, "Token requis"),
  type: z.enum(channelTypes),
  name: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(255, "Le nom ne peut pas dépasser 255 caractères"),
  url: channelUrlField,
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;

export const updateChannelSchema = z.object({
  channelId: z.string().uuid(),
  token: z.string().min(10, "Token requis"),
  type: z.enum(channelTypes),
  name: z
    .string()
    .min(2, "Le nom doit faire au moins 2 caractères")
    .max(255, "Le nom ne peut pas dépasser 255 caractères"),
  url: channelUrlField,
});

export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;

export const deleteChannelSchema = z.object({
  channelId: z.string().uuid(),
  token: z.string().min(10, "Token requis"),
});

export type DeleteChannelInput = z.infer<typeof deleteChannelSchema>;
