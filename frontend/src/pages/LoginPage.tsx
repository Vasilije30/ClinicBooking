import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell from "../components/AuthShell";
import { Alert, Button, Field, Input } from "../components/ui";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const registered = location.state?.registered === true;
    const from = location.state?.from ?? "/";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            navigate(from);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Greška pri prijavi.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell
            title="Dobrodošli nazad"
            subtitle="Prijavite se da biste zakazali i pratili svoje termine."
            footer={
                <>
                    Nemate nalog?{" "}
                    <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-900">
                        Registrujte se
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {registered && <Alert tone="success">Uspešna registracija! Sada se možete prijaviti.</Alert>}
                {error && <Alert tone="error">{error}</Alert>}

                <Field label="Email">
                    <Input
                        type="email"
                        placeholder="ime@primer.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Field>
                <Field label="Lozinka">
                    <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Field>
                <Button type="submit" size="lg" loading={submitting} className="w-full">
                    {submitting ? "Prijava..." : "Prijavi se"}
                </Button>
            </form>
        </AuthShell>
    );
}
