import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { getSpecialties } from "../api";
import { useAuth } from "../context/AuthContext";
import { buttonClass } from "../components/styles";
import type { Specialty } from "../types";

const STEPS = [
  { icon: Search, title: "Izaberite lekara", text: "Pregledajte lekare po specijalnosti i pročitajte njihove biografije." },
  { icon: CalendarCheck, title: "Odaberite termin", text: "Vidite slobodne termine u realnom vremenu i rezervišite jednim klikom." },
  { icon: ShieldCheck, title: "Dođite na pregled", text: "Termine pratite na jednom mestu i otkažite ih ako se planovi promene." },
];

export default function HomePage() {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    getSpecialties()
      .then(setSpecialties)
      .catch(() => setSpecialties([]));
  }, []);

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Hero */}
      <section className="grid items-center gap-12 pt-2 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Online zakazivanje pregleda
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-medium tracking-tight sm:text-6xl">
            Briga o zdravlju,
            <br />
            <span className="text-brand-700 italic">bez čekanja</span> u redu.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-500">
            Pronađite odgovarajućeg specijalistu, pogledajte slobodne termine i zakažite pregled za manje od minut.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/doctors" className={buttonClass("primary", "lg")}>
              Pronađi lekara <ArrowRight className="size-4" />
            </Link>
            <Link
              to={user ? "/my-appointments" : "/register"}
              className={buttonClass("secondary", "lg")}
            >
              {user ? "Moji termini" : "Napravi nalog"}
            </Link>
          </div>
        </div>

        {/* Dekorativna kartica termina */}
        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2rem] bg-brand-700 bg-dots" />
          <div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900">Slobodni termini</p>
              <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">Utorak, 18. nov</span>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {["08:00", "08:30", "09:00", "09:30", "10:30", "11:00", "13:00", "13:30"].map((t, i) => (
                <span
                  key={t}
                  className={
                    i === 2
                      ? "rounded-lg bg-brand-700 py-2 text-center text-[13px] font-semibold text-white shadow-sm"
                      : i === 4 || i === 5
                        ? "rounded-lg py-2 text-center text-[13px] text-ink-300 line-through"
                        : "rounded-lg bg-brand-50 py-2 text-center text-[13px] font-medium text-brand-800"
                  }
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-canvas p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                <Stethoscope className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">Kardiološki pregled</p>
                <p className="flex items-center gap-1 text-xs text-ink-500">
                  <Clock className="size-3" /> 09:00 – 09:30
                </p>
              </div>
              <CheckCircle2 className="size-5 text-brand-600" />
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-ink-200/70 bg-white px-4 py-3 shadow-lift sm:block">
            <p className="text-xs text-ink-500">Termin potvrđen</p>
            <p className="font-display text-lg font-medium text-ink-900">za 40 sekundi</p>
          </div>
        </div>
      </section>

      {/* Specijalnosti */}
      {specialties.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">Specijalnosti</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Šta vam je potrebno?</h2>
            </div>
            <Link to="/doctors" className="hidden text-sm font-semibold text-brand-700 hover:text-brand-900 sm:inline-flex sm:items-center sm:gap-1">
              Svi lekari <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((s) => (
              <Link
                key={s.id}
                to={`/doctors?specialtyId=${s.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                  <Stethoscope className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{s.name}</p>
                  {s.description && <p className="truncate text-[13px] text-ink-500">{s.description}</p>}
                </div>
                <ArrowRight className="size-4 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Kako funkcioniše */}
      <section className="rounded-[2rem] bg-brand-800 bg-dots px-6 py-12 text-white sm:px-12 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-200 uppercase">Kako funkcioniše</p>
        <h2 className="mt-2 max-w-md font-display text-3xl font-medium tracking-tight text-white">
          Tri koraka do vašeg pregleda
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <s.icon className="size-5" />
                </span>
                <span className="font-display text-sm text-brand-200">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-100/80">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
