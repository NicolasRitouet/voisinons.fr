/* eslint-disable jsx-a11y/alt-text */
// Note: @react-pdf/renderer Image component doesn't support alt attribute
// PDF accessibility is handled differently than HTML
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import path from "path";

// The background image dimensions (in pixels)
const IMAGE_WIDTH = 1024;
const IMAGE_HEIGHT = 1536;

// Scale factor to convert image pixels to PDF points
// Use A4 width for good print quality
const PDF_WIDTH = 595;
const SCALE = PDF_WIDTH / IMAGE_WIDTH;
const PDF_HEIGHT = IMAGE_HEIGHT * SCALE; // ~893 points

const styles = StyleSheet.create({
  page: {
    width: PDF_WIDTH,
    height: PDF_HEIGHT,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PDF_WIDTH,
    height: PDF_HEIGHT,
  },
  // Text elements with absolute positioning
  infoContainer: {
    position: "absolute",
    top: 270,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dateText: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A5F",
    textAlign: "center",
    marginBottom: 10,
  },
  timeText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A5F",
    textAlign: "center",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 18,
    fontFamily: "Helvetica",
    color: "#2D4A6F",
    textAlign: "center",
    maxWidth: 400,
  },
  qrCode: {
    position: "absolute",
    left: 34,
    top: 707,
    width: 94,
    height: 87,
  },
});

export interface PartyPosterProps {
  name: string;
  date: Date;
  timeStart: string;
  timeEnd: string | null;
  address: string;
  slug: string;
  description?: string | null;
  qrCodeDataUrl: string;
}

export function PartyPoster({
  date,
  timeStart,
  timeEnd,
  address,
  qrCodeDataUrl,
}: PartyPosterProps) {
  // Format date with date-fns for consistency across environments
  const formattedDate = format(date, "EEEE d MMMM yyyy", { locale: fr });
  // Capitalize first letter
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const timeDisplay = timeEnd ? `${timeStart} - ${timeEnd}` : `A partir de ${timeStart}`;

  // Path to the background image
  const backgroundImagePath = path.join(process.cwd(), "public", "affiche-fete-des-voisins.png");

  return (
    <Document>
      <Page size={[PDF_WIDTH, PDF_HEIGHT]} style={styles.page}>
        {/* Background image */}
        <Image src={backgroundImagePath} style={styles.backgroundImage} />

        {/* Info container - centered */}
        <View style={styles.infoContainer}>
          <Text style={styles.dateText}>{capitalizedDate}</Text>
          <Text style={styles.timeText}>{timeDisplay}</Text>
          <Text style={styles.locationText}>{address}</Text>
        </View>

        {/* QR Code */}
        <Image src={qrCodeDataUrl} style={styles.qrCode} />
      </Page>
    </Document>
  );
}
