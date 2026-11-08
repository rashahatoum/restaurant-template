import { FEATURE_ICONS } from "@/components/ui/feature-icons";
import type { FeatureIconKey } from "@/types/content";

interface FeatureIconPickerProps {
    /** Unique per feature (radio group name). */
    name: string;
    /** E.g. "أيقونة الميزة 1". */
    label: string;
    value: FeatureIconKey;
    onChange: (icon: FeatureIconKey) => void;
}

// One icon from the small set, as native radios styled as round chips (the
// icon shown in the brand disc, like on the hero). Hook-free; the form holds the value.
const FeatureIconPicker = ({ name, label, value, onChange }: FeatureIconPickerProps) => {
    return (
        <fieldset>
            <legend className="sr-only">{label}</legend>
            <div className="flex flex-wrap gap-6">
                {FEATURE_ICONS.map(({ key, icon: Icon, label: iconLabel }) => (
                    <label key={key} className="cursor-pointer" title={iconLabel}>
                        <input
                            type="radio"
                            name={name}
                            value={key}
                            checked={value === key}
                            onChange={() => onChange(key)}
                            className="peer sr-only"
                        />
                        <span className="sr-only">{iconLabel}</span>
                        <span
                            aria-hidden="true"
                            className="flex size-44 items-center justify-center rounded-full border border-border text-xl text-muted transition-colors peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary"
                        >
                            <Icon />
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
};

export default FeatureIconPicker;
