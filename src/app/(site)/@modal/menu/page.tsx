// Empties the modal slot when a popup links to the menu ("عودة للقائمة",
// "تصفّح القائمة"). A parallel slot otherwise keeps its last page on client
// navigation to a route it doesn't match, and a stale cart popup then
// swallows the next /cart navigation.
// Deliberately /menu only, not a [...catchAll]: a catch-all also matched
// /menu/[itemId] and sent `next dev` into a reload loop. Add a page like
// this for any other route a popup links to.
export default function ModalOnMenu() {
    return null;
}
