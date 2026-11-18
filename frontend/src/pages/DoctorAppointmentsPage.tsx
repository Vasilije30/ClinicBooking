import { useEffect, useState } from "react";
import { CalendarX2, History } from "lucide-react";
import { getDoctorAppointments, getExaminationType, cancelAppointment } from "../api";
import AppointmentItem from "../components/AppointmentItem";
import { Alert, Card, EmptyState, LoadingState, PageHeader, SectionTitle } from "../components/ui";
import type { Appointment } from "../types";

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [typeNames, setTypeNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let ignore = false;

        Promise.all([getDoctorAppointments(), getExaminationType()])
            .then(([apps, types]) => {
                if (ignore) return;
                setAppointments(apps);
                setTypeNames(Object.fromEntries(types.map((t) => [t.id, t.name])));
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

    async function handleCancel(id: string) {
        const reason = window.prompt("Razlog otkazivanja (nije obavezno):");
        if (reason === null) return;

        setActionError(null);
        try {
            await cancelAppointment(id, reason);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Greška pri otkazivanju.");
        }
    }

    const now = Date.now();
    const upcoming = appointments
        .filter((a) => a.status === "Booked" && new Date(a.endAt).getTime() > now)
        .sort((a, b) => a.startAt.localeCompare(b.startAt));
    const history = appointments
        .filter((a) => !upcoming.includes(a))
        .sort((a, b) => b.startAt.localeCompare(a.startAt));

    if (loading) return <LoadingState />;
    if (loadError) return <Alert tone="error">{loadError}</Alert>;

    return (
        <div>
            <PageHeader
                eyebrow="Lekar"
                title="Termini kod mene"
                description="Pacijenti koji su zakazali pregled kod vas."
            />

            {actionError && <Alert tone="error" className="mb-6">{actionError}</Alert>}

            <section>
                <SectionTitle title="Predstojeći" count={upcoming.length} />
                {upcoming.length === 0 ? (
                    <Card>
                        <EmptyState icon={CalendarX2} title="Nemate predstojećih termina" />
                    </Card>
                ) : (
                    <ul className="space-y-3">
                        {upcoming.map((a) => (
                            <AppointmentItem
                                key={a.id}
                                appointment={a}
                                examinationName={typeNames[a.examinationTypeId] ?? "Nepoznata vrsta pregleda"}
                                onCancel={() => handleCancel(a.id)}
                            />
                        ))}
                    </ul>
                )}
            </section>

            <section className="mt-12">
                <SectionTitle title="Prethodni i otkazani" count={history.length} />
                {history.length === 0 ? (
                    <p className="flex items-center gap-2 text-sm text-ink-500">
                        <History className="size-4" /> Nema prethodnih termina.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {history.map((a) => (
                            <AppointmentItem
                                key={a.id}
                                muted
                                appointment={a}
                                examinationName={typeNames[a.examinationTypeId] ?? "Nepoznata vrsta pregleda"}
                            />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
