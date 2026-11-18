import { Link } from "react-router-dom";
import { buttonClass } from "../components/styles";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center py-16 text-center">
            <p className="font-display text-7xl font-medium text-brand-700">404</p>
            <h1 className="mt-4 text-xl font-semibold">Stranica nije pronađena</h1>
            <p className="mt-2 text-ink-500">Adresa koju ste otvorili ne postoji ili je premeštena.</p>
            <Link to="/" className={buttonClass("primary", "md", "mt-6")}>Nazad na početnu</Link>
        </div>
    );
}
