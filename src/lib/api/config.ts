// The env switch (DASHBOARD_PLAN §5.1): API_BASE_URL set → the Laravel API;
// unset → mock data and the browser draft (today's behaviour, and local
// development without .env.local). Server code only: the variable isn't
// NEXT_PUBLIC, so in the browser this is always false.

export function isApiEnabled(): boolean {
    return Boolean(process.env.API_BASE_URL);
}
