export interface DoctorListItem {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    specialtyId: string;
    specialtyName: string;
}

export interface ExaminationType {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: number;
    specialtyId: string;
}

export interface DoctorDetails{
    id:string;
    firstName: string;
    lastName: string;
    title: string;
    biography: string | null;
    specialtyId: string;
    specialtyName: string;
    examinationTypes: ExaminationType[];
}

export interface Specialty{
    id: string;
    name:string;
    description:string | null;
}

export interface RegisterData {
    email:string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface SpecialtyInput {
    name: string;
    description: string;
}

export interface ExaminationTypeInput {
    name : string;
    description : string;
    durationMinutes : number;
    price : number;
    specialtyId : string;
}

export interface DoctorCreateInput {
    userId : string;
    firstName : string;
    lastName : string;
    title : string;
    biography: string;
    specialtyId : string;
}

export type DoctorUpdateInput = Omit<DoctorCreateInput, "userId">;