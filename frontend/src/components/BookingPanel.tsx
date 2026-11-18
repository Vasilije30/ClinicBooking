import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, CalendarX2 } from "lucide-react";
import { createAppointment, getSlots } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatTime } from "../format";
import type { ExaminationType, Slot } from "../types";
import { Alert, Card, CardHeader, Field, Input, Select, Spinner } from "./ui";
import { cn } from "./styles";

interface Props {
    doctorId: string;
    examinationTypes: ExaminationType[];
}

export default function BookingPanel({ doctorId, examinationTypes }: Props) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [typeId, setTypeId] = useState("");
    const [date, setDate] = useState("");
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);
    const [bookError, setBookError] = useState<string | null>(null);
    const [success, setSucces] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const today = new Date().toLocaleDateString("en-CA");

    useEffect(() => {
        if (!typeId || !date) {
            setSlots([]);
            return;
        }

        let ignore = false;
        setLoading(true);
        setSlotsError(null);

        getSlots(doctorId, typeId, date)
            .then((data) => {
                if (!ignore) setSlots(data);
            })
            .catch((e: Error) => {
                if (!ignore) setSlotsError(e.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [doctorId, typeId, date, reloadKey]);

    async function handleBook(slot: Slot) {
        if (!user) {
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
        if (!window.confirm(`Zakazati termin u ${formatTime(slot.startAt)}?`)) return;

        setBookError(null);
        setSucces(null);
        try {
            await createAppointment({
                doctorId,
                examinationTypeId: typeId,
                startAt: slot.startAt,
            });
            setSucces("Termin je zakazan.");
        } catch (err) {
            setBookError(err instanceof Error ? err.message : "Greška pri zakazivanju.");
        } finally {
            setReloadKey((k) => k + 1);
        }
    }

    const ready = typeId && date;
    if(user && !user.roles.includes("Patient")) {
        return <p>Zakazivanje je dostupno samo pacijentima.</p>
    }

    return (
        <Card>
            <CardHeader icon={CalendarDays} title="Zakažite pregled" description="Izaberite pregled, datum i slobodan termin." />

            <div className="space-y-4 p-5 sm:p-6">
                <Field label="Vrsta pregleda">
                    <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                        <option value="">Izaberite vrstu pregleda</option>
                        {examinationTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} · {t.durationMinutes} min
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Datum">
                    <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>

                {!user && (
                    <Alert tone="info">
                        Za zakazivanje morate biti{" "}
                        <Link to="/login" state={{ from: location.pathname }} className="font-semibold underline underline-offset-2">
                            prijavljeni
                        </Link>
                        .
                    </Alert>
                )}
                {success && (
                    <Alert tone="success">
                        {success}{" "}
                        <Link to="/my-appointments" className="font-semibold underline underline-offset-2">
                            Pogledaj moje termine
                        </Link>
                    </Alert>
                )}
                {bookError && <Alert tone="error">{bookError}</Alert>}
                {slotsError && <Alert tone="error">{slotsError}</Alert>}

                <div className="border-t border-ink-100 pt-4">
                    <p className="mb-3 text-[13px] font-semibold text-ink-700">Slobodni termini</p>

                    {!ready ? (
                        <p className="rounded-xl bg-ink-50 px-4 py-6 text-center text-[13px] text-ink-500">
                            Izaberite pregled i datum da vidite slobodne termine.
                        </p>
                    ) : loading ? (
                        <div className="flex justify-center py-6">
                            <Spinner />
                        </div>
                    ) : (
                        !slotsError &&
                        (slots.length === 0 ? (
                            <div className="flex flex-col items-center rounded-xl bg-ink-50 px-4 py-6 text-center text-[13px] text-ink-500">
                                <CalendarX2 className="mb-2 size-5 text-ink-400" />
                                Nema slobodnih termina za izabrani dan.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                                {slots.map((s) => (
                                    <button
                                        key={s.startAt}
                                        onClick={() => handleBook(s)}
                                        className={cn(
                                            "cursor-pointer rounded-lg bg-brand-50 py-2.5 text-sm font-semibold text-brand-800 ring-1 ring-brand-100 ring-inset",
                                            "transition hover:bg-brand-700 hover:text-white hover:ring-brand-700 active:scale-95"
                                        )}
                                    >
                                        {formatTime(s.startAt)}
                                    </button>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Card>
    );
}
