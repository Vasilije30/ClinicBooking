import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Info, Loader2, type LucideIcon } from "lucide-react";
import { buttonClass, cn, type Size, type Variant } from "./styles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: LucideIcon;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        Icon && <Icon className="size-4" strokeWidth={2.2} />
      )}
      {children}
    </button>
  );
}

/* ---------- Form controls ---------- */

const controlBase =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 shadow-[0_1px_0_rgb(0_0_0/0.02)] " +
  "placeholder:text-ink-400 transition outline-none " +
  "hover:border-ink-300 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/12 " +
  "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, "h-11", className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-28 resize-y py-3 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select className={cn(controlBase, "h-11 cursor-pointer appearance-none pr-10")} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

/** Labela + kontrola + opcioni hint. */
export function Field({ label, hint, optional, className, children }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-ink-700">
        {label}
        {optional && <span className="text-xs font-normal text-ink-400">nije obavezno</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

/* ---------- Surfaces ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-ink-200/70 bg-white shadow-card", className)}>{children}</div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function CardHeader({ title, description, icon: Icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start gap-3 border-b border-ink-100 px-5 py-4 sm:px-6">
      {Icon && (
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="size-[18px]" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold tracking-wider text-ink-500 uppercase">
      {title}
      {count !== undefined && (
        <span className="rounded-full bg-ink-200/70 px-2 py-0.5 text-xs text-ink-600">{count}</span>
      )}
    </h2>
  );
}

/* ---------- Feedback ---------- */

type Tone = "error" | "success" | "info";

const alertTones: Record<Tone, { cls: string; Icon: LucideIcon }> = {
  error: { cls: "border-red-200 bg-red-50 text-red-800", Icon: AlertCircle },
  success: { cls: "border-brand-200 bg-brand-50 text-brand-800", Icon: CheckCircle2 },
  info: { cls: "border-ink-200 bg-ink-50 text-ink-700", Icon: Info },
};

export function Alert({ tone = "info", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  const { cls, Icon } = alertTones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm", cls, className)}>
      <Icon className="mt-px size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

type BadgeTone = "brand" | "neutral" | "danger" | "warning";

const badgeTones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200/70",
  neutral: "bg-ink-50 text-ink-600 ring-ink-200",
  danger: "bg-red-50 text-red-700 ring-red-200/70",
  warning: "bg-amber-50 text-amber-800 ring-amber-200/70",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-brand-600", className)} />;
}

export function LoadingState({ label = "Učitavanje..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-sm text-ink-500">
      <Spinner className="size-6" />
      {label}
    </div>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-ink-100 text-ink-400">
        <Icon className="size-6" />
      </span>
      <p className="font-semibold text-ink-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Avatar ---------- */

const avatarPalette = [
  "bg-brand-100 text-brand-800",
  "bg-coral-100 text-coral-500",
  "bg-amber-100 text-amber-800",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AvatarProps {
  name: string;
  seed?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const avatarSizes = {
  sm: "size-8 text-xs rounded-lg",
  md: "size-11 text-sm rounded-xl",
  lg: "size-14 text-base rounded-2xl",
  xl: "size-20 text-2xl rounded-3xl",
};

/** Inicijali u obojenom kvadratu; boja je stabilna za isti seed. */
export function Avatar({ name, seed, size = "md", className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center font-display font-semibold",
        avatarSizes[size],
        avatarPalette[hash(seed ?? name) % avatarPalette.length],
        className
      )}
    >
      {initials}
    </span>
  );
}
