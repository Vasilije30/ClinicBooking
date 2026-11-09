import {useEffect, useState, type ChangeEvent, type FormEvent} from "react";
import { createSpecialty, deleteSpecialty, getSpecialties, updateSpecialty } from "../api";
import type { Specialty } from "../types";

const emptyForm = {name: "", description: ""};

export default function AdminSpecialtiesPage() {
    const [specialties, setSpecialties] = useState<Specialty[]>([])
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        getSpecialties()
            .then(setSpecialties)
            .catch((e:Error) => setError(e.message));
    }, [reloadKey]);

    function HandleChange(e: ChangeEvent<HTMLInputElement>) {
        setForm({...form, [e.target.name]: e.target.value });
    }

    function startEdit(s: Specialty) {
        setEditingId(s.id);
        setForm({name: s.name, description: s.description ?? ""});
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
            if(editingId) await updateSpecialty(editingId, form);
            else await createSpecialty(form);
            cancelEdit();
            setReloadKey((k) => k+1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greska pri cuvanju.");
        } finally{
            setSubmitting(false);
        }
    }

    async function handleDelete(id:string) {
        if(!window.confirm("Obrisati specijalizaciju ?")) return;
        setError(null);
        try {
            await deleteSpecialty(id);
            setReloadKey((k) => k+1);
        }catch(err){
            setError(err instanceof Error ? err.message: "Greska pri brisanju");
        }
    }

    return (
        <div>
      <h1>Specijalnosti</h1>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Naziv" value={form.name} onChange={HandleChange} required />
        <input name="description" placeholder="Opis" value={form.description} onChange={HandleChange} />
        <button type="submit" disabled={submitting}>
          {editingId ? "Sačuvaj izmene" : "Dodaj"}
        </button>
        {editingId && (
          <button type="button" onClick={cancelEdit}>
            Otkaži
          </button>
        )}
      </form>
      {error && <p>{error}</p>}

      <ul>
        {specialties.map((s) => (
          <li key={s.id}>
            {s.name} {s.description && `(${s.description})`}{" "}
            <button onClick={() => startEdit(s)}>Izmeni</button>{" "}
            <button onClick={() => handleDelete(s.id)}>Obriši</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
