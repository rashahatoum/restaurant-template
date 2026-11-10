// QR codes as SVG markup, made on the server (the print page), so no QR code
// library reaches the browser. Don't import this from client components.

import QRCode from "qrcode";

/** An SVG QR code for `link`; "M" error correction survives a scratch or a stain. */
export const qrSvg = (link: string, colors: { dark: string; light: string }) =>
    QRCode.toString(link, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: colors });
