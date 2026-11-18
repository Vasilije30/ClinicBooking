import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { getSpecialties } from "../api";
import type { Specialty } from "../types";

/** Slika na vrhu početne strane. Fajl stavite u frontend/public/ pod ovim imenom. */
const HERO_IMAGE = "/hero.jpg";

const STEPS = [
  { icon: Search, title: "Izaberite lekara", text: "Pregledajte lekare po specijalnosti i pročitajte njihove biografije." },
  { icon: CalendarCheck, title: "Odaberite termin", text: "Vidite slobodne termine u realnom vremenu i rezervišite jednim klikom." },
  { icon: ShieldCheck, title: "Dođite na pregled", text: "Termine pratite na jednom mestu i otkažite ih ako se planovi promene." },
];

export default function HomePage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [heroLoaded, setHeroLoaded] = useState<boolean | null>(null);

  useEffect(() => {
    getSpecialties()
      .then(setSpecialties)
      .catch(() => setSpecialties([]));
  }, []);

  return (
    <div>
      {/* Velika slika preko cele širine prozora, odmah ispod headera */}
      <section className="relative h-64 w-full overflow-hidden bg-ink-100 sm:h-96 lg:h-[30rem]">
        {heroLoaded !== false && (
          <img
            src={HERO_IMAGE}
            alt="Ordinacija"
            className="size-full object-cover object-center"
            onLoad={() => setHeroLoaded(true)}
            onError={() => setHeroLoaded(false)}
          />
        )}
        {heroLoaded === false && (
          <div className="grid size-full place-items-center text-sm text-ink-400">
            Mesto za sliku: dodajte fajl public{HERO_IMAGE}
          </div>
        )}
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:space-y-28 sm:px-6 sm:py-16">

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
    </div>
  );
}
