import { CHARACTER_KEYS, CHARACTERS, type CharacterKey } from "@/lib/game-data";
import { Sigil } from "./Sigil";

export function PredictionScreen({ onPredict, busy }: { onPredict: (c: CharacterKey) => void; busy?: boolean }) {
  return (
    <section className="fade-scene text-center">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-primary">One last thing</p>
      <h2 className="title-distressed mt-4 text-3xl leading-tight sm:text-4xl">Which character will win the class?</h2>
      <p className="mt-3 text-sm text-muted-foreground">Place your bet before the fog lifts. You only get one guess.</p>
      <div className="mt-8 flex flex-col gap-3">
        {CHARACTER_KEYS.map((k, i) => {
          const c = CHARACTERS[k];
          return (
            <button
              key={k}
              disabled={busy}
              onClick={() => onPredict(k)}
              className="choice-btn fade-scene flex items-center gap-4 disabled:opacity-50"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <Sigil c={c} size="sm" />
              <span className={`font-display text-lg ${c.colorClass}`}>{c.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
