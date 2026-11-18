import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, Layers, Stethoscope } from "lucide-react";
import { PageHeader } from "../components/ui";

const SECTIONS = [
    {
        to: "/admin/specialties",
        title: "Specijalnosti",
        text: "Oblasti medicine koje ordinacija pokriva.",
        icon: Layers,
    },
    {
        to: "/admin/examination-types",
        title: "Tipovi pregleda",
        text: "Pregledi, njihovo trajanje i cene.",
        icon: ClipboardList,
    },
    {
        to: "/admin/doctors",
        title: "Lekari",
        text: "Profili lekara i njihove specijalnosti.",
        icon: Stethoscope,
    },
];

export default function AdminPage() {
    return (
        <div>
            <PageHeader eyebrow="Administracija" title="Admin panel" description="Upravljajte podacima ordinacije." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SECTIONS.map((s) => (
                    <Link
                        key={s.to}
                        to={s.to}
                        className="group flex flex-col rounded-2xl border border-ink-200/70 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                    >
                        <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                            <s.icon className="size-5" />
                        </span>
                        <h2 className="mt-5 text-lg font-semibold">{s.title}</h2>
                        <p className="mt-1 text-sm text-ink-500">{s.text}</p>
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                            Upravljaj <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
