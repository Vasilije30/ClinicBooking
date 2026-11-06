import {useState, type ChangeEvent, type FormEvent} from "react";
import {useNavigate } from "react-router-dom";
import {register } from "../api";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email:"",
        password:"",
        firstName:"",
        lastName:"",
    });
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register(form);
            navigate("/login", {state: {registered:true}});
        }catch (err) {
            setError(err instanceof Error ? err.message: "Greska pri registraciji.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Registracija</h1>
            <input name="firstName" placeholder="Ime" value={form.firstName} onChange={handleChange} required/>
            <input name="lastName" placeholder="Prezime" value={form.lastName} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder= "Lozinka" value={form.password} onChange={handleChange} required />
            <button type="submit" disabled={submitting}>
                {submitting ? "Registraija...." : "Registruj se"}
            </button>
            {error && <p>{error}</p>}
        </form>
        
    );
}