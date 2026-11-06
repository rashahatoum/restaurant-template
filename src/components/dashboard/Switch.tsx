interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Visible label next to the switch, also its accessible name. */
    label: string;
    disabled?: boolean;
}

// On/off switch (role="switch": read as "متوفر، on/off"). The thumb sits at
// the end when on: the left in RTL, like Arabic phone settings.
const Switch = ({ checked, onChange, label, disabled }: SwitchProps) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className="group inline-flex min-h-36 items-center gap-8 rounded-full text-sm font-bold disabled:opacity-50"
        >
            <span
                aria-hidden="true"
                className={`flex h-26 w-44 shrink-0 items-center rounded-full p-3 transition-colors group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary ${
                    checked ? "justify-end bg-primary" : "justify-start bg-border"
                }`}
            >
                <span className="size-20 rounded-full bg-foreground shadow" />
            </span>
            <span className={checked ? "text-foreground" : "text-muted"}>{label}</span>
        </button>
    );
};

export default Switch;
