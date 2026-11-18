import { Link } from "react-router-dom";
import { ArrowRight, Clock, Stethoscope } from "lucide-react";
import { Alert, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { useServiceCatalog } from "../useServiceCatalog";

export default function ServicesPage() {
    const { catalog, loading, error } = useServiceCatalog();

    return (
        <div>
            <PageHeader
                eyebrow="Šta nudimo"
                title="Usluge"
                description="Pregled svih specijalnosti i vrsta pregleda koje obavljamo u ordinaciji."
            />

            {error && <Alert tone="error" className="mb-6">{error}</Alert>}

            {loading ? (
                <LoadingState />
            ) : (
                !error &&
                (catalog.length === 0 ? (
                    <Card>
                        <EmptyState icon={Stethoscope} title="Još nema usluga" />
                    </Card>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                        {catalog.map((s) => (
                            <Card key={s.id} className="flex flex-col">
                                <div className="border-b border-ink-100 px-5 py-4 sm:px-6">
                                    <h2 className="text-lg font-semibold">{s.name}</h2>
                                    {s.description && (
                                        <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.description}</p>
                                    )}
                                </div>

                                {s.examinationTypes.length === 0 ? (
                                    <p className="px-5 py-4 text-sm text-ink-400 sm:px-6">Pregledi uskoro.</p>
                                ) : (
                                    <ul className="divide-y divide-ink-100">
                                        {s.examinationTypes.map((t) => (
                                            <li key={t.id} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-ink-900">{t.name}</p>
                                                    {t.description && (
                                                        <p className="mt-0.5 text-[13px] text-ink-500">{t.description}</p>
                                                    )}
                                                </div>
                                                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-500">
                                                    <Clock className="size-3.5" />
                                                    {t.durationMinutes} min
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-auto border-t border-ink-100 px-5 py-3 sm:px-6">
                                    <Link
                                        to={`/doctors?specialtyId=${s.id}`}
                                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                                    >
                                        Pogledaj lekare <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}
