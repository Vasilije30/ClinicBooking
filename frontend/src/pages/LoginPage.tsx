import {useState, type FormEvent } from "react";
import {useNavigate, useLocation } from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function LoginPage() {
    const {login} = useAuth(); 
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
        try{
            await login(email, password);
            navigate(from);
        } catch(err) {
            setError(err instanceof Error ? err.message : "Greska pri prijavi.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Prijava</h1>
            {registered && <p>Uspesna registracija! Sada se mozete prijaviti.</p>}
            <input type = "email"
                placeholder="Email"
                value = {email}
                onChange={(e) => setEmail(e.target.value)}
                required 
            />
            <input type="password"
                placeholder="Lozinka"
                value = {password}
                onChange={(e) => setPassword(e.target.value)} 
                required
            />
            <button type = "submit" disabled={submitting}>
                {submitting ? "Prijava..." : "Prijavi se"}
            </button>
             {error && <p>{error}</p>}
        </form>
    );
}