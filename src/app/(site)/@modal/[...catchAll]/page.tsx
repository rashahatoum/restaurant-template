// Closes the modal slot when a link inside a popup goes to another page.
// Parallel slots keep their content on client navigation to a route they
// don't match, so every other route has to match something that renders nothing.
export default function ModalCatchAll() {
    return null;
}
