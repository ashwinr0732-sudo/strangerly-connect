import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/common/GlassCard";

export interface LegalSection {
  title: string;
  body: ReactNode[];
}

export function LegalDoc({
  title,
  intro,
  effective,
  sections,
}: {
  title: string;
  intro: string;
  effective: string;
  sections: LegalSection[];
}) {
  return (
    <AppShell className="px-4 py-12 sm:px-6">
      <GlassCard className="mx-auto max-w-3xl p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">Effective: {effective}</p>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-base font-bold text-foreground">
                {i + 1}. {s.title}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {s.body.map((p, j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </GlassCard>
    </AppShell>
  );
}
