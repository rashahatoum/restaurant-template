import "server-only";

// Slows down password guessing: 5 failed tries per IP, then a 1-minute wait.
// In memory, so it's per server instance (best effort on Vercel). Laravel's
// login throttling replaces it once the API handles sign-in.

const MAX_FAILURES = 5;
const WINDOW_MS = 60 * 1000;

const failures = new Map<string, { count: number; resetAt: number }>();

export function isLocked(ip: string, now: number): boolean {
    const entry = failures.get(ip);
    if (!entry || entry.resetAt <= now) return false;
    return entry.count >= MAX_FAILURES;
}

export function recordFailure(ip: string, now: number) {
    // Drop stale entries now and then, so the map can't grow forever
    if (failures.size > 500) {
        for (const [key, value] of failures) if (value.resetAt <= now) failures.delete(key);
    }

    const entry = failures.get(ip);
    if (!entry || entry.resetAt <= now) {
        failures.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
        entry.count += 1;
    }
}

export function clearFailures(ip: string) {
    failures.delete(ip);
}
