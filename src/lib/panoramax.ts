const PANORAMAX_API = "https://api.panoramax.xyz/api";

interface PanoramaxFeature {
  id: string;
  assets: {
    sd: { href: string };
    hd: { href: string };
    thumb: { href: string };
  };
  properties: {
    datetime: string;
  };
}

interface PanoramaxResponse {
  features: PanoramaxFeature[];
}

export async function getPanoramaxImage(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    // Search for images near the coordinates
    const response = await fetch(
      `${PANORAMAX_API}/search?place_position=${longitude},${latitude}&limit=1`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      return null;
    }

    const data: PanoramaxResponse = await response.json();

    if (data.features && data.features.length > 0) {
      // Return the SD (standard definition) image URL
      return data.features[0].assets.sd.href;
    }

    return null;
  } catch (error) {
    console.error("Error fetching Panoramax image:", error);
    return null;
  }
}
