import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getClassStats } from "@/lib/game.functions";
import { CHARACTERS, CHARACTER_KEYS, type CharacterKey } from "@/lib/game-data";
import { Sigil } from "@/components/Sigil";
import { QrButton } from "@/components/QrModal";

const statsQuery = queryOptions({ queryKey: ["class-stats"], queryFn: () => getClassStats(), refetchInterval: 15000 });

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Live Class Results — Who Are You in Silent Hill?" },
      { name: "description", content: "Live breakdown of which Silent Hill 2 characters the class turned out to be." },
      { property: "og:title", content: "Live Class Results — Silent Hill Test" },
      { property: "og:description", content: "See how the whole class faces fear, guilt, and loss." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  component: Results,
});

function Results() {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(statsQuery);
  const [active, setActive] = useState<CharacterKey | null>(null);

  useEffect(() => {
    const ch = supabase
      .channel(`results-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, () => {
        qc.invalidateQueries({ queryKey: ["class-stats"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const sorted = [...CHARACTER_KEYS].sort((a, b) => data.counts[b] - data.counts[a]);
  const dominant = data.total > 0 ? sorted[0] : null;
  const pct = (k: CharacterKey) => (data.total ? Math.round((data.counts[k] / data.total) * 100) : 0);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-20">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-primary">Live · Class Results</p>
      <h1 className="title-distressed mt-3 text-4xl sm:text-5xl">Who is the class?</h1>
      <p className="mt-3 font-display text-lg text-muted-foreground">
        <span className="text-3xl text-bone">{data.total}</span> {data.total === 1 ? "soul has" : "souls have"} entered the fog
      </p>

      {dominant && (
        <div className="paper-card reveal mt-8 flex items-center gap-5 rounded-lg p-5">
          <Sigil c={CHARACTERS[dominant]} size="sm" />
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Dominant Class Archetype</p>
            <p className={`font-hand text-3xl ${CHARACTERS[dominant].colorClass}`}>{CHARACTERS[dominant].name}</p>
            <p className="text-sm text-muted-foreground">{pct(dominant)}% · {CHARACTERS[dominant].epithet}</p>
          </div>
        </div>
      )}

      <ul className="mt-8 space-y-3">
        {sorted.map((k) => {
          const c = CHARACTERS[k];
          const on = active === k;
          return (
            <li key={k}>
              <button
                onClick={() => setActive(on ? null : k)}
                className="choice-btn block"
                aria-expanded={on}
              >
                <div className="flex items-baseline justify-between">
                  <span className={`font-display text-lg ${c.colorClass}`}>{c.name}</span>
                  <span className="font-display text-sm text-muted-foreground">
                    {data.counts[k]} · <span className="text-bone">{pct(k)}%</span>
                  </span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded bg-muted">
                  <div className={`h-full ${c.bgClass} transition-all duration-1000`} style={{ width: `${pct(k)}%` }} />
                </div>
                {on && <p className="mt-3 text-sm text-muted-foreground fade-scene">{c.summary}</p>}
              </button>
            </li>
          );
        })}
      </ul>

      {data.total === 0 && <p className="mt-6 text-center text-muted-foreground">No one has answered yet. Share the QR code.</p>}

      <div className="mt-10 flex flex-col items-center gap-3">
        <QrButton label="Show class QR code" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to the start</Link>
      </div>
    </main>
  );
}
