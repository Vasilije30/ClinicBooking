import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { Alert, Card, CardHeader, PageHeader } from "./ui";

interface Props {
  title: string;
  description: string;
  formTitle: string;
  formIcon: LucideIcon;
  editing: boolean;
  error: string | null;
  form: ReactNode;
  listTitle: string;
  listCount: number;
  list: ReactNode;
}

/** Zajednički raspored za admin CRUD stranice: forma levo, lista desno. */
export default function AdminCrudLayout({
  title,
  description,
  formTitle,
  formIcon,
  editing,
  error,
  form,
  listTitle,
  listCount,
  list,
}: Props) {
  return (
    <div>
      <nav className="mb-4 flex items-center gap-1 text-[13px] text-ink-500">
        <Link to="/admin" className="hover:text-ink-900">
          Admin
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-ink-800">{title}</span>
      </nav>
      <PageHeader title={title} description={description} />

      {error && <Alert tone="error" className="mb-6">{error}</Alert>}

      <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr] lg:gap-8">
        <Card className={editing ? "ring-2 ring-brand-500/40 lg:sticky lg:top-24" : "lg:sticky lg:top-24"}>
          <CardHeader icon={formIcon} title={formTitle} />
          <div className="p-5 sm:p-6">{form}</div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title={listTitle}
            action={<span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">{listCount}</span>}
          />
          {list}
        </Card>
      </div>
    </div>
  );
}

interface RowActionsProps {
  onEdit: () => void;
  onRemove: () => void;
  removeLabel?: string;
}

export function RowActions({ onEdit, onRemove, removeLabel = "Obriši" }: RowActionsProps) {
  const base =
    "grid size-9 cursor-pointer place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100";
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" onClick={onEdit} title="Izmeni" className={`${base} hover:text-brand-700`}>
        <Pencil className="size-4" />
      </button>
      <button type="button" onClick={onRemove} title={removeLabel} className={`${base} hover:bg-red-50 hover:text-red-600`}>
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function ListEmpty({ text }: { text: string }) {
  return <p className="px-6 py-12 text-center text-sm text-ink-500">{text}</p>;
}
