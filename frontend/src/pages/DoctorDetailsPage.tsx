import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, ClipboardList, UserRoundX } from "lucide-react";
import { getDoctor } from "../api";
import BookingPanel from "../components/BookingPanel";
import { Alert, Avatar, Badge, Card, CardHeader, EmptyState, LoadingState } from "../components/ui";
import { buttonClass } from "../components/styles";
import { formatPrice } from "../format";
import type { DoctorDetails } from "../types";

export default function DoctorDetailsPage() {
    const { id } = useParams();
    const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getDoctor(id)
            .then(setDoctor)
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    const back = (
        <Link to="/doctors" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
            <ArrowLeft className="size-4" /> Svi lekari
        </Link>
    );

    if (loading) return <LoadingState />;
    if (error) return <div>{back}<Alert tone="error">{error}</Alert></div>;
    if (!doctor)
        return (
            <Card>
                <EmptyState
                    icon={UserRoundX}
                    title="Lekar nije pronađen"
                    action={<Link to="/doctors" className={buttonClass("secondary")}>Nazad na listu</Link>}
                />
            </Card>
        );

    const fullName = `${doctor.firstName} ${doctor.lastName}`;

    return (
        <div>
            {back}

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="h-24 bg-brand-700 bg-dots sm:h-28" />
                        <div className="px-5 pb-6 sm:px-8">
                            <Avatar
                                name={fullName}
                                seed={doctor.id}
                                size="xl"
                                className="-mt-10 ring-4 ring-white"
                            />
                            <p className="mt-4 text-sm font-medium text-ink-500">{doctor.title}</p>
                            <h1 className="font-display text-3xl font-medium tracking-tight">{fullName}</h1>
                            <div className="mt-3">
                                <Badge tone="brand">{doctor.specialtyName}</Badge>
                            </div>
                            {doctor.biography && (
                                <p className="mt-6 max-w-2xl leading-relaxed whitespace-pre-line text-ink-600">
                                    {doctor.biography}
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <CardHeader
                            icon={ClipboardList}
                            title="Vrste pregleda"
                            description="Pregledi koje ovaj lekar obavlja"
                        />
                        {doctor.examinationTypes.length === 0 ? (
                            <p className="px-6 py-8 text-center text-sm text-ink-500">Trenutno nema dostupnih pregleda.</p>
                        ) : (
                            <ul className="divide-y divide-ink-100">
                                {doctor.examinationTypes.map((t) => (
                                    <li key={t.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-ink-900">{t.name}</p>
                                            {t.description && <p className="mt-0.5 text-[13px] text-ink-500">{t.description}</p>}
                                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                                                <Clock className="size-3" /> {t.durationMinutes} min
                                            </p>
                                        </div>
                                        <p className="font-display text-lg font-medium whitespace-nowrap text-ink-900">
                                            {formatPrice(t.price)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>

                <div className="lg:sticky lg:top-24">
                    <BookingPanel doctorId={doctor.id} examinationTypes={doctor.examinationTypes} />
                </div>
            </div>
        </div>
    );
}
