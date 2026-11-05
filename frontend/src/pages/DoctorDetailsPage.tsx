import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import {getDoctor} from "../api";
import type { DoctorDetails } from "../types";

export default function DoctorDetailsPage() {
    const {id} = useParams();
    const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(!id) return;
        getDoctor(id)
            .then(setDoctor)
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p>Ucitavanje...</p>;
    if (error) return <p>{error}</p>;
    if (!doctor) return <p>Lekar nije pronadjen.</p>;

    return (
        <div>
            <h1>
                {doctor.title} {doctor.firstName} {doctor.lastName}
            </h1>
            <p>{doctor.specialtyName}</p>
            {doctor.biography && <p>{doctor.biography}</p>}

            <h2>Pregledi</h2>
            <ul>
                {doctor.examinationTypes.map((t) => (
                    <li key={t.id}>
                        {t.name}, {t.durationMinutes} min , {t.price} RSD
                    </li>
                ))}
            </ul>
        </div>
    )
}