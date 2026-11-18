import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, CalendarX2, History } from "lucide-react";
import { cancelAppointment, getDoctors, getExaminationType, getMyAppointments } from "../api";
import AppointmentItem from "../components/AppointmentItem";
import { Alert, Card, EmptyState, LoadingState, PageHeader, SectionTitle } from "../components/ui";
import { buttonClass } from "../components/styles";
import type { Appointment } from "../types";

export default function MyAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});
    const [typeNames, setTypeNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let ignore = false;

        Promise.all([getMyAppointments(), getDoctors(), getExaminationType()])
            .then(([apps, doctors, types]) => {
                if (ignore) return;
                setAppointments(apps);
                setDoctorNames(
                    Object.fromEntries(doctors.map((d) => [d.id, `${d.title} ${d.firstName} ${d.lastName}`]))
                );
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
                eyebrow="Pacijent"
                title="Moji termini"
                description="Pregled zakazanih, prethodnih i otkazanih termina."
                actions={
                    <Link to="/doctors" className={buttonClass("primary")}>
                        <CalendarPlus className="size-4" /> Zakaži pregled
                    </Link>
                }
            />

            {actionError && <Alert tone="error" className="mb-6">{actionError}</Alert>}

            <section>
                <SectionTitle title="Predstojeći" count={upcoming.length} />
                {upcoming.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={CalendarX2}
                            title="Nemate predstojećih termina"
                            description="Kada zakažete pregled, pojaviće se ovde."
                            action={<Link to="/doctors" className={buttonClass("secondary")}>Pronađi lekara</Link>}
                        />
                    </Card>
                ) : (
                    <ul className="space-y-3">
                        {upcoming.map((a) => (
                            <AppointmentItem
                                key={a.id}
                                appointment={a}
                                examinationName={typeNames[a.examinationTypeId] ?? "Nepoznata vrsta pregleda"}
                                person={doctorNames[a.doctorId] ?? "Nepoznat lekar"}
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
                        <History className="size-4" /> Nemate prethodnih termina.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {history.map((a) => (
                            <AppointmentItem
                                key={a.id}
                                muted
                                appointment={a}
                                examinationName={typeNames[a.examinationTypeId] ?? "Nepoznata vrsta pregleda"}
                                person={doctorNames[a.doctorId] ?? "Nepoznat lekar"}
                            />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
