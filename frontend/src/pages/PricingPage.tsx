import { Receipt } from "lucide-react";
import { Alert, Card, EmptyState, LoadingState, PageHeader } from "../components/ui";
import { formatPrice } from "../format";
import { useServiceCatalog } from "../useServiceCatalog";

export default function PricingPage() {
    const { catalog, loading, error } = useServiceCatalog();
    const withTypes = catalog.filter((s) => s.examinationTypes.length > 0);

    return (
        <div>
            <PageHeader
                eyebrow="Cene"
                title="Cenovnik"
                description="Cene pregleda po specijalnostima. Sve cene su izražene u dinarima."
            />

            {error && <Alert tone="error" className="mb-6">{error}</Alert>}

            {loading ? (
                <LoadingState />
            ) : (
                !error &&
                (withTypes.length === 0 ? (
                    <Card>
                        <EmptyState icon={Receipt} title="Cenovnik je trenutno prazan" />
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {withTypes.map((s) => (
                            <Card key={s.id} className="overflow-hidden">
                                <h2 className="border-b border-ink-100 px-5 py-4 text-lg font-semibold sm:px-6">{s.name}</h2>
                                <table className="w-full text-sm">
                                    <thead className="bg-ink-50 text-left text-xs font-semibold tracking-wider text-ink-500 uppercase">
                                        <tr>
                                            <th className="px-5 py-2.5 sm:px-6">Pregled</th>
                                            <th className="w-28 px-3 py-2.5 text-right">Trajanje</th>
                                            <th className="w-32 px-5 py-2.5 text-right sm:px-6">Cena</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-ink-100">
                                        {s.examinationTypes.map((t) => (
                                            <tr key={t.id}>
                                                <td className="px-5 py-3 font-medium text-ink-900 sm:px-6">{t.name}</td>
                                                <td className="px-3 py-3 text-right text-ink-500">{t.durationMinutes} min</td>
                                                <td className="px-5 py-3 text-right font-semibold whitespace-nowrap text-ink-900 sm:px-6">
                                                    {formatPrice(t.price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}
