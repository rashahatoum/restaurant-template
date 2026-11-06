// Ids for records created in the browser draft. Laravel will assign real
// ids (and slugs) once the API is connected.

/** A new id like "item-3f9a1c2b", not in `taken`. */
export function newId(prefix: string, taken: ReadonlySet<string>): string {
    let id: string;
    do {
        id = `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
    } while (taken.has(id));
    return id;
}
