// Runs once when a Next.js server instance starts, before it handles any
// request (Next 16 instrumentation). A bad API_AREAS then stops the server
// with its message, instead of the menu and login working while every other
// area fails on its first read.

import { liveAreas } from "@/lib/api/config";

export function register() {
    liveAreas();
}
