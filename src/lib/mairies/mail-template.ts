/**
 * Subject + body templates for the mairie outreach email. Extracted from the
 * MairieMailBlock component so they can be unit-tested.
 */

export const SUBJECT =
  "Demande d'information — Fête des Voisins du 29 mai 2026";

export function buildBody(communeNom: string): string {
  return `Bonjour,

Je m'appelle [Votre prénom et nom] et j'organise une Fête des Voisins le vendredi 29 mai 2026 à [adresse exacte] à ${communeNom}, avec une trentaine de voisins attendus.

La mairie de ${communeNom} propose-t-elle un kit (affiches, gobelets, ballons) à destination des organisateurs ? Si oui, comment puis-je le récupérer ?

J'aurais également besoin de savoir si une autorisation d'occupation temporaire de la voie publique est nécessaire pour [préciser : fermeture d'une portion de rue, cour intérieure, hall].

Merci par avance pour votre retour.

Bien cordialement,
[Votre prénom et nom]
[Votre numéro de téléphone]`;
}

export function buildMailtoHref(
  email: string,
  subject: string,
  body: string
): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
