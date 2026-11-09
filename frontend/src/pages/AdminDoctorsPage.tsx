import {useEffect, useState, type ChangeEvent, type FormEvent} from "react";
import {createDoctor, updateDoctor, deactivateDoctor, getDoctor, getSpecialties, getDoctors} from "../api"

import type { DoctorListItem, Specialty } from "../types";

const emptyForm = {
    userId: "",
    firstName: "",
    lastName: "",
    title: "",
    biography: "",
    specialtyId: "",
};

export default function AdminDoctorsPage() {
    const [doctors, setDoctors] = useState<DoctorListItem[]> ([]);
    const [specialties, setSpecialties] = useState<Specialty[]> ([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        getSpecialties()
        .then(setSpecialties)
        .catch((e: Error) => setError(e.message));
    }, []);

    useEffect(() => {
        getDoctors()
        .then(setDoctors)
        .catch((e: Error ) => setError(e.message));
    }, [reloadKey]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    async function startEdit(id : string) {
        setError(null);
        try {
            const d = await getDoctor(id);
            setEditingId(d.id);
            setForm({
                userId : "",
                firstName: d.firstName,
                lastName: d.lastName,
                title : d.title,
                biography: d.biography ?? "",
                specialtyId: d.specialtyId,
            });
        } catch(err) {
            setError(err instanceof Error ? err.message: "Greska pri ucitavanju.");
        }
    }
    
    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try{
            if(editingId) {
                const {userId, ...updateData} = form;
                await updateDoctor(editingId, updateData);
            } else {
                await createDoctor(form);
            }
            cancelEdit();
            setReloadKey((k) => k+1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greska pri ucitavanju");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeactivate(id: string) {
        if(!window.confirm("Deaktivirati lekara?")) return;
        setError(null);
        try{
            await deactivateDoctor(id);
            setReloadKey((k) => k+1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greska pri deaktivaciji.");
        }
    }

    return (
        <div>
            <h1>Lekari</h1>
            <form onSubmit={handleSubmit}>
                {!editingId && (
                    <input
                        name="userId"
                        placeholder="ID naloga (userId)"
                        value={form.userId}
                        onChange={handleChange}
                        required 
                        />
                )}
                <input name="title" placeholder="Titula (npr. dr)" value={form.title} onChange={handleChange} required />
                <input name="firstName" placeholder="Ime" value={form.firstName} onChange={handleChange} required />
                <input name="lastName" placeholder="Prezime" value={form.lastName} onChange={handleChange} required/>
                <select name="specialtyId" value = {form.specialtyId} onChange={handleChange} required>
                    <option value="">Izaberite specijalnost</option>
                    {specialties.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
                <textarea
                    name="biography"
                    placeholder="Biografija"
                    value={form.biography}
                    onChange={handleChange}
                />
                <button type="submit" disabled={submitting}>
                    {editingId ? "Sacuvaj izmene" : "Dodaj"}
                </button>
                {editingId && (
                    <button type="button" onClick={cancelEdit} >
                        Otkazi
                    </button>
                )}
            </form>

            {error && <p>{error}</p>}

            <ul>
                {doctors.map((d) => (
                    <li key={d.id}>
                        {d.title} {d.firstName} {d.lastName} ({d.specialtyName}){" "}
                    <button onClick={() => startEdit(d.id)}>Izmeni</button>{" "}
                    <button onClick={() => handleDeactivate(d.id)}>Deaktiviraj</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}