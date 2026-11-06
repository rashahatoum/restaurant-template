"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import FieldError from "@/components/dashboard/feedback/FieldError";
import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/useToast";
import { fieldError, type AppError } from "@/lib/api/errors";
import { repository } from "@/lib/dashboard/repository";
import { CATEGORY_NAME_MAX } from "@/lib/dashboard/validation";
import type { DashboardData } from "@/types/dashboard";
import type { Category } from "@/types/menu";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FiPlus } from "react-icons/fi";
import CategoryRow from "./CategoryRow";

// Add, rename, reorder and delete menu categories. Client because the data
// lives in the browser draft; every change goes through the repository.
const CategoriesEditor = ({ seed }: { seed: DashboardData }) => {
    const data = useDashboardData(seed);
    const router = useRouter();
    const { toast, show, hide } = useToast();
    const [newName, setNewName] = useState("");
    const [addError, setAddError] = useState<AppError>();
    const [toDelete, setToDelete] = useState<Category>();

    const categories = [...data.categories].sort((a, b) => a.order - b.order);
    const countOf = (id: string) => data.products.filter((product) => product.categoryId === id).length;

    const add = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await repository.createCategory(newName);
        if (!result.ok) return setAddError(result.error);
        setAddError(undefined);
        setNewName("");
        show({ tone: "success", message: `انضاف قسم ${result.data.name}. هلق ضيفله أصناف من المنيو.` });
    };

    const rename = async (category: Category, name: string) => {
        const result = await repository.renameCategory(category.id, name);
        if (result.ok) show({ tone: "success", message: `صار اسم القسم ${result.data.name}` });
        return result;
    };

    const move = async (category: Category, direction: "up" | "down") => {
        const result = await repository.moveCategory(category.id, direction);
        if (!result.ok) return show({ tone: "error", message: result.error.message });
        const place = result.data.findIndex((candidate) => candidate.id === category.id) + 1;
        show({ tone: "success", message: `صار ${category.name} رقم ${place} بالمنيو` });
    };

    const changeImage = async (category: Category, image: string | undefined) => {
        const result = await repository.setCategoryImage(category.id, image);
        show(
            result.ok
                ? { tone: "success", message: image ? `تغيّرت صورة ${category.name}` : `انشالت صورة ${category.name}، بيطلع أول صنف مكانها` }
                : { tone: "error", message: result.error.message }
        );
    };

    // A category with products can't go: say why and offer the way there (no pointless "are you sure?")
    const askDelete = (category: Category) => {
        const count = countOf(category.id);
        if (count === 0) return setToDelete(category);
        show({
            tone: "error",
            message: `ما فيك تحذف ${category.name} وفيه أصناف. انقلها أو احذفها أول.`,
            action: { label: "شوف أصنافه", onClick: () => router.push(`/dashboard/menu?category=${encodeURIComponent(category.id)}`) },
        });
    };

    const remove = async () => {
        const category = toDelete;
        setToDelete(undefined);
        if (!category) return;
        const result = await repository.deleteCategory(category.id);
        show(result.ok ? { tone: "success", message: `انحذف قسم ${category.name}` } : { tone: "error", message: result.error.message });
    };

    const addMessage = addError ? (fieldError(addError, "name") ?? addError.message) : undefined;

    return (
        <>
            {/* =========================
                ADD
            ========================== */}

            <form onSubmit={add} noValidate className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-12">
                <label htmlFor="new-category" className="text-sm font-bold">
                    قسم جديد
                </label>
                <div className="flex gap-8">
                    <input
                        id="new-category"
                        value={newName}
                        onChange={(event) => setNewName(event.target.value)}
                        maxLength={CATEGORY_NAME_MAX}
                        placeholder="متل: حلويات"
                        aria-invalid={Boolean(addMessage)}
                        aria-describedby={addMessage ? "new-category-error" : undefined}
                        className={inputClasses}
                    />
                    <button
                        type="submit"
                        className="inline-flex h-44 shrink-0 items-center gap-6 rounded-full bg-primary px-16 font-extrabold text-background transition-opacity hover:opacity-90"
                    >
                        <FiPlus aria-hidden="true" />
                        ضيف
                    </button>
                </div>
                <FieldError id="new-category-error" message={addMessage} />
            </form>

            {/* =========================
                LIST (menu order)
            ========================== */}

            <ol className="flex flex-col gap-10">
                {categories.map((category, index) => (
                    <li key={category.id}>
                        <CategoryRow
                            category={category}
                            count={countOf(category.id)}
                            index={index}
                            total={categories.length}
                            onMove={(direction) => move(category, direction)}
                            onRename={(name) => rename(category, name)}
                            onDelete={() => askDelete(category)}
                            onImageChange={(image) => changeImage(category, image)}
                        />
                    </li>
                ))}
            </ol>

            <ConfirmDialog
                open={Boolean(toDelete)}
                title={`حذف قسم ${toDelete?.name ?? ""}؟`}
                message="القسم فاضي، فما رح يتأثر ولا صنف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفه"
                onConfirm={remove}
                onCancel={() => setToDelete(undefined)}
            />

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default CategoriesEditor;
