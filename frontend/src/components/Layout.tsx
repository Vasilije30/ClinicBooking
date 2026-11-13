import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav>
        <Link to="/">Početna</Link> | <Link to="/doctors">Lekari</Link> |{" "}
        {user ? (
          <>
            <span>{user.email}</span><Link to="/my-appointments">Moji termini</Link>{" "}<button onClick={logout}>Odjava</button>
            {user.roles.includes("Admin") && (
              <>
                {" "}| <Link to="/admin">Admin</Link>
              </>
            )}
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