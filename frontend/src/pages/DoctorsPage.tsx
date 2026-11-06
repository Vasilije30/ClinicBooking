import {useEffect, useState} from "react";
import {getDoctors, getSpecialties} from "../api";
import type {DoctorListItem, Specialty} from "../types";
import {Link} from "react-router-dom";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string |null>(null);
    const [specialties, setSpecialties] = useState<Specialty[]> ([]);
    const [specialtyId, setSpecialtyId] = useState("");
    const [search, setSearch] = useState("");


    useEffect(() => {
        getSpecialties()
            .then(setSpecialties)
            .catch((e:Error) => setError(e.message));
    }, []);

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        setError(null);

        getDoctors(specialtyId, search)
            .then((data) => {
                if(!ignore) setDoctors(data);
            })
            .catch((e:Error) => {
                if(!ignore) setError(e.message);
            })
            .finally(() => {
                if(!ignore) setLoading(false);
            });

            return () => {
                ignore = true;
            };
        }, [specialtyId, search]);

    

    return (
        <div>
            <h1>Lekari</h1>
            <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)}>
                <option value="">Sve specijalnosti</option>
                {specialties.map((s) =>(
                    <option key={s.id} value={s.id}>
                        {s.name}
                    </option>
                ))}
            </select>

            <input type="text"
                   placeholder="Pretraga po imenu"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)} 
            />
            {loading && <p>Učitavanje...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && doctors.length === 0 && <p>Nema rezultata.</p>}
            
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