import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CHARACTERS,
  QUESTIONS,
  readCompleted,
  writeCompleted,
  type AnyCharacterKey,
  type CharacterKey,
} from "@/lib/game-data";
import { predictWinner, submitTest } from "@/lib/game.functions";
import { statsQuery } from "@/lib/stats-query";
import { QrButton } from "@/components/QrModal";
import { Sigil } from "@/components/Sigil";
import { RadarChart } from "@/components/RadarChart";
import { PredictionScreen } from "@/components/PredictionScreen";
<<<<<<< HEAD
import type { AxisKey } from "@/lib/scoring.server";
=======
import { scoreChoices, type AxisKey } from "@/lib/scoring.server";
>>>>>>> 5ba2b08 (Initial commit)

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Who Are You in Silent Hill? — Psychological Test" },
      { name: "description", content: "A psychological test on how you face fear, guilt, and loss. Find your Silent Hill 2 character." },
      { property: "og:title", content: "Who Are You in Silent Hill?" },
      { property: "og:description", content: "8 scenes. 5 characters. Discover how you face fear, guilt, and loss." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

type Phase = "intro" | "test" | "submitting" | "predict" | "result";
type Axes = Record<AxisKey, number>;
type Percentile = { axis: AxisKey; pct: number } | null;

const AXIS_PHRASE: Record<AxisKey, string> = {
  guilt: "guilt-driven",
  denial: "denial-prone",
  fight: "fight-ready",
  hope: "hopeful",
};

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j] as T, b[i] as T];
  }
  return b;
}

function Game() {
  const submit = useServerFn(submitTest);
  const predict = useServerFn(predictWinner);
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [seed, setSeed] = useState(0);
  const [result, setResult] = useState<AnyCharacterKey | null>(null);
<<<<<<< HEAD
=======
  const [runnerUp, setRunnerUp] = useState<AnyCharacterKey | null>(null);
>>>>>>> 5ba2b08 (Initial commit)
  const [axes, setAxes] = useState<Axes | null>(null);
  const [percentile, setPercentile] = useState<Percentile>(null);
  const [previous, setPrevious] = useState<AnyCharacterKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const v = readCompleted();
    if (v.character && CHARACTERS[v.character]) setPrevious(v.character);
  }, []);

  const shuffled = useMemo(() => QUESTIONS.map((q) => ({ ...q, choices: shuffle(q.choices) })), [seed]);

  const start = () => {
    setSeed((s) => s + 1);
    setAnswers([]);
    setStep(0);
    setError(null);
    setPhase("test");
  };

  const send = async (all: string[]) => {
    setPhase("submitting");
    setError(null);
    try {
      const r = await submit({ data: { choices: all } });
      writeCompleted({ character: r.character, playerId: r.playerId, at: Date.now() });
      setPrevious(r.character);
      setResult(r.character);
<<<<<<< HEAD
=======
      setRunnerUp(r.runnerUp ?? null);
>>>>>>> 5ba2b08 (Initial commit)
      setAxes(r.axes);
      setPercentile(r.percentile);
      setPhase("predict");
    } catch {
<<<<<<< HEAD
      setError("The radio went silent. Your answers could not be sent.");
=======
      const fallback = scoreChoices(all);
      const ordered = (Object.keys(fallback.scores) as CharacterKey[]).sort((a, b) => fallback.scores[b] - fallback.scores[a]);
      const localRunnerUp = ordered[1] ?? null;
      writeCompleted({ character: fallback.character, at: Date.now() });
      setPrevious(fallback.character);
      setResult(fallback.character);
      setRunnerUp(localRunnerUp ?? null);
      setAxes(fallback.axes);
      setPercentile(null);
      setPhase("predict");
>>>>>>> 5ba2b08 (Initial commit)
    }
  };

  const onPredict = async (c: CharacterKey) => {
    const { playerId } = readCompleted();
    setBusy(true);
    try {
      if (playerId) {
        const r = await predict({ data: { playerId, prediction: c } });
        writeCompleted({ prediction: (r.prediction as CharacterKey) ?? c });
      } else {
        writeCompleted({ prediction: c });
      }
    } catch { /* prediction is optional; don't block the result */ }
    setBusy(false);
    setPhase("result");
  };

  const choose = (id: string) => {
    const next = [...answers, id];
    setAnswers(next);
    if (next.length === QUESTIONS.length) send(next);
    else setStep(step + 1);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-20">
      {phase === "intro" && <Intro onStart={start} previous={previous} onShowPrevious={() => { setResult(previous); setPhase("result"); }} />}
      {phase === "test" && (
        <Scene key={step} index={step} q={shuffled[step]!} onChoose={choose} />
      )}
      {phase === "submitting" && (
        <div className="fade-scene text-center">
          {error ? (
            <>
              <p className="font-display text-xl text-primary">{error}</p>
              <button onClick={() => send(answers)} className="mt-6 rounded bg-primary px-6 py-3 font-display text-primary-foreground">
                Try again
              </button>
            </>
          ) : (
            <p className="title-distressed text-2xl">The fog is deciding who you are…</p>
          )}
        </div>
      )}
      {phase === "predict" && <PredictionScreen onPredict={onPredict} busy={busy} />}
<<<<<<< HEAD
      {phase === "result" && result && <Result k={result} axes={axes} percentile={percentile} />}
=======
      {phase === "result" && result && <Result k={result} axes={axes} percentile={percentile} runnerUp={runnerUp} />}
>>>>>>> 5ba2b08 (Initial commit)
    </main>
  );
}

