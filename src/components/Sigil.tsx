import type { Character } from "@/lib/game-data";
import { cn } from "@/lib/utils";

export function Sigil({ c, size = "lg" }: { c: Character; size?: "sm" | "lg" }) {
  const big = size === "lg";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 border-current",
        c.colorClass,
        big ? "h-36 w-36" : "h-10 w-10",
      )}
      style={{ boxShadow: "0 0 40px -6px currentColor, inset 0 0 30px -10px currentColor" }}
    >
      <div className={cn("absolute rounded-full border border-current opacity-40", big ? "inset-3" : "inset-1")} />
      <span className={cn("font-display", big ? "text-6xl" : "text-lg")}>{c.sigil}</span>
    </div>
  );
}
