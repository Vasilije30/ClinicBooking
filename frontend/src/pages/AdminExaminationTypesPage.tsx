import {useEffect, useState, type ChangeEvent, type FormEvent} from "react";
import {
    createExaminationType, deactivateExaminationType, getExaminationType, updateExaminationType, getSpecialties} from "../api";
import type { ExaminationType, Specialty } from "../types";

const emptyForm = {
    name: "",
    description: "",
    durationMinutes: "",
    price: "",
    specialtyId: "",
};

export default function AdminExaminationTypesPage() {
    const [types, setTypes] = useState<ExaminationType[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null> (null);
    const [submitting, setSubmitting] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        getSpecialties()
        .then(setSpecialties)
        .catch((e: Error) => setError(e.message));
    }, []);

    useEffect(() => {
        getExaminationType()
        .then(setTypes)
        .catch((e: Error) => setError(e.message));
    }, [reloadKey]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
    }

    function startEdit(t: ExaminationType) {
        setEditingId(t.id);
        setForm({
            name: t.name,
            description: t.description?? "",
            durationMinutes: String(t.durationMinutes),
            price: String(t.price),
            specialtyId: t.specialtyId,
        });
    }
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const data =  {
            name: form.name,
            description: form.description,
            durationMinutes: Number(form.durationMinutes),
            price: Number(form.price),
            specialtyId: form.specialtyId,
        };
        try {
      if (editingId) await updateExaminationType(editingId, data);
      else await createExaminationType(data);
      cancelEdit();
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri čuvanju.");
    } finally {
      setSubmitting(false);
    }
    }

    async function handleDeactivate(id: string) {
        if(!window.confirm("Deaktivirati tip pregleda?")) return;
        setError(null);
        try{
            await deactivateExaminationType(id);
            setReloadKey((k) => k + 1);
        } catch(err) {
            setError(err instanceof Error ? err.message : "Greska pri deaktivaciji");
        }
    }
    function specialtyName(id: string) {
        return specialties.find((s) => s.id === id)?.name ?? "";
    }

    return (
        <div>
            <h1>Tipovi pregleda</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Naziv" value={form.name} onChange={handleChange} required />
                <input name="description" placeholder="Opis" value={form.description} onChange={handleChange} />
                <input name="durationMinutes" type="number" min="5" placeholder="Trajanje(min)" value={form.durationMinutes} onChange={handleChange} required/>
                <input name="price" type="number" min= "0" step="0.01" placeholder="Cena" value={form.price} onChange={handleChange} required />
                <select name="specialtyId" value={form.specialtyId} onChange={handleChange} required>
                    <option value="">Izaberite specijalnost</option>
                    {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
                <button type="submit" disabled={submitting}>
                    {editingId ? "Sacuvaj izmene" : "Dodaj"}    
                </button>
                {editingId && (
                    <button type="button" onClick={cancelEdit}>
                        Otkazi
                    </button>
                )}
            </form>

            {error && <p>{error}</p>}

            <ul>
                {types.map((t) => (
                    <li key={t.id}>
                        {t.name}, {t.durationMinutes} min, {t.price} RSD, ({specialtyName(t.specialtyId)}){" "}
                        <button onClick={() => startEdit(t)}>Izmeni</button>
                        <button onClick={() => handleDeactivate(t.id)}>Deaktiviraj</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}