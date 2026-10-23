import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { CHARACTERS, COMPLETED_KEY, QUESTIONS, type CharacterKey } from "@/lib/game-data";
import { submitTest } from "@/lib/game.functions";
import { QrButton } from "@/components/QrModal";
import { Sigil } from "@/components/Sigil";

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

type Phase = "intro" | "test" | "submitting" | "result";

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
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [seed, setSeed] = useState(0);
  const [result, setResult] = useState<CharacterKey | null>(null);
  const [previous, setPrevious] = useState<CharacterKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPLETED_KEY);
      if (raw) {
        const v = JSON.parse(raw) as { character?: CharacterKey };
        if (v.character && CHARACTERS[v.character]) setPrevious(v.character);
      }
    } catch { /* ignore */ }
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
      localStorage.setItem(COMPLETED_KEY, JSON.stringify({ character: r.character, at: Date.now() }));
      setPrevious(r.character);
      setResult(r.character);
      setPhase("result");
    } catch {
      setError("The radio went silent. Your answers could not be sent.");
    }
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
      {phase === "result" && result && <Result k={result} />}
    </main>
  );
}

function Intro({ onStart, previous, onShowPrevious }: { onStart: () => void; previous: CharacterKey | null; onShowPrevious: () => void }) {
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

function Result({ k }: { k: CharacterKey }) {
  const c = CHARACTERS[k];
  return (
    <section className="reveal paper-card rounded-lg p-6 text-center sm:p-8">
      <p className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">In Silent Hill, you are</p>
      <div className="mt-6 flex justify-center"><Sigil c={c} /></div>
      <h1 className={`mt-6 font-hand text-5xl ${c.colorClass}`}>{c.name}</h1>
      <p className="mt-2 font-display text-muted-foreground">{c.epithet}</p>
      <p className="mt-6 text-left leading-relaxed text-foreground">{c.summary}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {c.traits.map((t) => (
          <span key={t} className="rounded border border-border px-2.5 py-1 text-xs text-muted-foreground">{t}</span>
        ))}
      </div>
      <h3 className="mt-8 text-left font-display text-lg text-primary">How you cope</h3>
      <dl className="mt-3 space-y-3 text-left">
        {c.coping.map((x) => (
          <div key={x.label} className="border-l-2 border-primary/60 pl-3">
            <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{x.label}</dt>
            <dd className="text-sm">{x.text}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link to="/results" className="w-full rounded bg-primary px-6 py-4 font-display text-lg text-primary-foreground shadow-[var(--glow-crimson)] transition hover:brightness-110">
          See Class Results
        </Link>
        <QrButton label="Show class QR code" />
      </div>
    </section>
  );
}
