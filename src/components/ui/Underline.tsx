// The brand's tilted orange underline. Place it right after the text it
// underlines, inside an inline-block (or w-fit) wrapper so it matches its width.
const Underline = () => {
    return (
        <span
            aria-hidden="true"
            className="mt-2 block h-4 w-full -rotate-3 rounded-full bg-primary"
        />
    );
};

export default Underline;
