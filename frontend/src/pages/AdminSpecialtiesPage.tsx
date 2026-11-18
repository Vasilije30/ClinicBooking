import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Layers, Pencil, Plus } from "lucide-react";
import { createSpecialty, deleteSpecialty, getSpecialties, updateSpecialty } from "../api";
import AdminCrudLayout, { ListEmpty, RowActions } from "../components/AdminCrudLayout";
import { Button, Field, Input } from "../components/ui";
import type { Specialty } from "../types";

const emptyForm = { name: "", description: "" };

export default function AdminSpecialtiesPage() {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        getSpecialties()
            .then(setSpecialties)
            .catch((e: Error) => setError(e.message));
    }, [reloadKey]);

    function HandleChange(e: ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function startEdit(s: Specialty) {
        setEditingId(s.id);
        setForm({ name: s.name, description: s.description ?? "" });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) await updateSpecialty(editingId, form);
            else await createSpecialty(form);
            cancelEdit();
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri čuvanju.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Obrisati specijalnost?")) return;
        setError(null);
        try {
            await deleteSpecialty(id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri brisanju");
        }
    }

    return (
        <AdminCrudLayout
            title="Specijalnosti"
            description="Dodajte i uređujte oblasti medicine."
            formTitle={editingId ? "Izmena specijalnosti" : "Nova specijalnost"}
            formIcon={editingId ? Pencil : Plus}
            editing={!!editingId}
            error={error}
            listTitle="Sve specijalnosti"
            listCount={specialties.length}
            form={
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Naziv">
                        <Input name="name" placeholder="npr. Kardiologija" value={form.name} onChange={HandleChange} required />
                    </Field>
                    <Field label="Opis" optional>
                        <Input name="description" value={form.description} onChange={HandleChange} />
                    </Field>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" loading={submitting} className="flex-1">
                            {editingId ? "Sačuvaj izmene" : "Dodaj"}
                        </Button>
                        {editingId && (
                            <Button variant="secondary" onClick={cancelEdit}>
                                Otkaži
                            </Button>
                        )}
                    </div>
                </form>
            }
            list={
                specialties.length === 0 ? (
                    <ListEmpty text="Još nema specijalnosti." />
                ) : (
                    <ul className="divide-y divide-ink-100">
                        {specialties.map((s) => (
                            <li
                                key={s.id}
                                className={`flex items-center gap-4 px-5 py-3.5 sm:px-6 ${editingId === s.id ? "bg-brand-50/60" : ""}`}
                            >
                                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-500">
                                    <Layers className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-ink-900">{s.name}</p>
                                    {s.description && <p className="truncate text-[13px] text-ink-500">{s.description}</p>}
                                </div>
                                <RowActions onEdit={() => startEdit(s)} onRemove={() => handleDelete(s.id)} />
                            </li>
                        ))}
                    </ul>
                )
            }
        />
    );
}
