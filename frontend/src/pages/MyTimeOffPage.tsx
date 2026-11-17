import { useEffect, useState , type FormEvent} from "react";
import { getMyTimeOffs, deleteTimeOff, createTimeOff } from "../api";
import { formatDateTime } from "../format";
import type { TimeOff } from "../types";

export default function MyTimeOffPage() {
    const[startAt, setStartAt] = useState("");
    const[endAt, setEndAt] = useState("");
    const[reason, setReason] = useState("");
    const[saving, setSaving] = useState(false);
    const[items, setItems] = useState<TimeOff[]>([]);
    const[loading, setLoading] = useState(true);
    const[loadError, setLoadError] = useState<string | null>(null);
    const[actionError, setActionError] = useState<string | null>(null);
    const[reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let ignore = false;

        getMyTimeOffs()
            .then((data) => {
                if(!ignore) setItems(data);
            })
            .catch((e: Error) => {
                if(!ignore) setLoadError(e.message);
            })
            .finally(() => {
                if(!ignore) setLoading(false);
            });
            return () => {
                ignore = true;
            };
    }, [reloadKey]);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        setActionError(null);
        setSaving(true);

        try{
            await createTimeOff({
                startAt: new Date(startAt).toISOString(),
                endAt: new Date(endAt).toISOString(),
                reason,
            });
            setStartAt("");
            setEndAt("");
            setReason("");
            setReloadKey((k) => k+1);
        } catch(err) {
            setActionError(err instanceof Error ? err.message : "Greska pri cuvanju.")
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if(!window.confirm("Obrisati odsustvo? ")) return;

        setActionError(null);
        try{
            await deleteTimeOff(id);
            setReloadKey((k) => k+1);
        } catch (err) {
            setActionError(err instanceof Error ? err.message: "Greska prilikom brisanja odsustva.");
        }
    }

    return (
        <div>
            <h1>Moja odsustva</h1>
            <form onSubmit={handleCreate}>
                <label>
                    Od:{" "}
                    <input type="datetime-local"
                           value={startAt}
                           onChange={(e) => setStartAt(e.target.value)}
                           required 
                    />
                </label>{" "}
                <label>
                    Do:{" "}
                    <input type="datetime-local"
                           value={endAt}
                           onChange={(e) => setEndAt(e.target.value)}
                           required
                    />
                </label>{" "}
                <input placeholder="Razlog(nije obavezno)"
                       value={reason}
                       onChange={(e) => setReason(e.target.value)}
                       />{" "}
                <button type="submit" disabled={saving}>
                    Dodaj odsustvo
                </button>
            </form>
            {actionError && <p>{actionError}</p>}

            {items.length === 0 && <p>Nemate predstojecih odsustava</p>}
            <ul>
                {items.map((t) => (
                    <li key = {t.id}>
                        {formatDateTime(t.startAt)} do {formatDateTime(t.endAt)}
                        {t.reason && `(${t.reason})`}{" "}
                        <button onClick={() => handleDelete(t.id)}>Obrisi</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}