import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  LayoutDashboard,
  LogOut,
  Menu,
  Stethoscope,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";
import { buttonClass, cn } from "./styles";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-brand-700 text-white shadow-sm transition group-hover:rotate-6">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
          <path d="M9.5 3h5v6.5H21v5h-6.5V21h-5v-6.5H3v-5h6.5z" />
        </svg>
      </span>
      <span className="font-display text-xl font-medium tracking-tight text-ink-900">Ordinacija</span>
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items: NavItem[] = [{ to: "/doctors", label: "Lekari", icon: Stethoscope }];
  if (user) items.push({ to: "/my-appointments", label: "Moji termini", icon: CalendarCheck });
  if (user?.roles.includes("Doctor")) {
    items.push(
      { to: "/doctor/appointments", label: "Termini kod mene", icon: CalendarClock },
      { to: "/doctor/schedule", label: "Raspored", icon: LayoutDashboard },
      { to: "/doctor/time-offs", label: "Odsustva", icon: CalendarOff }
    );
  }
  if (user?.roles.includes("Admin")) items.push({ to: "/admin", label: "Admin", icon: LayoutDashboard });

  const close = () => setOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
    );

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-ink-200/60 bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo />

          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {items.map((i) => (
              <NavLink key={i.to} to={i.to} className={linkClass}>
                {i.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 rounded-xl py-1 pr-1 pl-1">
                  <Avatar name={user.email} size="sm" />
                  <span className="max-w-44 truncate text-sm font-medium text-ink-700">{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  title="Odjava"
                  className="grid size-9 cursor-pointer place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClass("ghost", "md")}>
                  Prijava
                </Link>
                <Link to="/register" className={buttonClass("primary", "md")}>
                  Registracija
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto grid size-10 cursor-pointer place-items-center rounded-xl text-ink-700 hover:bg-ink-100 lg:hidden"
            aria-label="Meni"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="animate-fade-up border-t border-ink-200/60 bg-canvas px-4 pt-3 pb-5 lg:hidden">
            <nav className="flex flex-col gap-1">
              {items.map((i) => (
                <NavLink key={i.to} to={i.to} className={linkClass} onClick={close}>
                  <i.icon className="size-4" />
                  {i.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 border-t border-ink-200/60 pt-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Avatar name={user.email} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.email}</span>
                  <button
                    onClick={() => {
                      logout();
                      close();
                    }}
                    className={buttonClass("secondary", "sm")}
                  >
                    <LogOut className="size-3.5" /> Odjava
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={close} className={buttonClass("secondary", "md")}>
                    Prijava
                  </Link>
                  <Link to="/register" onClick={close} className={buttonClass("primary", "md")}>
                    Registracija
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-[13px] text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Ordinacija. Sva prava zadržana.</span>
          <span>Pon–Pet 08–20h · Sub 08–14h</span>
        </div>
      </footer>
    </div>
  );
}
