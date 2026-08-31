import { Search, Sparkle } from "lucide-react";

export function MatchingAnimation() {
  return (
    <div className="relative mx-auto grid h-56 w-56 place-items-center">
      <span className="absolute inset-0 rounded-full bg-primary/25 blur-3xl animate-pulse-glow" />
      <span className="absolute inset-6 rounded-full border border-primary/30" />
      <span className="absolute inset-12 rounded-full border border-primary/20" />
      <span className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-primary glow animate-float">
        <Search className="h-10 w-10 text-primary-foreground" />
      </span>
      <Sparkle className="absolute left-6 top-8 h-4 w-4 text-primary-glow animate-pulse-glow" />
      <Sparkle className="absolute bottom-10 right-6 h-5 w-5 text-primary-glow animate-pulse-glow" />
    </div>
  );
}
