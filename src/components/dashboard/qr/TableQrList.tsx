"use client";

import FieldError from "@/components/dashboard/feedback/FieldError";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { toWesternDigits } from "@/lib/digits";
import { isTableRange, qrPrintPath } from "@/lib/dashboard/qr-print";
import { branchWhatsApp } from "@/lib/site-info";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useState } from "react";
import { FiPrinter } from "react-icons/fi";

const cardClasses = "flex flex-col gap-12 rounded-2xl border border-border bg-surface p-14";
const printLink =
    "inline-flex h-44 items-center justify-center gap-8 self-start rounded-full bg-primary px-20 font-extrabold text-background transition-opacity hover:opacity-90";
const toNumber = (text: string) => (/^\d+$/.test(toWesternDigits(text).trim()) ? Number(toWesternDigits(text).trim()) : NaN);

// One branch: its table count and a range to print (all of them by default;
// one card when a code got damaged, or only the new tables).
const BranchTables = ({ id, name, tableCount }: { id: string; name: string; tableCount: number }) => {
    const [from, setFrom] = useState("1");
    const [to, setTo] = useState(String(tableCount));
    const range = { from: toNumber(from), to: toNumber(to) };
    const isValid = isTableRange(range.from, range.to) && range.to <= tableCount;
    const ids = { from: `qr-${id}-from`, to: `qr-${id}-to`, error: `qr-${id}-error` };
    const count = isValid ? range.to - range.from + 1 : 0;

    return (
        <div className={cardClasses}>
            <div className="flex flex-col gap-4">
                <h3 className="font-extrabold">{name}</h3>
                <p className="text-xs text-muted">عدد الطاولات: {tableCount}</p>
            </div>
            <fieldset className="flex flex-wrap items-end gap-10">
                <legend className="mb-6 text-sm font-bold">شو بدك تطبع؟</legend>
                {(["from", "to"] as const).map((field) => (
                    <div key={field} className="flex flex-col gap-6">
                        <label htmlFor={ids[field]} className="text-xs font-bold text-muted">
                            {field === "from" ? "من طاولة" : "لطاولة"}
                        </label>
                        <input
                            id={ids[field]}
                            value={field === "from" ? from : to}
                            onChange={(event) => (field === "from" ? setFrom : setTo)(event.target.value)}
                            inputMode="numeric"
                            dir="ltr"
                            aria-invalid={!isValid}
                            aria-describedby={isValid ? undefined : ids.error}
                            className={`${inputClasses} w-96 text-center tabular-nums`}
                        />
                    </div>
                ))}
            </fieldset>
            <FieldError id={ids.error} message={isValid ? undefined : `اختار أرقام من 1 لـ ${tableCount}، والأولى أصغر أو متل التانية`} />
            {isValid ? (
                <Link href={qrPrintPath({ kind: "tables", branchId: id, branchName: name, from: range.from, to: range.to })} className={printLink}>
                    <FiPrinter aria-hidden="true" />
                    {count === 1 ? `كود طاولة ${range.from}` : `${count} أكواد`}
                </Link>
            ) : (
                <span aria-disabled="true" className={`${printLink} opacity-40`}>
                    <FiPrinter aria-hidden="true" />
                    اطبع
                </span>
            )}
        </div>
    );
};

// Branches as the owner set them (browser draft): print codes for those whose
// tables are on; the others say why and where to switch them on.
const TableQrList = ({ seed }: { seed: DashboardData }) => {
    const { siteInfo, ordering } = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    if (!isHydrated) return <div aria-busy="true" className="min-h-240" />;

    return (
        <div className="flex flex-col gap-12">
            {siteInfo.branches.map((branch) => {
                const setting = ordering.dineIn.branches.find((candidate) => candidate.branchId === branch.id);
                const isOn = ordering.dineIn.isEnabled && setting?.isEnabled && setting.tableCount > 0 && branchWhatsApp(siteInfo.phones, branch.id);
                return isOn ? (
                    // Remount when the count changes, so the range starts as "all tables" again
                    <BranchTables key={`${branch.id}-${setting.tableCount}`} id={branch.id} name={branch.name} tableCount={setting.tableCount} />
                ) : (
                    <div key={branch.id} className={cardClasses}>
                        <h3 className="font-extrabold">{branch.name}</h3>
                        <p className="text-sm text-muted">
                            طاولات هالفرع مطفية، فأكوادها بتفتح المنيو بلا طاولة. شغّلها من{" "}
                            <Link href="/dashboard/ordering" className="font-bold text-primary underline underline-offset-4">
                                الطلب والتوصيل
                            </Link>
                            .
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default TableQrList;
