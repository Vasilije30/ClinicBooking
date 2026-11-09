
import { Link } from "react-router-dom"

export default function AdminPage() {
    return (
        <div>
            <h1>Admin panel</h1>
            <ul>
                <li>
                    <Link to="/admin/specialties">Specijalnosti</Link>
                </li>
                <li>
                    <Link to="/admin/examination-types">Tipovi pregleda</Link>
                </li>
                <li>
                    <Link to="/admin/doctors">Lekari</Link>
                </li>
            </ul>
        </div>
    );
}