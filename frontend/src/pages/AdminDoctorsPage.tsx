import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Pencil, UserPlus } from "lucide-react";
import { createDoctor, updateDoctor, deactivateDoctor, getDoctor, getSpecialties, getDoctors, addUserRole, searchUser } from "../api";
import AdminCrudLayout, { ListEmpty, RowActions } from "../components/AdminCrudLayout";
import { Avatar, Badge, Button, Field, Input, Select, Textarea } from "../components/ui";
import type { DoctorListItem, Specialty, UserSummary } from "../types";


const emptyForm = {
    userId: "",
    firstName: "",
    lastName: "",
    title: "",
    biography: "",
    specialtyId: "",
};

export default function AdminDoctorsPage() {
    const [emailQuery, setEmailQuery] = useState("");
    const [foundUsers, setFoundUsers] = useState<UserSummary[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
    const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
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
        getDoctors()
            .then(setDoctors)
            .catch((e: Error) => setError(e.message));
    }, [reloadKey]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSearch() {
        setError(null);
        if (emailQuery.trim().length < 3) {
            setError("Unesite bar 3 znaka za pretragu.");
            return;
        }
        try {
            const users = await searchUser(emailQuery.trim());
            setFoundUsers(users);
            if (users.length === 0) setError("Nije pronađen nijedan nalog.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri pretrazi.");
        }
    }

    function selectUser(u: UserSummary) {
        setForm({...form, userId: u.id});
        setSelectedEmail(u.email);
        setFoundUsers([]);
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
        setEmailQuery("");
        setFoundUsers([]);
        setSelectedEmail(null);
    }

    async function startEdit(id: string) {
        setError(null);
        try {
            const d = await getDoctor(id);
            setEditingId(d.id);
            setForm({
                userId: "",
                firstName: d.firstName,
                lastName: d.lastName,
                title: d.title,
                biography: d.biography ?? "",
                specialtyId: d.specialtyId,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri učitavanju.");
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { userId, ...updateData } = form;
                await updateDoctor(editingId, updateData);
            } else {
                if(!form.userId){
                    setError("Izaberite nalog lekara");
                    return;
                }
                await addUserRole(form.userId, "Doctor");
                await createDoctor(form);
            }
            cancelEdit();
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri čuvanju.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeactivate(id: string) {
        if (!window.confirm("Deaktivirati lekara?")) return;
        setError(null);
        try {
            await deactivateDoctor(id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri deaktivaciji.");
        }
    }

    return (
        <AdminCrudLayout
            title="Lekari"
            description="Povežite korisničke naloge sa profilima lekara."
            formTitle={editingId ? "Izmena lekara" : "Novi lekar"}
            formIcon={editingId ? Pencil : UserPlus}
            editing={!!editingId}
            error={error}
            listTitle="Svi lekari"
            listCount={doctors.length}
            form={
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!editingId && (
                        <Field label="Nalog lekara" hint="Pretražite registrovan nalog po email-u.">
                            {selectedEmail ? (
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-ink-100 px-3 py-2">
                                    <span className="truncate text-sm font-medium text-ink-900">{selectedEmail}</span>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setSelectedEmail(null);
                                            setForm({ ...form, userId: "" });
                                        }}
                                    >
                                        Promeni
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Email naloga (bar 3 znaka)"
                                            value={emailQuery}
                                            onChange={(e) => setEmailQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="secondary" onClick={handleSearch}>
                                            Pronađi
                                        </Button>
                                    </div>
                                    {foundUsers.length > 0 && (
                                        <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
                                            {foundUsers.map((u) => (
                                                <li key={u.id} className="flex items-center gap-3 px-3 py-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-ink-900">{u.email}</p>
                                                        <p className="truncate text-xs text-ink-500">
                                                            {u.firstName} {u.lastName}
                                                        </p>
                                                    </div>
                                                    {u.roles.map((r) => (
                                                        <Badge key={r}>{r}</Badge>
                                                    ))}
                                                    <Button type="button" variant="secondary" onClick={() => selectUser(u)}>
                                                        Izaberi
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </Field>
                    )}
                    <Field label="Titula">
                        <Input name="title" placeholder="npr. dr med." value={form.title} onChange={handleChange} required />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Ime">
                            <Input name="firstName" value={form.firstName} onChange={handleChange} required />
                        </Field>
                        <Field label="Prezime">
                            <Input name="lastName" value={form.lastName} onChange={handleChange} required />
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
                    <Field label="Biografija" optional>
                        <Textarea name="biography" value={form.biography} onChange={handleChange} />
                    </Field>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" loading={submitting} className="flex-1">
                            {editingId ? "Sačuvaj izmene" : "Dodaj lekara"}
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
                doctors.length === 0 ? (
                    <ListEmpty text="Još nema lekara." />
                ) : (
                    <ul className="divide-y divide-ink-100">
                        {doctors.map((d) => (
                            <li
                                key={d.id}
                                className={`flex items-center gap-4 px-5 py-3.5 sm:px-6 ${editingId === d.id ? "bg-brand-50/60" : ""}`}
                            >
                                <Avatar name={`${d.firstName} ${d.lastName}`} seed={d.id} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-ink-900">
                                        <span className="font-normal text-ink-500">{d.title}</span> {d.firstName} {d.lastName}
                                    </p>
                                    <Badge tone="brand" className="mt-1">{d.specialtyName}</Badge>
                                </div>
                                <RowActions
                                    onEdit={() => startEdit(d.id)}
                                    onRemove={() => handleDeactivate(d.id)}
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
