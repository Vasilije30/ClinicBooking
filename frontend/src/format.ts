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

    