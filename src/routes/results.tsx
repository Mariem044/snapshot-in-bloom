import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { predictWinner } from "@/lib/game.functions";
import { statsQuery } from "@/lib/stats-query";
import {
  CHARACTERS,
  CHARACTER_KEYS,
  HIDDEN_KEY,
  readCompleted,
  writeCompleted,
  type AnyCharacterKey,
  type CharacterKey,
} from "@/lib/game-data";
import { Sigil } from "@/components/Sigil";
import { QrButton } from "@/components/QrModal";
import { PredictionScreen } from "@/components/PredictionScreen";

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
  const predict = useServerFn(predictWinner);
  const [active, setActive] = useState<AnyCharacterKey | null>(null);
  const [mustPredict, setMustPredict] = useState(false);
  const [ownGuess, setOwnGuess] = useState<CharacterKey | null>(null);
  const [busy, setBusy] = useState(false);

  // Reveal animation state: bars rise one by one (lowest first), then a drumroll, then the banner.
  const [bannerVisible, setBannerVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const wasRevealed = useRef<boolean | null>(null);

  useEffect(() => {
    const done = readCompleted();
    if (done.prediction) setOwnGuess(done.prediction);
    if (done.playerId && !done.prediction) setMustPredict(true);
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel(`results-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, () => {
        qc.invalidateQueries({ queryKey: ["class-stats"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => {
        qc.invalidateQueries({ queryKey: ["class-stats"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  useEffect(() => {
    if (wasRevealed.current === null) {
      // First load: if already revealed, no animation for late joiners.
      wasRevealed.current = data.revealed;
      if (data.revealed) setBannerVisible(true);
      return;
    }
    if (data.revealed && !wasRevealed.current) {
      wasRevealed.current = true;
      setAnimating(true);
      const t = setTimeout(() => {
        setBannerVisible(true);
        setAnimating(false);
      }, CHARACTER_KEYS.length * 350 + 1200);
      return () => clearTimeout(t);
    }
    if (!data.revealed) wasRevealed.current = false;
  }, [data.revealed]);

  const onPredict = async (c: CharacterKey) => {
    const { playerId } = readCompleted();
    setBusy(true);
    try {
      if (playerId) {
        const r = await predict({ data: { playerId, prediction: c } });
        const saved = (r.prediction as CharacterKey) ?? c;
        writeCompleted({ prediction: saved });
        setOwnGuess(saved);
      } else {
        writeCompleted({ prediction: c });
        setOwnGuess(c);
      }
    } catch { /* ignore */ }
    setBusy(false);
    setMustPredict(false);
    qc.invalidateQueries({ queryKey: ["class-stats"] });
  };

  if (mustPredict) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-20">
        <PredictionScreen onPredict={onPredict} busy={busy} />
      </main>
    );
  }

  if (!data.revealed) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5 py-20 text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary">Live · Class Results</p>
        <h1 className="title-distressed mt-6 text-4xl sm:text-5xl">The fog hasn't lifted yet…</h1>
        <p className="mt-6 max-w-sm text-muted-foreground fade-scene">
          The presenter is still gathering the class's answers. Stay here — this page will clear on its own.
        </p>
        <p className="mt-10 font-display text-sm text-muted-foreground drumroll">{data.total} {data.total === 1 ? "soul" : "souls"} in the fog so far</p>
      </main>
    );
  }

  const sorted = [...CHARACTER_KEYS].sort((a, b) => data.counts[b] - data.counts[a]);
  const dominant = data.total > 0 ? sorted[0] : null;
  const pct = (k: AnyCharacterKey) => (data.total ? Math.round((data.counts[k] / data.total) * 100) : 0);
  const hiddenCount = data.counts[HIDDEN_KEY];

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-20">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-primary">Live · Class Results</p>
      <h1 className="title-distressed mt-3 text-4xl sm:text-5xl">Who is the class?</h1>

      <p className="paper-card mt-6 rounded-lg p-4 font-display text-lg leading-snug text-bone fade-scene">
        {data.verdict}
      </p>

      <p className="mt-4 font-display text-lg text-muted-foreground">
        <span className="text-3xl text-bone">{data.total}</span> {data.total === 1 ? "soul has" : "souls have"} entered the fog
      </p>

      {dominant && bannerVisible && (
        <div className="paper-card reveal mt-8 flex items-center gap-5 rounded-lg p-5">
          <Sigil c={CHARACTERS[dominant]} size="sm" />
          <div>
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Dominant Class Archetype</p>
            <p className={`font-hand text-3xl ${CHARACTERS[dominant].colorClass}`}>{CHARACTERS[dominant].name}</p>
            <p className="text-sm text-muted-foreground">{pct(dominant)}% · {CHARACTERS[dominant].epithet}</p>
          </div>
        </div>
      )}
      {dominant && !bannerVisible && (
        <p className="drumroll mt-8 text-center font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
          The fog is lifting…
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {sorted.map((k, displayIndex) => {
          const c = CHARACTERS[k];
          const on = active === k;
          // Lowest count rises first.
          const delay = animating ? (sorted.length - 1 - displayIndex) * 350 : 0;
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
                  <div
                    className={`h-full ${c.bgClass} ${animating ? "bar-rise" : "transition-all duration-1000"}`}
                    style={{ width: `${pct(k)}%`, animationDelay: `${delay}ms` }}
                  />
                </div>
                {on && <p className="mt-3 text-sm text-muted-foreground fade-scene">{c.summary}</p>}
              </button>
            </li>
          );
        })}
        {/* Mystery bar: the hidden ending stays "???" until someone finds it. */}
        <li>
          <div className="choice-btn block cursor-default opacity-80">
            <div className="flex items-baseline justify-between">
              <span className={`font-display text-lg ${hiddenCount > 0 ? CHARACTERS.hidden.colorClass : "text-muted-foreground"}`}>
                {hiddenCount > 0 ? CHARACTERS.hidden.name : "???"}
              </span>
              <span className="font-display text-sm text-muted-foreground">
                {hiddenCount > 0 ? <>{hiddenCount} · <span className="text-bone">{pct(HIDDEN_KEY)}%</span></> : "someone found it?"}
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded bg-muted">
              <div
                className={`h-full ${CHARACTERS.hidden.bgClass} ${animating ? "bar-rise" : "transition-all duration-1000"}`}
                style={{ width: `${pct(HIDDEN_KEY)}%`, animationDelay: `${animating ? sorted.length * 350 : 0}ms` }}
              />
            </div>
          </div>
        </li>
      </ul>

      {data.predictions.total > 0 && (
        <div className="paper-card mt-8 rounded-lg p-4 text-center fade-scene">
          <p className="font-display text-sm text-muted-foreground">
            <span className="text-2xl text-bone">{data.predictions.pct}%</span> of the class guessed right
          </p>
          {ownGuess && (
            <p className="mt-2 text-sm">
              Your guess: <span className={CHARACTERS[ownGuess].colorClass}>{CHARACTERS[ownGuess].name}</span>{" "}
              {dominant && (ownGuess === dominant
                ? <span className="font-display text-primary">— you called it.</span>
                : <span className="font-display text-muted-foreground">— the fog fooled you.</span>)}
            </p>
          )}
        </div>
      )}

      {data.total === 0 && <p className="mt-6 text-center text-muted-foreground">No one has answered yet. Share the QR code.</p>}

      <div className="mt-10 flex flex-col items-center gap-3">
        <QrButton label="Show class QR code" />
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Back to the start</Link>
      </div>
    </main>
  );
}
