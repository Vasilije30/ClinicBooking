import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Clock, Pencil, Plus } from "lucide-react";
import {
    createExaminationType,
    deactivateExaminationType,
    getExaminationType,
    updateExaminationType,
    getSpecialties,
} from "../api";
import AdminCrudLayout, { ListEmpty, RowActions } from "../components/AdminCrudLayout";
import { Badge, Button, Field, Input, Select } from "../components/ui";
import { formatPrice } from "../format";
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
    const [error, setError] = useState<string | null>(null);
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
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
    }

    function startEdit(t: ExaminationType) {
        setEditingId(t.id);
        setForm({
            name: t.name,
            description: t.description ?? "",
            durationMinutes: String(t.durationMinutes),
            price: String(t.price),
            specialtyId: t.specialtyId,
        });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const data = {
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
        if (!window.confirm("Deaktivirati tip pregleda?")) return;
        setError(null);
        try {
            await deactivateExaminationType(id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri deaktivaciji");
        }
    }

    function specialtyName(id: string) {
        return specialties.find((s) => s.id === id)?.name ?? "";
    }

    return (
        <AdminCrudLayout
            title="Tipovi pregleda"
            description="Definišite preglede, njihovo trajanje i cenu."
            formTitle={editingId ? "Izmena pregleda" : "Novi tip pregleda"}
            formIcon={editingId ? Pencil : Plus}
            editing={!!editingId}
            error={error}
            listTitle="Svi pregledi"
            listCount={types.length}
            form={
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Naziv">
                        <Input name="name" placeholder="npr. Kontrolni pregled" value={form.name} onChange={handleChange} required />
                    </Field>
                    <Field label="Opis" optional>
                        <Input name="description" value={form.description} onChange={handleChange} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Trajanje (min)">
                            <Input name="durationMinutes" type="number" min="5" value={form.durationMinutes} onChange={handleChange} required />
                        </Field>
                        <Field label="Cena (RSD)">
                            <Input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                        </Field>
                    </div>
                    <Field label="Specijalnost">
                        <Select name="specialtyId" value={form.specialtyId} onChange={handleChange} required>
                            <option value="">Izaberite specijalnost</option>
                            {specialties.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>
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
                types.length === 0 ? (
                    <ListEmpty text="Još nema tipova pregleda." />
                ) : (
                    <ul className="divide-y divide-ink-100">
                        {types.map((t) => (
                            <li
                                key={t.id}
                                className={`flex items-center gap-4 px-5 py-3.5 sm:px-6 ${editingId === t.id ? "bg-brand-50/60" : ""}`}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-ink-900">{t.name}</p>
                                        {specialtyName(t.specialtyId) && <Badge tone="brand">{specialtyName(t.specialtyId)}</Badge>}
                                    </div>
                                    <p className="mt-1 flex items-center gap-3 text-[13px] text-ink-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="size-3.5" /> {t.durationMinutes} min
                                        </span>
                                        <span className="font-medium text-ink-700">{formatPrice(t.price)}</span>
                                    </p>
                                </div>
                                <RowActions
                                    onEdit={() => startEdit(t)}
                                    onRemove={() => handleDeactivate(t.id)}
                                    removeLabel="Deaktiviraj"
                                />
                            </li>
                        ))}
                    </ul>
                )
            }
        />
    );
}
