import { INTERESTS } from "@/lib/interests";

export function MatchStatus({ interests }: { interests: string[] }) {
  const knownIds = new Set(INTERESTS.map((i) => i.id));
  const labels = interests.map((id) =>
    knownIds.has(id) ? INTERESTS.find((i) => i.id === id)!.label : `#${id}`,
  );

  if (labels.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Matching you with anyone available</p>
    );
  }

  return (
    <div className="space-y-3 text-center">
      <p className="text-sm text-muted-foreground">Looking for someone who likes</p>
      <div className="flex flex-wrap justify-center gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
