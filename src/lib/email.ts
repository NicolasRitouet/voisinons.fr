import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

interface PartyCreatedEmailData {
  to: string;
  organizerName: string;
  partyName: string;
  partySlug: string;
  adminToken: string;
  partyDate: Date;
  partyAddress: string;
}

export async function sendPartyCreatedEmail(data: PartyCreatedEmailData) {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  const publicUrl = `${SITE_URL}/${data.partySlug}`;
  const adminUrl = `${SITE_URL}/${data.partySlug}/admin?token=${data.adminToken}`;

  const formattedDate = data.partyDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Voisinons.fr <noreply@mail.voisinons.fr>";

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: `Votre fête "${data.partyName}" est créée !`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-block; background: #E86E3A; color: white; width: 50px; height: 50px; border-radius: 50%; line-height: 50px; font-size: 24px; font-weight: bold;">V</div>
    <h1 style="color: #3D3D3D; margin: 10px 0 0 0;">voisinons.fr</h1>
  </div>

  <p>Bonjour ${data.organizerName},</p>

  <p>Félicitations ! Votre fête <strong>"${data.partyName}"</strong> a bien été créée.</p>

  <div style="background: #FFF8F0; border-radius: 10px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${formattedDate}</p>
    <p style="margin: 0;"><strong>Lieu :</strong> ${data.partyAddress}</p>
  </div>

  <h2 style="color: #3D3D3D; font-size: 18px;">Page publique de votre fête</h2>
  <p>Partagez ce lien avec vos voisins :</p>
  <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
    <a href="${publicUrl}" style="color: #E86E3A; text-decoration: none;">${publicUrl}</a>
  </p>

  <h2 style="color: #3D3D3D; font-size: 18px;">Lien d'administration</h2>
  <p style="background: #FEF3CD; border: 1px solid #FFC107; border-radius: 5px; padding: 15px;">
    <strong>Important :</strong> Conservez précieusement ce lien, il vous permet de gérer votre fête (modifier les informations, voir les participants, publier des actualités).
  </p>
  <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
    <a href="${adminUrl}" style="color: #E86E3A; text-decoration: none;">${adminUrl}</a>
  </p>

  <div style="text-align: center; margin-top: 30px;">
    <a href="${adminUrl}" style="display: inline-block; background: #E86E3A; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold;">Accéder à l'administration</a>
  </div>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    À bientôt pour la fête !<br>
    L'équipe Voisinons.fr
  </p>

  <p style="color: #999; font-size: 12px; text-align: center;">
    Cet email a été envoyé automatiquement suite à la création de votre fête sur voisinons.fr
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: emailData?.id };
  } catch (err) {
    console.error("[Email] Failed to send email:", err);
    return { success: false, error: "Failed to send email" };
  }
}

interface ParticipantEditEmailData {
  to: string;
  participantName: string;
  partyName: string;
  partySlug: string;
  editToken: string;
  partyDate: Date;
  partyAddress: string;
}

export async function sendParticipantEditEmail(data: ParticipantEditEmailData) {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  const publicUrl = `${SITE_URL}/${data.partySlug}`;
  const editUrl = `${SITE_URL}/${data.partySlug}/participer?participantToken=${data.editToken}`;

  const formattedDate = data.partyDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Voisinons.fr <noreply@mail.voisinons.fr>";

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: fromEmail,
      to: data.to,
      subject: `Votre inscription à \"${data.partyName}\"`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-block; background: #E86E3A; color: white; width: 50px; height: 50px; border-radius: 50%; line-height: 50px; font-size: 24px; font-weight: bold;">V</div>
    <h1 style="color: #3D3D3D; margin: 10px 0 0 0;">voisinons.fr</h1>
  </div>

  <p>Bonjour ${data.participantName},</p>

  <p>Vous êtes bien inscrit(e) à la fête <strong>"${data.partyName}"</strong>.</p>

  <div style="background: #FFF8F0; border-radius: 10px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${formattedDate}</p>
    <p style="margin: 0;"><strong>Lieu :</strong> ${data.partyAddress}</p>
  </div>

  <h2 style="color: #3D3D3D; font-size: 18px;">Lien pour modifier votre participation</h2>
  <p>Conservez ce lien, il vous permet de modifier votre inscription :</p>
  <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
    <a href="${editUrl}" style="color: #E86E3A; text-decoration: none;">${editUrl}</a>
  </p>

  <p>Page publique : <a href="${publicUrl}" style="color: #E86E3A; text-decoration: none;">${publicUrl}</a></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #666; font-size: 14px;">
    À bientôt pour la fête !<br>
    L'équipe Voisinons.fr
  </p>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: emailData?.id };
  } catch (err) {
    console.error("[Email] Failed to send email:", err);
    return { success: false, error: "Failed to send email" };
  }
}
