import InlineEditor from "@/components/dashboard/form/InlineEditor";
import { formatCount } from "@/lib/arabic-count";
import type { Result } from "@/lib/api/errors";
import { CATEGORY_NAME_MAX } from "@/lib/dashboard/validation";
import type { Category } from "@/types/menu";
import Link from "next/link";
import { FiArrowDown, FiArrowUp, FiEdit2, FiTrash2 } from "react-icons/fi";

interface CategoryRowProps {
    category: Category;
    /** Products in this category. */
    count: number;
    /** 0-based place in the order (first can't go up, last can't go down). */
    index: number;
    total: number;
    onMove: (direction: "up" | "down") => void;
    onRename: (name: string) => Promise<Result<unknown>>;
    onDelete: () => void;
}

const iconButton =
    "flex size-40 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30";

// One category: its place, name (editable in place), product count, and
// move / delete. Hook-free; the only state (renaming) lives in InlineEditor.
const CategoryRow = ({ category, count, index, total, onMove, onRename, onDelete }: CategoryRowProps) => {
    const { id, name } = category;

    return (
        // Phones: name on its own line (room to rename), buttons below at the end.
        // From md: one line.
        <article className="flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-10">
                <span aria-hidden="true" className="flex size-32 shrink-0 items-center justify-center rounded-full bg-background text-sm font-extrabold text-muted tabular-nums">
                    {index + 1}
                </span>

                <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
                    <InlineEditor
                        value={name}
                        editLabel={`اسم القسم: ${name}، عدّله`}
                        inputLabel={`الاسم الجديد لقسم ${name}`}
                        saveLabel="احفظ الاسم"
                        field="name"
                        isUnchanged={(text) => text.trim() === name}
                        onSave={onRename}
                        maxLength={CATEGORY_NAME_MAX}
                        buttonClassName="inline-flex min-h-32 max-w-full items-center gap-6 rounded-full text-start text-base font-extrabold transition-colors hover:text-primary"
                        // The form takes the column's width (items-start would shrink it to its content)
                        formClassName="w-full"
                        inputClassName="min-w-0 flex-1"
                    >
                        <span className="truncate">{name}</span>
                        <FiEdit2 aria-hidden="true" className="shrink-0 text-xs text-muted" />
                    </InlineEditor>

                    <span className="text-xs text-muted">
                        {count > 0 ? (
                            <Link href={`/dashboard/menu?category=${encodeURIComponent(id)}`} className="hover:text-primary hover:underline">
                                {formatCount(count, { one: "صنف واحد", two: "صنفين", few: "أصناف", many: "صنف" })}
                            </Link>
                        ) : (
                            // services/menu leaves empty categories out of the public menu
                            "فاضي: ما بيطلع للزبون لحد ما تضيف أصناف"
                        )}
                    </span>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-6 self-end md:self-auto">
                <button type="button" onClick={() => onMove("up")} disabled={index === 0} aria-label={`طلّع ${name} لفوق`} className={iconButton}>
                    <FiArrowUp aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={() => onMove("down")}
                    disabled={index === total - 1}
                    aria-label={`نزّل ${name} لتحت`}
                    className={iconButton}
                >
                    <FiArrowDown aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    aria-label={`احذف قسم ${name}`}
                    className={`${iconButton} hover:border-danger hover:text-danger`}
                >
                    <FiTrash2 aria-hidden="true" />
                </button>
            </div>
        </article>
    );
};

export default CategoryRow;
