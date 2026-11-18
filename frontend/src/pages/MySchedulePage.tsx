import { useEffect, useState } from "react";
import { Coffee, Plus, Save, Trash2 } from "lucide-react";
import { deleteWorkSchedule, getMySchedule, saveWorkSchedule } from "../api";
import { Alert, Button, Input, LoadingState, PageHeader } from "../components/ui";
import { cn } from "../components/styles";
import type { WorkSchedule } from "../types";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const NAMES: Record<number, string> = {
    1: "Ponedeljak",
    2: "Utorak",
    3: "Sreda",
    4: "Četvrtak",
    5: "Petak",
    6: "Subota",
    0: "Nedelja",
};

interface BreakState {
    start: string;
    end: string;
}

interface DayState {
    dayOfWeek: number;
    id: string | null;
    enabled: boolean;
    start: string;
    end: string;
    breaks: BreakState[];
    message: string | null;
    error: string | null;
    saving: boolean;
}

const emptyDay = (dayOfWeek: number): DayState => ({
    dayOfWeek,
    id: null,
    enabled: false,
    start: "08:00",
    end: "15:00",
    breaks: [],
    message: null,
    error: null,
    saving: false,
});

const fromSchedule = (s: WorkSchedule): DayState => ({
    dayOfWeek: s.dayOfWeek,
    id: s.id,
    enabled: true,
    start: s.startTime.slice(0, 5),
    end: s.endTime.slice(0, 5),
    breaks: s.breaks.map((b) => ({
        start: b.startTime.slice(0, 5),
        end: b.endTime.slice(0, 5),
    })),
    message: null,
    error: null,
    saving: false,
});

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                checked ? "bg-brand-600" : "bg-ink-200"
            )}
        >
            <span
                className={cn(
                    "inline-block size-5 rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-[22px]" : "translate-x-0.5"
                )}
            />
        </button>
    );
}

export default function MySchedulePage() {
    const [days, setDays] = useState<DayState[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        getMySchedule()
            .then((items) =>
                setDays(
                    ORDER.map((d) => {
                        const found = items.find((i) => i.dayOfWeek === d);
                        return found ? fromSchedule(found) : emptyDay(d);
                    })
                )
            )
            .catch((e: Error) => setLoadError(e.message))
            .finally(() => setLoading(false));
    }, []);

    function updateDay(dayOfWeek: number, patch: Partial<DayState>) {
        setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
    }

    function addBreak(day: DayState) {
        updateDay(day.dayOfWeek, {
            breaks: [...day.breaks, { start: "11:00", end: "11:30" }],
            message: null,
        });
    }
    function removeBreak(day: DayState, index: number) {
        updateDay(day.dayOfWeek, {
            breaks: day.breaks.filter((_, i) => i !== index),
            message: null,
        });
    }

    function updateBreak(day: DayState, index: number, field: "start" | "end", value: string) {
        updateDay(day.dayOfWeek, {
            breaks: day.breaks.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
            message: null,
        });
    }

    async function handleSave(day: DayState) {
        const key = day.dayOfWeek;

        if (day.enabled && (!day.start || !day.end || day.breaks.some((b) => !b.start || !b.end))) {
            updateDay(key, { error: "Popunite sva vremena.", message: null });
            return;
        }
        updateDay(key, { saving: true, error: null, message: null });
        try {
            if (!day.enabled) {
                if (day.id) {
                    await deleteWorkSchedule(day.id);
                    updateDay(key, { id: null, message: "Radni dan je uklonjen" });
                } else {
                    updateDay(key, { message: "Nema promena" });
                }
            } else {
                const saved = await saveWorkSchedule({
                    dayOfWeek: key,
                    startTime: `${day.start}:00`,
                    endTime: `${day.end}:00`,
                    breaks: day.breaks.map((b) => ({
                        startTime: `${b.start}:00`,
                        endTime: `${b.end}:00`,
                    })),
                });
                updateDay(key, { id: saved.id, message: "Sačuvano" });
            }
        } catch (err) {
            updateDay(key, {
                error: err instanceof Error ? err.message : "Greška pri čuvanju.",
            });
        } finally {
            updateDay(key, { saving: false });
        }
    }

    if (loading) return <LoadingState />;
    if (loadError) return <Alert tone="error">{loadError}</Alert>;

    const timeInput = "h-10 w-[7.5rem] tabular-nums";

    return (
        <div>
            <PageHeader
                eyebrow="Lekar"
                title="Moj raspored"
                description="Podesite radno vreme i pauze za svaki dan u nedelji. Svaki dan se čuva posebno."
            />

            <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card">
                {days.map((day) => (
                    <div
                        key={day.dayOfWeek}
                        className={cn(
                            "flex flex-col gap-4 border-b border-ink-100 px-5 py-5 last:border-b-0 sm:px-6 lg:flex-row lg:items-start",
                            !day.enabled && "bg-ink-50/50"
                        )}
                    >
                        <div className="flex items-center gap-3 lg:w-48 lg:pt-2">
                            <Switch
                                checked={day.enabled}
                                label={NAMES[day.dayOfWeek]}
                                onChange={(v) => updateDay(day.dayOfWeek, { enabled: v, message: null })}
                            />
                            <span className={cn("font-semibold", day.enabled ? "text-ink-900" : "text-ink-400")}>
                                {NAMES[day.dayOfWeek]}
                            </span>
                        </div>

                        <div className="min-w-0 flex-1">
                            {day.enabled ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Input
                                            type="time"
                                            value={day.start}
                                            className={timeInput}
                                            onChange={(e) => updateDay(day.dayOfWeek, { start: e.target.value, message: null })}
                                        />
                                        <span className="text-ink-400">–</span>
                                        <Input
                                            type="time"
                                            value={day.end}
                                            className={timeInput}
                                            onChange={(e) => updateDay(day.dayOfWeek, { end: e.target.value, message: null })}
                                        />
                                    </div>

                                    {day.breaks.map((b, i) => (
                                        <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/70 py-1.5 pr-1.5 pl-3">
                                            <Coffee className="size-4 text-amber-700" />
                                            <span className="mr-1 text-[13px] font-medium text-amber-900">Pauza</span>
                                            <Input
                                                type="time"
                                                value={b.start}
                                                className={cn(timeInput, "h-9")}
                                                onChange={(e) => updateBreak(day, i, "start", e.target.value)}
                                            />
                                            <span className="text-ink-400">–</span>
                                            <Input
                                                type="time"
                                                value={b.end}
                                                className={cn(timeInput, "h-9")}
                                                onChange={(e) => updateBreak(day, i, "end", e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeBreak(day, i)}
                                                title="Ukloni pauzu"
                                                className="ml-auto grid size-8 cursor-pointer place-items-center rounded-lg text-ink-400 transition hover:bg-white hover:text-red-600"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <Button variant="ghost" size="sm" icon={Plus} onClick={() => addBreak(day)} className="-ml-2">
                                        Dodaj pauzu
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-ink-400 lg:pt-2.5">Neradni dan</p>
                            )}
                            {day.error && <Alert tone="error" className="mt-3">{day.error}</Alert>}
                        </div>

                        <div className="flex items-center gap-3 lg:pt-0.5">
                            {day.message && <span className="text-[13px] font-medium text-brand-700">{day.message}</span>}
                            <Button variant="secondary" size="md" icon={Save} loading={day.saving} onClick={() => handleSave(day)}>
                                Sačuvaj
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