function Intro({ onStart, previous, onShowPrevious }: { onStart: () => void; previous: AnyCharacterKey | null; onShowPrevious: () => void }) {
  return (
    <section className="fade-scene text-center">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-primary">Silent Hill · Toluca Lake</p>
      <h1 className="title-distressed mt-6 text-5xl leading-tight sm:text-6xl">Who Are You in Silent Hill?</h1>
      <p className="mt-6 text-lg text-muted-foreground">A psychological test on how you face fear, guilt, and loss.</p>
      <div className="mt-10 flex flex-col items-center gap-4">
        {previous ? (
          <>
            <p className="text-sm text-muted-foreground">
              You've already walked through the fog as <span className={CHARACTERS[previous].colorClass}>{CHARACTERS[previous].name}</span>.
            </p>
            <button onClick={onShowPrevious} className="w-full max-w-xs rounded bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-[var(--glow-crimson)] transition hover:brightness-110">
              View my result
            </button>
            <Link to="/results" className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
              See class results
            </Link>
          </>
        ) : (
          <button onClick={onStart} className="w-full max-w-xs rounded bg-primary px-8 py-4 font-display text-xl text-primary-foreground shadow-[var(--glow-crimson)] transition hover:brightness-110">
            Enter the fog
          </button>
        )}
        <QrButton />
      </div>
      <p className="mt-12 text-xs text-muted-foreground/80">For fun only — not a psychological diagnosis. Anonymous.</p>
    </section>
  );
}

function Scene({ q, index, onChoose }: { q: (typeof QUESTIONS)[number]; index: number; onChoose: (id: string) => void }) {
  const pct = (index / QUESTIONS.length) * 100;
  return (
    <section className="fade-scene">
      <div className="mb-8">
        <div className="flex justify-between font-display text-xs uppercase tracking-widest text-muted-foreground">
          <span>Scene {index + 1} / {QUESTIONS.length}</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-muted">
          <div className="h-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <h2 className="font-display text-2xl leading-snug text-bone sm:text-3xl">{q.scene}</h2>
      <div className="mt-8 flex flex-col gap-3">
        {q.choices.map((c, i) => (
          <button key={c.id} onClick={() => onChoose(c.id)} className="choice-btn fade-scene" style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
            {c.text}
          </button>
        ))}
      </div>
    </section>
  );
}

