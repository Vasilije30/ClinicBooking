import { Clock, Stethoscope, UserRound, X } from "lucide-react";
import { formatDay, formatMonthShort, formatTime, formatWeekday } from "../format";
import type { Appointment } from "../types";
import { Badge, Button } from "./ui";
import { cn } from "./styles";

const STATUS: Record<string, { label: string; tone: "brand" | "neutral" | "danger" }> = {
  Booked: { label: "Zakazan", tone: "brand" },
  Cancelled: { label: "Otkazan", tone: "danger" },
  Completed: { label: "Završen", tone: "neutral" },
};

interface Props {
  appointment: Appointment;
  /** Npr. ime lekara (za pacijenta) — opciono */
  person?: string;
  examinationName: string;
  onCancel?: () => void;
  muted?: boolean;
}

export default function AppointmentItem({ appointment: a, person, examinationName, onCancel, muted }: Props) {
  const status = STATUS[a.status] ?? { label: a.status, tone: "neutral" as const };

  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-white p-4 transition sm:flex-row sm:items-center sm:p-5",
        muted ? "border-ink-200/60 shadow-none" : "border-ink-200/70 shadow-card hover:border-brand-200"
      )}
    >
      <div className="flex items-center gap-4 sm:contents">
        <div
          className={cn(
            "flex size-16 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
            muted ? "bg-ink-100 text-ink-500" : "bg-brand-700 text-white"
          )}
        >
          <span className="font-display text-2xl font-medium">{formatDay(a.startAt)}</span>
          <span className="mt-1 text-[11px] font-semibold tracking-wider uppercase opacity-80">
            {formatMonthShort(a.startAt)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-semibold", muted ? "text-ink-600" : "text-ink-900")}>{examinationName}</p>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-500">
            <span className="inline-flex items-center gap-1.5 capitalize">
              <Clock className="size-3.5" />
              {formatWeekday(a.startAt)}, {formatTime(a.startAt)} – {formatTime(a.endAt)}
            </span>
            {person && (
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />
                {person}
              </span>
            )}
          </div>
          {a.cancelReason && (
            <p className="mt-2 inline-flex items-start gap-1.5 text-[13px] text-ink-500">
              <Stethoscope className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Razlog otkazivanja: <span className="text-ink-700">{a.cancelReason}</span>
              </span>
            </p>
          )}
        </div>
      </div>

      {onCancel && (
        <Button variant="danger" size="sm" icon={X} onClick={onCancel} className="self-start sm:self-center">
          Otkaži
        </Button>
      )}
    </li>
  );
}
