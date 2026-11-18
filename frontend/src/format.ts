const ZONE = "Europe/Belgrade";

export const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("sr-Latn-RS", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: ZONE,
    });

export const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("sr-Latn-RS", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: ZONE,
    });

    
const part = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleString("sr-Latn-RS", { ...opts, timeZone: ZONE });

/** "17" */
export const formatDay = (iso: string) => part(iso, { day: "numeric" });

/** "nov" */
export const formatMonthShort = (iso: string) => part(iso, { month: "short" }).replace(".", "");

/** "utorak" */
export const formatWeekday = (iso: string) => part(iso, { weekday: "long" });

/** "17. novembar 2026." */
export const formatDateLong = (iso: string) => part(iso, { day: "numeric", month: "long", year: "numeric" });

export const formatPrice = (value: number) =>
    new Intl.NumberFormat("sr-Latn-RS", { maximumFractionDigits: 0 }).format(value) + " RSD";
