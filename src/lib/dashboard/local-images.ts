// Photos added in the dashboard before the Laravel API: stored as Blobs in
// IndexedDB (localStorage holds ~5 MB and would fill after a few photos).
// The draft keeps only a reference ("local-image:<id>"); screens turn it into
// an object URL through useImageSrc. Browser only. Goes away with the API,
// whose upload returns a normal URL.

export const LOCAL_IMAGE_PREFIX = "local-image:";

const DB_NAME = "dashboard-images";
const STORE = "images";

export const isLocalImage = (src: string | undefined): src is string => Boolean(src?.startsWith(LOCAL_IMAGE_PREFIX));

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
    dbPromise ??= new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };
    });
    return dbPromise;
}

/** One IndexedDB request as a promise. */
async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const request = action(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/* =========================
   OBJECT URL CACHE (read by useImageSrc)
========================= */

/** ref → object URL, or null once we know it's missing. */
const urls = new Map<string, string | null>();
const loading = new Set<string>();
const listeners = new Set<() => void>();

export function subscribeImages(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/** The ready URL (undefined while loading, null if the image is gone). */
export const getImageUrl = (ref: string) => urls.get(ref);

/** Starts loading a stored image into the cache (no-op if loaded or loading). */
export function loadImage(ref: string) {
    if (urls.has(ref) || loading.has(ref)) return;
    loading.add(ref);
    run<Blob | undefined>("readonly", (store) => store.get(ref.slice(LOCAL_IMAGE_PREFIX.length)))
        .then((blob) => urls.set(ref, blob ? URL.createObjectURL(blob) : null))
        .catch(() => urls.set(ref, null))
        .finally(() => {
            loading.delete(ref);
            listeners.forEach((listener) => listener());
        });
}

/** Stores a prepared image; returns its reference for the draft. */
export async function saveLocalImage(blob: Blob): Promise<string> {
    const id = `img-${crypto.randomUUID().slice(0, 12)}`;
    await run("readwrite", (store) => store.put(blob, id));
    const ref = `${LOCAL_IMAGE_PREFIX}${id}`;
    // Ready to show at once, no second read
    urls.set(ref, URL.createObjectURL(blob));
    listeners.forEach((listener) => listener());
    return ref;
}

/** Drops every stored image ("رجّع البيانات الأصلية"). */
export async function clearLocalImages() {
    urls.forEach((url) => url && URL.revokeObjectURL(url));
    urls.clear();
    await run("readwrite", (store) => store.clear()).catch(() => undefined);
    listeners.forEach((listener) => listener());
}
