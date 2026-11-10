// The one qrcode function we use (lib/qr). Declared here instead of adding
// @types/qrcode for a single call.

declare module "qrcode" {
    interface ToStringOptions {
        type?: "svg" | "utf8" | "terminal";
        errorCorrectionLevel?: "L" | "M" | "Q" | "H";
        /** Quiet zone, in modules. */
        margin?: number;
        color?: { dark?: string; light?: string };
    }

    const QRCode: {
        toString(text: string, options?: ToStringOptions): Promise<string>;
    };
    export default QRCode;
}
