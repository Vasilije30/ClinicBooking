import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import AuthShell from "../components/AuthShell";
import { Alert, Button, Field, Input } from "../components/ui";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register(form);
            navigate("/login", { state: { registered: true } });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri registraciji.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell
            title="Napravite nalog"
            subtitle="Registracija je besplatna i traje manje od minut."
            footer={
                <>
                    Već imate nalog?{" "}
                    <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-900">
                        Prijavite se
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert tone="error">{error}</Alert>}

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Ime">
                        <Input name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
                    </Field>
                    <Field label="Prezime">
                        <Input name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
                    </Field>
                </div>
                <Field label="Email">
                    <Input
                        name="email"
                        type="email"
                        placeholder="ime@primer.com"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </Field>
                <Field label="Lozinka">
                    <Input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </Field>
                <Button type="submit" size="lg" loading={submitting} className="w-full">
                    {submitting ? "Registracija..." : "Registruj se"}
                </Button>
            </form>
        </AuthShell>
    );
}
