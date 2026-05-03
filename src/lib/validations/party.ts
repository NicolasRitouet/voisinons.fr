import { z } from "zod";

export const placeTypes = [
  "rue",
  "impasse",
  "residence",
  "parc",
  "place",
  "autre",
] as const;

export const placeTypeLabels: Record<(typeof placeTypes)[number], string> = {
  rue: "Rue",
  impasse: "Impasse",
  residence: "Résidence",
  parc: "Parc",
  place: "Place",
  autre: "Autre",
};

const notifyOnNewParticipantField = z
  .boolean()
  .optional()
  .default(false);

export const createPartySchema = z
  .object({
    name: z
      .string()
      .min(3, "Le nom doit faire au moins 3 caractères")
      .max(255, "Le nom ne peut pas dépasser 255 caractères"),
    slug: z
      .string()
      .min(3, "Le slug doit faire au moins 3 caractères")
      .max(100, "Le slug ne peut pas dépasser 100 caractères")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
      ),
    placeType: z.enum(placeTypes),
    address: z
      .string()
      .min(5, "L'adresse doit faire au moins 5 caractères")
      .max(500, "L'adresse ne peut pas dépasser 500 caractères"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    date: z.string().refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, "La date doit être aujourd'hui ou dans le futur"),
    timeStart: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
    timeEnd: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Format HH:MM requis")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .max(5000, "La description ne peut pas dépasser 5000 caractères")
      .optional(),
    coverImageUrl: z
      .string()
      .url("Lien d'image invalide")
      .max(2048, "Le lien d'image est trop long")
      .optional()
      .or(z.literal("")),
    isPrivate: z.boolean().default(false),
    accessCode: z
      .string()
      .max(50, "Le code d'accès ne peut pas dépasser 50 caractères")
      .optional(),
    organizerName: z
      .string()
      .min(2, "Le nom doit faire au moins 2 caractères")
      .max(255, "Le nom ne peut pas dépasser 255 caractères"),
    organizerEmail: z.string().email("Email invalide"),
    notifyOnNewParticipant: notifyOnNewParticipantField,
  })
  .superRefine((data, ctx) => {
    if (data.timeEnd && data.timeEnd !== "") {
      if (data.timeEnd <= data.timeStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "L'heure de fin doit être après l'heure de début",
          path: ["timeEnd"],
        });
      }
    }
  });

export type CreatePartyInput = z.input<typeof createPartySchema>;
export type CreatePartyOutput = z.output<typeof createPartySchema>;

export const updatePartyDetailsSchema = z
  .object({
    partyId: z.string().uuid(),
    token: z.string().min(10, "Token requis"),
    address: z
      .string()
      .min(5, "L'adresse doit faire au moins 5 caractères")
      .max(500, "L'adresse ne peut pas dépasser 500 caractères"),
    coverImageUrl: z
      .string()
      .url("Lien d'image invalide")
      .max(2048, "Le lien d'image est trop long")
      .optional()
      .or(z.literal("")),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    date: z.string().refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(date.getTime()) && date >= today;
    }, "La date doit être aujourd'hui ou dans le futur"),
    timeStart: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Format HH:MM requis"),
    timeEnd: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Format HH:MM requis")
      .optional()
      .or(z.literal("")),
    notifyOnNewParticipant: notifyOnNewParticipantField,
  })
  .superRefine((data, ctx) => {
    if (data.timeEnd && data.timeEnd !== "") {
      if (data.timeEnd <= data.timeStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "L'heure de fin doit être après l'heure de début",
          path: ["timeEnd"],
        });
      }
    }
  });

export type UpdatePartyDetailsInput = z.input<typeof updatePartyDetailsSchema>;

/**
 * Parse une adresse française et extrait la rue et la ville
 * Exemples :
 * - "15 rue Jaboulay, 69007 Lyon" → { street: "rue Jaboulay", city: "Lyon" }
 * - "Place de la République, 75003 Paris" → { street: "Place de la République", city: "Paris" }
 */
export function parseAddress(address: string): { street: string; city: string } {
  // Normaliser l'adresse
  const normalized = address.trim();

  // Pattern pour trouver le code postal (5 chiffres) et la ville qui suit
  const postalCityMatch = normalized.match(/(\d{5})\s+(.+?)(?:\s*,.*)?$/i);

  let city = "";
  let streetPart = normalized;

  if (postalCityMatch) {
    city = postalCityMatch[2].trim();
    // Enlever le code postal et la ville de l'adresse pour garder la rue
    streetPart = normalized.substring(0, normalized.indexOf(postalCityMatch[1])).trim();
  }

  // Enlever le numéro de rue au début (ex: "15 rue..." → "rue...")
  let street = streetPart
    .replace(/^\d+\s*(bis|ter|quater)?\s*,?\s*/i, "")
    .replace(/,\s*$/, "")
    .trim();

  // Si pas de ville trouvée, essayer de la trouver après une virgule
  if (!city) {
    const parts = normalized.split(",");
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1].trim();
      // Chercher si le dernier élément contient une ville (après un éventuel code postal)
      const cityMatch = lastPart.match(/(?:\d{5}\s+)?(.+)/);
      if (cityMatch) {
        city = cityMatch[1].trim();
      }
      street = parts[0].replace(/^\d+\s*(bis|ter|quater)?\s*,?\s*/i, "").trim();
    }
  }

  return { street, city };
}

function normalizeForSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}

/**
 * Génère un nom de fête à partir de l'adresse
 * Ex: "15 rue Jaboulay, 69007 Lyon" → "Fête de la rue Jaboulay"
 */
export function generatePartyNameFromAddress(address: string): string {
  const { street } = parseAddress(address);

  if (!street) {
    return "";
  }

  // Capitaliser la première lettre de la rue
  const capitalizedStreet = street.charAt(0).toUpperCase() + street.slice(1);

  return `Fête de la ${capitalizedStreet}`;
}

/**
 * Génère un slug à partir de l'adresse
 * Ex: "15 rue Jaboulay, 69007 Lyon" → "rue-jaboulay-lyon"
 */
export function generateSlugFromAddress(address: string): string {
  const { street, city } = parseAddress(address);

  const parts: string[] = [];

  if (street) {
    parts.push(normalizeForSlug(street));
  }

  if (city) {
    parts.push(normalizeForSlug(city));
  }

  const slug = parts.join("-").replace(/-+/g, "-").substring(0, 100);

  // Fallback si le slug est trop court
  if (slug.length < 3) {
    return normalizeForSlug(address).substring(0, 100);
  }

  return slug;
}

/**
 * @deprecated Utiliser generateSlugFromAddress à la place
 */
export function generateSlug(name: string): string {
  return normalizeForSlug(name).substring(0, 100);
}
