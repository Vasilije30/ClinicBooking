import {Link, Outlet} from "react-router-dom";

export default function Layout() {
    return (
        <div>
            <nav>
                <Link to="/">Pocetna</Link> | <Link to="/doctors">Lekari</Link>
            </nav>
            <main>
                <Outlet/>
            </main>
        </div>
    );
}