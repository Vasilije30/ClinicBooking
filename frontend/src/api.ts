import {getToken} from "./auth";
import type {DoctorListItem, DoctorDetails, Specialty, RegisterData} from "./types";

const DIRECTORY_URL = import.meta.env.VITE_DIRECTORY_URL;
const IDENTITY_URL = import.meta.env.VITE_IDENTITY_URL;

async function request<T>(url:string, method = "GET", body?:unknown) : Promise<T> {
    const headers: Record<string, string> = {};
    const token = getToken();
    if(body !== undefined) headers["Content-Type"] = "application/json";
    if(token) headers ["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if(!res.ok) {
        let message = `Greska ${res.status}`;
        try {
            const data = await res.json();
            if(Array.isArray(data)) message = data.join(" ");
            else if(data?.message) message = data.message;
        } catch {

        }
        throw new Error(message);
    }
    return res.json();
}

const get = <T>(url:string) => request<T>(url);

export const getSpecialties = () =>
    get<Specialty[]>(`${DIRECTORY_URL}/api/specialties`);

export const getDoctors = (specialtyId?: string, search?: string) => {
    const params = new URLSearchParams();
    if(specialtyId) params.set("specialtyId", specialtyId);
    if(search) params.set("search", search);
    const query = params.toString();
    return get<DoctorListItem[]>(
        `${DIRECTORY_URL}/api/doctors${query ? `?${query}` : ""}`
    )
}

export const getDoctor = (id:string) =>
    get<DoctorDetails>(`${DIRECTORY_URL}/api/doctors/${id}`);

export const login = (email: string, password: string) =>
  request<{ token: string }>(`${IDENTITY_URL}/api/auth/login`, "POST", { email, password });

export const register = (data: RegisterData) =>
    request<{id: string ; email: string}>(`${IDENTITY_URL}/api/auth/register`, "POST", data);

