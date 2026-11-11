// Dashboard paths used by the proxy, the login form and the login action.

export const DASHBOARD_HOME = "/dashboard";
export const LOGIN_PATH = "/dashboard/login";
/** Clears the login cookie, then opens the login (after the API answers 401). */
export const SESSION_EXPIRED_PATH = "/dashboard/session-expired";

/** Link that signs out what's left of an ended login and comes back to `returnTo`. */
export const sessionExpiredHref = (returnTo: string) =>
    `${SESSION_EXPIRED_PATH}?next=${encodeURIComponent(returnTo)}`;

/**
 * Where to go after signing in: the requested dashboard page, or the home.
 * Anything else (another site, "//evil.com", the login page, the sign-out
 * route) falls back to home.
 */
export function safeDashboardPath(value: unknown): string {
    if (typeof value !== "string") return DASHBOARD_HOME;
    const isDashboard = value === DASHBOARD_HOME || value.startsWith(`${DASHBOARD_HOME}/`);
    if (!isDashboard || value.startsWith("//") || value.startsWith(LOGIN_PATH) || value.startsWith(SESSION_EXPIRED_PATH)) {
        return DASHBOARD_HOME;
    }
    return value;
}
