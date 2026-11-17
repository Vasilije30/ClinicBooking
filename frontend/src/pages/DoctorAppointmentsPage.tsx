import { useEffect, useState } from "react";
import { getDoctorAppointments, getExaminationType, cancelAppointment } from "../api";
import { formatDateTime } from "../format";
import type { Appointment } from "../types";

const STATUS_LABELS: Record<string, string> = {
    Booked: "Zakazan",
    Cancelled: "Otkazan",
    Completed: "Zavrsen"
};

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [typeNames, setTypeNames] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let ignore = false;

        Promise.all([getDoctorAppointments(), getExaminationType()])
            .then(([apps, types]) => {
                if(ignore) return;
                setAppointments(apps);
                setTypeNames(Object.fromEntries(types.map((t) => [t.id, t.name])));
            })
            .catch((e: Error) => {
                if(!ignore) setLoadError(e.message)
            })
            .finally(() => {
                if(!ignore) setLoading(false);
            })
        return () => {
            ignore = true;
        };
    }, [reloadKey]);

    async function handleCancel(id: string) {
        const reason = window.prompt("Razlog otkazivanja(nije obavezno): ");
        if(reason === null) return;

        setActionError(null);
        try{
            await cancelAppointment(id, reason);
            setReloadKey((k) => k + 1);
        }catch (err) {
            setActionError(err instanceof Error ? err.message: "Greska pri otkazivanju.");
        }
    }

        const now = Date.now();
        const upcoming = appointments
            .filter((a) => a.status === "Booked" && new Date(a.endAt).getTime() > now)
            .sort((a, b) => a.startAt.localeCompare(b.startAt));
        const history = appointments.filter((a) => !upcoming.includes(a));

    function renderRow(a: Appointment, canCanel: boolean){
        return (
            <li key={a.id}>
                {formatDateTime(a.startAt)}, {" "}
                {typeNames[a.examinationTypeId] ?? "Nepoznata vrsta pregleda"} (
                    {STATUS_LABELS[a.status] ?? a.status})
                {a.cancelReason && `-razlog: ${a.cancelReason}`}{" "}
                {canCanel && <button onClick = {() => handleCancel(a.id)}>Otkazi</button>}
            </li>
        )
    }

    if (loading) return <p>Ucitavanje...</p>
    if (loadError) return <p>{loadError}</p>

    return (
        <div>
            <h1>Termini kod mene</h1>
            
            <h2>Predstojeci</h2>
            {upcoming.length === 0 && <p>Nemate predstojecih termina</p>}
            <ul>{upcoming.map((a) => renderRow(a, true))}</ul>

            <h2>Prethodni i otkazani</h2>
            {history.length === 0 && <p>Nema prethodnih termina</p>}
            <ul>{history.map((a) => renderRow(a, false))}</ul>
        </div>
    );
}