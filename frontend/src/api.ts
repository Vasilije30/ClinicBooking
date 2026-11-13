import {getToken} from "./auth";
import type {DoctorListItem, DoctorDetails, Specialty, RegisterData, SpecialtyInput, ExaminationTypeInput, ExaminationType, DoctorCreateInput, DoctorUpdateInput, Slot, Appointment, CreateAppointmentInput} from "./types";


const DIRECTORY_URL = import.meta.env.VITE_DIRECTORY_URL;
const IDENTITY_URL = import.meta.env.VITE_IDENTITY_URL;
const SCHEDULING_URL = import.meta.env.VITE_SCHEDULING_URL;

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
    if(res.status === 204) return undefined as T;
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

export const createSpecialty = (data: SpecialtyInput) =>
    request<Specialty>(`${DIRECTORY_URL}/api/specialties`, "POST", data);

export const updateSpecialty = (id: string, data:SpecialtyInput) =>
    request<Specialty>(`${DIRECTORY_URL}/api/specialties/${id}`, "PUT", data);

export const deleteSpecialty = (id: string) =>
    request<void>(`${DIRECTORY_URL}/api/specialties/${id}`, "DELETE");

export const getExaminationType = (specialtyId?: string) =>
    get<ExaminationType[]>(
        `${DIRECTORY_URL}/api/examination-types${specialtyId ? `?specialtyId=${specialtyId}`: ""}`
    );

export const createExaminationType = (data: ExaminationTypeInput) =>
    request<ExaminationType>(`${DIRECTORY_URL}/api/examination-types`, "POST", data);

export const updateExaminationType = (id: string, data: ExaminationTypeInput) =>
    request<ExaminationType>(`${DIRECTORY_URL}/api/examination-types/${id}`, "PUT", data);

export const deactivateExaminationType = (id: string) =>
    request<ExaminationType>(`${DIRECTORY_URL}/api/examination-types/${id}`, "DELETE");

export const createDoctor = (data: DoctorCreateInput) =>
    request<DoctorDetails>(`${DIRECTORY_URL}/api/doctors`, "POST", data);

export const updateDoctor = (id: string, data: DoctorUpdateInput) =>
    request<DoctorDetails>(`${DIRECTORY_URL}/api/doctors/${id}`, "PUT", data);

export const deactivateDoctor = (id: string) =>
    request<void>(`${DIRECTORY_URL}/api/doctors/${id}/deactivate`, "PATCH");

export const getSlots = (doctorId: string, examinationTypeId: string, date:string) =>{
    const params = new URLSearchParams({doctorId, examinationTypeId, date});
    return get<Slot[]>(`${SCHEDULING_URL}/api/slots?${params}`);
};
export const createAppointment = (data: CreateAppointmentInput) =>
    request<Appointment>(`${SCHEDULING_URL}/api/appointments`, "POST", data);