// Signed session token: "<payload>.<signature>", both base64url.
// HMAC-SHA256 with Web Crypto (built into Node and browsers): no dependency.
// Signed, not encrypted: the payload (name, expiry, Laravel token) is readable
// but can't be changed without the secret. The cookie is httpOnly, so page
// scripts never see it (D7a decision 1). Used by proxy.ts and lib/auth/session.ts.

/** Name of the dashboard login cookie. */
export const SESSION_COOKIE = "dashboard_session";

export interface SessionPayload {
    /** Display name of the signed-in user. */
    name: string;
    /** Expiry, epoch ms. */
    exp: number;
    /** The Laravel API token (Sanctum, 7 days), when the login went through the API. */
    token?: string;
}

/**
 * With the API on, only a login made through it counts: an older cookie from
 * the env-var account has no token, so every API call would answer 401.
 */
export function usableSession(session: SessionPayload | null, isApiEnabled: boolean): SessionPayload | null {
    return session && (!isApiEnabled || session.token) ? session : null;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
    const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function importKey(secret: string) {
    return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
        "sign",
        "verify",
    ]);
}

export async function signSession(payload: SessionPayload, secret: string): Promise<string> {
    const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
    const signature = await crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(body));
    return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** The payload if the signature is valid and not expired; otherwise null. */
export async function verifySession(
    token: string | undefined,
    secret: string,
    now: number
): Promise<SessionPayload | null> {
    if (!token) return null;
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;

    try {
        // verify() compares in constant time
        const isValid = await crypto.subtle.verify(
            "HMAC",
            await importKey(secret),
            fromBase64Url(signature),
            encoder.encode(body)
        );
        if (!isValid) return null;

        const { name, exp, token } = JSON.parse(decoder.decode(fromBase64Url(body))) as Record<string, unknown>;
        if (typeof name !== "string" || typeof exp !== "number" || exp <= now) return null;
        return { name, exp, ...(typeof token === "string" && token ? { token } : {}) };
    } catch {
        // Malformed base64 or JSON
        return null;
    }
}
