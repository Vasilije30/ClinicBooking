import { useEffect, useState, type FormEvent } from "react";
import { CalendarOff, Plane, Plus, Trash2 } from "lucide-react";
import { getMyTimeOffs, deleteTimeOff, createTimeOff } from "../api";
import { Alert, Button, Card, CardHeader, EmptyState, Field, Input, LoadingState, PageHeader, SectionTitle } from "../components/ui";
import { formatDateTime } from "../format";
import type { TimeOff } from "../types";

export default function MyTimeOffPage() {
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState<TimeOff[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let ignore = false;

        getMyTimeOffs()
            .then((data) => {
                if (!ignore) setItems(data);
            })
            .catch((e: Error) => {
                if (!ignore) setLoadError(e.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [reloadKey]);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        setActionError(null);
        setSaving(true);

        try {
            await createTimeOff({
                startAt: new Date(startAt).toISOString(),
                endAt: new Date(endAt).toISOString(),
                reason,
            });
            setStartAt("");
            setEndAt("");
            setReason("");
            setReloadKey((k) => k + 1);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Greška pri čuvanju.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Obrisati odsustvo?")) return;

        setActionError(null);
        try {
            await deleteTimeOff(id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Greška prilikom brisanja odsustva.");
        }
    }

    return (
        <div>
            <PageHeader
                eyebrow="Lekar"
                title="Moja odsustva"
                description="Periodi u kojima niste dostupni neće biti ponuđeni pacijentima za zakazivanje."
            />

            <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr] lg:gap-8">
                <Card className="lg:sticky lg:top-24">
                    <CardHeader icon={Plus} title="Novo odsustvo" />
                    <form onSubmit={handleCreate} className="space-y-4 p-5 sm:p-6">
                        <Field label="Od">
                            <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
                        </Field>
                        <Field label="Do">
                            <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
                        </Field>
                        <Field label="Razlog" optional>
                            <Input placeholder="npr. godišnji odmor" value={reason} onChange={(e) => setReason(e.target.value)} />
                        </Field>
                        {actionError && <Alert tone="error">{actionError}</Alert>}
                        <Button type="submit" loading={saving} className="w-full">
                            Dodaj odsustvo
                        </Button>
                    </form>
                </Card>

                <section>
                    <SectionTitle title="Predstojeća odsustva" count={loading ? undefined : items.length} />
                    {loading ? (
                        <LoadingState />
                    ) : loadError ? (
                        <Alert tone="error">{loadError}</Alert>
                    ) : items.length === 0 ? (
                        <Card>
                            <EmptyState
                                icon={CalendarOff}
                                title="Nemate predstojećih odsustava"
                                description="Dodajte odsustvo pomoću forme."
                            />
                        </Card>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((t) => (
                                <li
                                    key={t.id}
                                    className="flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card sm:p-5"
                                >
                                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral-100 text-coral-500">
                                        <Plane className="size-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-ink-900">{t.reason || "Odsustvo"}</p>
                                        <p className="mt-0.5 text-[13px] text-ink-500">
                                            {formatDateTime(t.startAt)} — {formatDateTime(t.endAt)}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(t.id)} title="Obriši">
                                        <span className="sr-only sm:not-sr-only">Obriši</span>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
