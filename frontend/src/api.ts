import {getToken} from "./auth";
import {type DoctorListItem, type DoctorDetails, type Specialty
            ,type RegisterData, type SpecialtyInput, type ExaminationTypeInput
            , type ExaminationType, type DoctorCreateInput, type DoctorUpdateInput
            , type Slot, type Appointment, type CreateAppointmentInput
            ,type SaveWorkScheduleInput, type WorkSchedule, type TimeOff
            ,type CreateTimeOffInput,
            type UserSummary} from "./types";


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

export const getMyAppointments = () =>
    get<Appointment[]>(`${SCHEDULING_URL}/api/appointments/mine`);

export const cancelAppointment = (id: string, reason?: string) => {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return request<void>(`${SCHEDULING_URL}/api/appointments/${id}/cancel${query}`, "POST");
}
export const getMySchedule = () =>
    get<WorkSchedule[]>(`${SCHEDULING_URL}/api/work-schedules/mine`);

export const saveWorkSchedule = (data: SaveWorkScheduleInput) =>
    request<WorkSchedule>(`${SCHEDULING_URL}/api/work-schedules`, "PUT", data);

export const deleteWorkSchedule = (id: string) =>
    request<void>(`${SCHEDULING_URL}/api/work-schedules/${id}`, "DELETE");

export const getDoctorAppointments = () =>
    get<Appointment[]>(`${SCHEDULING_URL}/api/appointments/doctor`);

export const getMyTimeOffs = () =>
    get<TimeOff[]>(`${SCHEDULING_URL}/api/time-offs/mine`);

export const createTimeOff = (data: CreateTimeOffInput) => 
    request<TimeOff>(`${SCHEDULING_URL}/api/time-offs`, "POST", data);

export const deleteTimeOff = (id: string) => 
    request<void>(`${SCHEDULING_URL}/api/time-offs/${id}`, "DELETE");

export const searchUser = (email: string) =>
    get<UserSummary[]>(`${IDENTITY_URL}/api/users?email=${encodeURIComponent(email)}`);

export const addUserRole = (userId: string, role: string) =>
    request<void>(`${IDENTITY_URL}/api/users/${userId}/roles`, "POST", {role});