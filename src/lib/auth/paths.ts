// Dashboard paths used by the proxy, the login form and the login action.

export const DASHBOARD_HOME = "/dashboard";
export const LOGIN_PATH = "/dashboard/login";

/**
 * Where to go after signing in: the requested dashboard page, or the home.
 * Anything else (another site, "//evil.com", the login page) falls back to home.
 */
export function safeDashboardPath(value: unknown): string {
    if (typeof value !== "string") return DASHBOARD_HOME;
    const isDashboard = value === DASHBOARD_HOME || value.startsWith(`${DASHBOARD_HOME}/`);
    if (!isDashboard || value.startsWith("//") || value.startsWith(LOGIN_PATH)) return DASHBOARD_HOME;
    return value;
}
