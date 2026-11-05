import type {DoctorListItem} from "./types";

const DIRECTORY_URL = import.meta.env.VITE_DIRECTORY_URL;

async function get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Greska ${res.status}`);
    return res.json();
}

export const getDoctors = () =>
    get<DoctorListItem[]>(`${DIRECTORY_URL}/api/doctors`);