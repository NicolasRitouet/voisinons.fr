import { z } from "zod";

export const joinPartySchema = z.object({
  partyId: z.string().uuid(),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

export type JoinPartyInput = z.infer<typeof joinPartySchema>;

// editToken is the only credential that authorizes participant edits. The
// participant UUID is intentionally not accepted as a fallback because Server
// Actions are publicly callable and a UUID is not a secret.
export const updateParticipantSchema = z.object({
  editToken: z.string().min(10, "Token requis"),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;

// Lets the organizer edit their own RSVP line from the admin dashboard. The
// organizer participant is created without an editToken, so the regular
// editToken-based flow can never reach it. Authorization here relies on the
// party's adminToken instead, and the update is scoped server-side to the row
// where isOrganizer = true so only the organizer's own line can be touched.
export const adminUpdateOrganizerSchema = z.object({
  partyId: z.string().uuid(),
  token: z.string().min(10, "Token requis"),
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(20).default(1),
  bringing: z.string().optional(),
});

export type AdminUpdateOrganizerInput = z.infer<typeof adminUpdateOrganizerSchema>;