<<<<<<< HEAD
function Result({ k, axes, percentile }: { k: AnyCharacterKey; axes: Axes | null; percentile: Percentile }) {
  const c = CHARACTERS[k];
  const qc = useQueryClient();
  const { data: stats } = useQuery(statsQuery);

  useEffect(() => {
    const ch = supabase
      .channel(`result-card-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, () => {
        qc.invalidateQueries({ queryKey: ["class-stats"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const total = stats?.total ?? 0;
  const mine = stats?.counts[k] ?? 0;
  const pct = total ? Math.round((mine / total) * 100) : 0;
  const isFavorite = stats?.dominant === k && total > 1;
  const rarity =
    k === "hidden"
      ? { label: "Hidden ending", text: "Almost nobody finds this." }
      : total < 2
        ? null
        : isFavorite
          ? { label: "The class favorite", text: `${pct}% of the class is ${c.name}.` }
          : pct < 15
            ? { label: "Rare", text: `Only ${pct}% of the class is ${c.name}.` }
            : { label: "Common", text: `${pct}% of the class is ${c.name}.` };

  return (
    <section className="reveal paper-card rounded-lg p-6 text-center sm:p-8">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">In Silent Hill, you are</p>
      <div className="mt-6 flex justify-center"><Sigil c={c} /></div>
      <h1 className={`mt-6 font-hand text-5xl ${c.colorClass}`}>{c.name}</h1>
      <p className="mt-2 font-display text-muted-foreground">{c.epithet}</p>

      {rarity && (
        <p className="mt-4 inline-block rounded border border-primary/50 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary">
          {rarity.label} <span className="ml-1 normal-case tracking-normal text-muted-foreground">{rarity.text}</span>
        </p>
      )}

      <p className="mt-6 text-left leading-relaxed text-foreground">{c.summary}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {c.traits.map((t) => (
          <span key={t} className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground">{t}</span>
        ))}
      </div>

      {axes && (
        <div className="mt-8">
          <h3 className="text-left font-display text-lg text-primary">Your shape in the fog</h3>
          <div className="mt-3"><RadarChart student={axes} average={stats && stats.total > 0 ? stats.axes : null} /></div>
          <p className="mt-1 text-xs text-muted-foreground">Your shape, against the class average.</p>
          {percentile && (
            <p className="mt-3 font-display text-sm text-bone">
              You are more {AXIS_PHRASE[percentile.axis]} than {percentile.pct}% of the class.
            </p>
          )}
        </div>
      )}

      <h3 className="mt-8 text-left font-display text-lg text-primary">How you cope</h3>
      <dl className="mt-3 space-y-3 text-left">
        {c.coping.map((x) => (
          <div key={x.label} className="border-l-2 border-primary/60 pl-3">
            <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{x.label}</dt>
            <dd className="text-sm">{x.text}</dd>
          </div>
        ))}
      </dl>

      <blockquote className="mt-8 rounded border border-border bg-background/40 p-4 text-left">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Talk about it</p>
        <p className="mt-1 font-hand text-lg text-bone">{c.question}</p>
      </blockquote>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link to="/results" className="w-full rounded bg-primary px-6 py-4 font-display text-lg text-primary-foreground shadow-[var(--glow-crimson)] transition hover:brightness-110">
          See Class Results
        </Link>
        <QrButton label="Show class QR code" />
      </div>
=======
function Result({ k }: { k: AnyCharacterKey; axes: Axes | null; percentile: Percentile; runnerUp: AnyCharacterKey | null }) {
  const c = CHARACTERS[k];

  return (
    <section className="reveal paper-card rounded-lg p-6 text-center sm:p-8">
      <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Your match</p>

      <div className="mx-auto mt-6 flex h-52 w-full max-w-xs items-center justify-center rounded border border-primary/60 bg-black/20 p-4">
        <div className="text-center">
          <Sigil c={c} size="lg" />
          <p className="mt-3 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Character photo</p>
        </div>
      </div>

      <h1 className={`mt-6 font-hand text-4xl ${c.colorClass}`}>{c.name}</h1>
      <p className="mt-2 font-display text-sm text-muted-foreground">{c.epithet}</p>

      <p className="mt-6 font-display text-sm leading-relaxed text-bone">
        Based on your answers, this person feels like you.
      </p>

      <p className="mt-6 font-display text-base leading-relaxed text-primary">
        Play the game to discover your character.
      </p>
>>>>>>> 5ba2b08 (Initial commit)
    </section>
  );
}
