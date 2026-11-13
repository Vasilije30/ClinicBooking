import {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { createAppointment, getSlots } from "../api";
import {useAuth} from "../context/AuthContext";
import {formatTime} from "../format";
import type { ExaminationType, Slot } from "../types";

interface Props {
    doctorId: string;
    examinationTypes: ExaminationType[];
}

export default function BookingPanel({doctorId, examinationTypes}: Props) {
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
        if(!typeId || !date) {
            setSlots([]);
            return;
        }
    

    let ignore = false;
    setLoading(true);
    setSlotsError(null);

    getSlots(doctorId, typeId, date)
        .then((data) => {
            if(!ignore) setSlots(data);
        })
        .catch((e: Error) => {
            if(!ignore) setSlotsError(e.message);
        })
        .finally(() => {
            if(!ignore) setLoading(false);
        });

        return () => {
            ignore = true;
        };
    }, [doctorId, typeId, date, reloadKey]);



    async function handleBook(slot: Slot) {
        if(!user) {
            navigate("/login", {state: {from: location.pathname}});
            return;
        }
        if(!window.confirm(`Zakazati termin u ${formatTime(slot.startAt)}?`)) return;

        setBookError(null);
        setSucces(null);
        try{
            await createAppointment({
                doctorId,
                examinationTypeId: typeId,
                startAt: slot.startAt,
            });
            setSucces("Termin je zakazan.");
        }catch(err) {
            setBookError(err instanceof Error ? err.message: "Greska pri zakazivanju.");
        }finally {
            setReloadKey((k) => k+1);
        }
    }
    return (
        <div>
            <h2>Zakazivanje</h2>
            <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                <option value="">Izaberite vrstu pregleda</option>
                {examinationTypes.map((t) => (
                    <option key={t.id} value = {t.id}>
                        {t.name}, {t.durationMinutes} min
                    </option>
                ))}
            </select>

            <input type="date"
                   min={today}
                   value={date}
                   onChange={(e) => setDate(e.target.value)} />
            
            {!user && <p>Za zakazivanje morate biti prijavljeni.</p>}
      {loading && <p>Učitavanje termina...</p>}
      {slotsError && <p>{slotsError}</p>}
      {bookError && <p>{bookError}</p>}
      {success && <p>{success}</p>}
      {typeId && date && !loading && !slotsError && slots.length === 0 && (
        <p>Nema slobodnih termina za izabrani dan.</p>
      )}

      <div>
        {slots.map((s) => (
          <button key={s.startAt} onClick={() => handleBook(s)}>
            {formatTime(s.startAt)}
          </button>
        ))}
      </div>
    </div>
    );
}
