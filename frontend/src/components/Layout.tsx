import {Link, Outlet} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function Layout() {
    const {user, logout} = useAuth();
    return (
    <div>
      <nav>
        <Link to="/">Početna</Link> | <Link to="/doctors">Lekari</Link> |{" "}
        {user ? (
          <>
            <span>{user.email}</span> <button onClick={logout}>Odjava</button>
          </>
        ) : (
          <>
            <Link to="/login">Prijava</Link> | <Link to="/register">Registracija</Link>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}