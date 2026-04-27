import { ImageResponse } from "next/og";

export const alt = "Voisinons.fr — Outil gratuit pour la Fête des Voisins";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #F9F8F2 0%, #F9F8F2 60%, #FBE8D9 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "#E9C46A",
            opacity: 0.45,
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "#EB5E28",
            opacity: 0.25,
            filter: "blur(20px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#264653",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            V
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#264653",
              display: "flex",
            }}
          >
            voisinons<span style={{ color: "#EB5E28" }}>.fr</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              fontSize: 28,
              color: "#EB5E28",
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Vendredi 29 mai 2026
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: "#264653",
              lineHeight: 1,
              letterSpacing: -3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Organisez votre</span>
            <span>
              Fête des Voisins
              <span style={{ color: "#EB5E28" }}> 2026</span>
            </span>
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#264653",
              opacity: 0.8,
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            Affiche PDF + QR code + coordination des plats — gratuit, sans
            inscription
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 22,
              color: "#264653",
              fontWeight: 600,
            }}
          >
            <span style={{ display: "flex" }}>100% gratuit</span>
            <span style={{ color: "#EB5E28" }}>•</span>
            <span style={{ display: "flex" }}>RGPD</span>
            <span style={{ color: "#EB5E28" }}>•</span>
            <span style={{ display: "flex" }}>30 secondes</span>
          </div>
          <div
            style={{
              background: "#264653",
              color: "white",
              padding: "16px 32px",
              borderRadius: 999,
              fontSize: 24,
              fontWeight: 700,
              display: "flex",
            }}
          >
            voisinons.fr/creer
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
