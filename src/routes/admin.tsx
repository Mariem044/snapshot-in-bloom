import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminReveal, adminReset, adminSeed, adminStats } from "@/lib/game.functions";
import { CHARACTERS, CHARACTER_KEYS } from "@/lib/game-data";

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>) => ({
    key: typeof s['key'] === "string" ? s['key'] : "",
    screen: typeof s['screen'] === "string" ? s['screen'] : "",
  }),
  head: () => ({
    meta: [
      { title: "Presenter Admin — Silent Hill Test" },
      { name: "description", content: "Presenter controls for the Silent Hill classroom test." },
      { property: "og:title", content: "Presenter Admin — Silent Hill Test" },
      { property: "og:description", content: "Presenter controls for the classroom test." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Stats = Awaited<ReturnType<typeof adminStats>>;

function Admin() {
  const { key: urlKey, screen } = Route.useSearch();
  const [key, setKey] = useState(urlKey);
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const fetchStats = useServerFn(adminStats);
  const seed = useServerFn(adminSeed);
  const reset = useServerFn(adminReset);
  const reveal = useServerFn(adminReveal);

  const load = useCallback(async () => {
    if (!key) return;
    try {
      setStats(await fetchStats({ data: { key } }));
      setErr(null);
    } catch {
      setErr("Wrong key.");
      setStats(null);
    }
  }, [key, fetchStats]);

  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); await load(); } catch { setErr("Action failed."); } finally { setBusy(false); }
  };

  if (!stats) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
        <form
          className="paper-card rounded-lg p-6"
          onSubmit={(e) => { e.preventDefault(); setKey(input); }}
        >
          <h1 className="title-distressed text-3xl">Presenter access</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin key"
            className="mt-5 w-full rounded border border-input bg-background px-3 py-3 text-foreground outline-none focus:border-primary"
          />
          {err && <p className="mt-2 text-sm text-primary">{err}</p>}
          <button className="mt-4 w-full rounded bg-primary py-3 font-display text-primary-foreground">Unlock</button>
        </form>
      </main>
    );
  }

  if (screen === "1") return <ScreenView stats={stats} />;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-20">
      <h1 className="title-distressed text-4xl">Presenter Panel</h1>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[["Players", stats.players], ["Answers", stats.answers], ["Results", stats.total]].map(([l, v]) => (
          <div key={l} className="paper-card rounded p-4 text-center">
            <p className="font-display text-3xl text-bone">{v}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <ul className="mt-6 space-y-1">
        {CHARACTER_KEYS.map((k) => (
          <li key={k} className="flex justify-between border-b border-border py-2 font-display">
            <span className={CHARACTERS[k].colorClass}>{CHARACTERS[k].name}</span>
            <span>{stats.counts[k]}</span>
          </li>
        ))}
        <li className="flex justify-between border-b border-border py-2 font-display">
          <span className={CHARACTERS.hidden.colorClass}>{CHARACTERS.hidden.name}</span>
          <span>{stats.counts.hidden}</span>
        </li>
      </ul>

      <div className="paper-card mt-6 flex items-center justify-between rounded-lg p-4">
        <div>
          <p className="font-display text-lg text-bone">Reveal class results</p>
          <p className="text-xs text-muted-foreground">
            {stats.revealed ? "Students can see the results page." : "Students see a waiting screen."}
          </p>
        </div>
        <button
          disabled={busy}
          onClick={() => run(() => reveal({ data: { key, revealed: !stats.revealed } }))}
          aria-pressed={stats.revealed}
          className={`relative h-8 w-14 rounded-full border transition disabled:opacity-50 ${
            stats.revealed ? "border-primary bg-primary/30" : "border-border bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full transition-all ${
              stats.revealed ? "left-7 bg-primary" : "left-1 bg-muted-foreground"
            }`}
          />
        </button>
      </div>

      {err && <p className="mt-4 text-sm text-primary">{err}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button disabled={busy} onClick={() => run(() => seed({ data: { key, count: 24 } }))} className="flex-1 rounded border border-primary px-4 py-3 font-display text-primary transition hover:bg-primary/10 disabled:opacity-50">
          {busy ? "Working…" : "Seed Mock Class Data (24)"}
        </button>
        <button disabled={busy} onClick={() => setConfirm(true)} className="flex-1 rounded bg-destructive px-4 py-3 font-display text-destructive-foreground disabled:opacity-50">
          Reset All Class Data
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link to="/results" className="text-muted-foreground hover:text-primary">Open live results →</Link>
        <Link to="/admin" search={{ key, screen: "1" }} className="text-muted-foreground hover:text-primary">Projector view →</Link>
      </div>

      {confirm && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-80 flex items-center justify-center bg-background/90 p-5 backdrop-blur">
          <div className="paper-card w-full max-w-sm rounded-lg p-6 fade-scene">
            <h2 className="font-display text-2xl text-bone">Erase every answer?</h2>
            <p className="mt-2 text-sm text-muted-foreground">All players, answers and results will be permanently deleted, and the results will be hidden again.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConfirm(false)} className="flex-1 rounded border border-border py-3">Cancel</button>
              <button
                onClick={() => { setConfirm(false); run(() => reset({ data: { key } })); }}
                className="flex-1 rounded bg-destructive py-3 font-display text-destructive-foreground"
              >
                Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ScreenView({ stats }: { stats: Stats }) {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`screen-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "results" }, () => {
        qc.invalidateQueries();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const sorted = [...CHARACTER_KEYS].sort((a, b) => stats.counts[b] - stats.counts[a]);
  const dominant = stats.total > 0 ? sorted[0] : null;
  const pct = (k: (typeof CHARACTER_KEYS)[number]) => (stats.total ? Math.round((stats.counts[k] / stats.total) * 100) : 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-10 py-16">
      <p className="text-center font-display text-sm uppercase tracking-[0.5em] text-primary">Silent Hill · Class Results</p>
      <p className="paper-card mt-8 rounded-lg p-8 text-center font-display text-3xl leading-snug text-bone sm:text-4xl">
        {stats.verdict}
      </p>
      {dominant && (
        <p className="mt-8 text-center">
          <span className="font-display text-xl uppercase tracking-widest text-muted-foreground">The class is mostly </span>
          <span className={`font-hand text-5xl ${CHARACTERS[dominant].colorClass}`}>{CHARACTERS[dominant].name}</span>
        </p>
      )}
      <ul className="mt-10 space-y-5">
        {sorted.map((k) => (
          <li key={k}>
            <div className="flex items-baseline justify-between">
              <span className={`font-display text-2xl ${CHARACTERS[k].colorClass}`}>{CHARACTERS[k].name}</span>
              <span className="font-display text-2xl text-bone">{pct(k)}%</span>
            </div>
            <div className="mt-2 h-5 w-full overflow-hidden rounded bg-muted">
              <div className={`h-full ${CHARACTERS[k].bgClass} transition-all duration-1000`} style={{ width: `${pct(k)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center font-display text-2xl text-muted-foreground">
        <span className="text-4xl text-bone">{stats.total}</span> {stats.total === 1 ? "soul has" : "souls have"} entered the fog
      </p>
    </main>
  );
}
