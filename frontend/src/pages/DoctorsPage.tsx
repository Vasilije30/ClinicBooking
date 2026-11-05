import {useEffect, useState} from "react";
import {getDoctors} from "../api";
import type {DoctorListItem} from "../types";
import type {DoctorDetails} from "../types";
import {Link} from "react-router-dom";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string |null>(null);

    useEffect(() => {
        getDoctors()
            .then(setDoctors)
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if(loading) return <p>Ucitavanje...</p>;
    if(error) return <p>{error}</p>;

    return (
        <div>
            <h1>Lekari</h1>
            <ul>
                {doctors.map((d) => (
                    <li key={d.id}>
                        <Link to={`/doctors/${d.id}`}>
                            {d.title} {d.firstName} {d.lastName}
                        </Link>{" "} 
                        ({d.specialtyName})
                    </li>
                ))}
            </ul>
        </div>
    );
}