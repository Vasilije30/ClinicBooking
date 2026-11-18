import type { ReactNode } from "react";
import { CalendarCheck, Clock, ShieldCheck } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

const POINTS = [
  { icon: CalendarCheck, text: "Slobodni termini u realnom vremenu" },
  { icon: Clock, text: "Zakazivanje za manje od minut" },
  { icon: ShieldCheck, text: "Svi vaši pregledi na jednom mestu" },
];

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-ink-200/70 bg-white shadow-lift lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-brand-800 bg-dots p-10 text-white lg:flex">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-200 uppercase">Ordinacija</p>
          <h2 className="mt-3 font-display text-4xl leading-tight font-medium text-white">
            Vaše zdravlje,
            <br />
            <span className="italic text-brand-200">vaš raspored.</span>
          </h2>
        </div>
        <ul className="space-y-4">
          {POINTS.map((p) => (
            <li key={p.text} className="flex items-center gap-3 text-sm text-brand-50">
              <span className="grid size-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <p.icon className="size-4" />
              </span>
              {p.text}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
        <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
        <p className="mt-2 text-[15px] text-ink-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <div className="mt-8 border-t border-ink-100 pt-6 text-center text-sm text-ink-500">{footer}</div>
      </div>
    </div>
  );
}
