import { useEffect, useState } from "react";
import { getExaminationType, getSpecialties } from "./api";
import type { ExaminationType, Specialty } from "./types";

export interface SpecialtyWithTypes extends Specialty {
    examinationTypes: ExaminationType[];
}

/** Učitava sve specijalnosti i uz svaku njene aktivne tipove pregleda. */
export function useServiceCatalog() {
    const [catalog, setCatalog] = useState<SpecialtyWithTypes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        Promise.all([getSpecialties(), getExaminationType()])
            .then(([specialties, types]) => {
                if (ignore) return;
                setCatalog(
                    specialties
                        .map((s) => ({
                            ...s,
                            examinationTypes: types
                                .filter((t) => t.specialtyId === s.id)
                                .sort((a, b) => a.name.localeCompare(b.name, "sr")),
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name, "sr"))
                );
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
    }, []);

    return { catalog, loading, error };
}
