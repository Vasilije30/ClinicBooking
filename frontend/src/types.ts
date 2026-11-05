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