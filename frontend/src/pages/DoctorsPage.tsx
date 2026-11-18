import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search, UserRoundSearch } from "lucide-react";
import { getDoctors, getSpecialties } from "../api";
import { Alert, Avatar, Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "../components/ui";
import type { DoctorListItem, Specialty } from "../types";

export default function DoctorsPage() {
    const [searchParams] = useSearchParams();
    const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [specialtyId, setSpecialtyId] = useState(searchParams.get("specialtyId") ?? "");
    const [search, setSearch] = useState("");

    useEffect(() => {
        getSpecialties()
            .then(setSpecialties)
            .catch((e: Error) => setError(e.message));
    }, []);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);

        getDoctors(specialtyId, search)
            .then((data) => {
                if (!ignore) setDoctors(data);
            })
            .catch((e: Error) => {
                if (!ignore) setError(e.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [specialtyId, search]);

    const hasFilters = specialtyId !== "" || search !== "";

    return (
        <div>
            <PageHeader
                eyebrow="Naš tim"
                title="Lekari"
                description="Pronađite specijalistu i zakažite pregled u terminu koji vam odgovara."
            />

            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-ink-200/70 bg-white p-3 shadow-card sm:flex-row">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
                    <Input
                        type="text"
                        placeholder="Pretraga po imenu ili prezimenu"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border-transparent bg-ink-50 pl-10 hover:border-transparent focus:bg-white"
                    />
                </div>
                <Select
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="sm:w-64"
                >
                    <option value="">Sve specijalnosti</option>
                    {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </Select>
            </div>

            {error && <Alert tone="error" className="mb-6">{error}</Alert>}

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-100" />
                    ))}
                </div>
            ) : (
                !error &&
                (doctors.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={UserRoundSearch}
                            title="Nema rezultata"
                            description="Nijedan lekar ne odgovara izabranim filterima."
                            action={
                                hasFilters && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setSearch("");
                                            setSpecialtyId("");
                                        }}
                                    >
                                        Poništi filtere
                                    </Button>
                                )
                            }
                        />
                    </Card>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {doctors.map((d, i) => (
                            <li key={d.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                                <Link
                                    to={`/doctors/${d.id}`}
                                    className="group flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                                >
                                    <div className="flex items-start justify-between">
                                        <Avatar name={`${d.firstName} ${d.lastName}`} seed={d.id} size="lg" />
                                        <span className="grid size-9 place-items-center rounded-full text-ink-300 transition group-hover:bg-brand-700 group-hover:text-white">
                                            <ArrowUpRight className="size-4" />
                                        </span>
                                    </div>
                                    <p className="mt-5 text-xs font-medium text-ink-500">{d.title}</p>
                                    <h2 className="text-lg font-semibold">
                                        {d.firstName} {d.lastName}
                                    </h2>
                                    <div className="mt-auto pt-4">
                                        <Badge tone="brand">{d.specialtyName}</Badge>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ))
            )}
        </div>
    );
}
