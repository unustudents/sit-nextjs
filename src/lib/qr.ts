import QRCode from "qrcode";

export type QrCodeOptions = {
  margin?: number;
  width?: number;
  darkColor?: string;
  lightColor?: string;
};

export function validateQrDestinationUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Generates an SVG string representation of a QR code.
 * Safe for server components and inline SVG rendering.
 */
export async function generateQrCodeSvg(
  url: string,
  options?: QrCodeOptions,
): Promise<string> {
  if (!validateQrDestinationUrl(url)) {
    throw new Error("URL tujuan QR Code tidak valid");
  }

  return QRCode.toString(url, {
    type: "svg",
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor ?? "#0F172A",
      light: options?.lightColor ?? "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generates a base64 Data URL (PNG) representation of a QR code.
 * Suitable for image tags and file downloads.
 */
export async function generateQrCodeDataUrl(
  url: string,
  options?: QrCodeOptions,
): Promise<string> {
  if (!validateQrDestinationUrl(url)) {
    throw new Error("URL tujuan QR Code tidak valid");
  }

  return QRCode.toDataURL(url, {
    margin: options?.margin ?? 2,
    width: options?.width ?? 600,
    color: {
      dark: options?.darkColor ?? "#0F172A",
      light: options?.lightColor ?? "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
}
