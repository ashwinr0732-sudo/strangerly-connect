export function TypingIndicator({ name = "Stranger" }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
      <span>{name} is typing</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse-glow"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </span>
    </div>
  );
}
