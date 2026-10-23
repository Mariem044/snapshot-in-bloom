import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { adminReset, adminSeed, adminStats } from "@/lib/game.functions";
import { CHARACTERS, CHARACTER_KEYS } from "@/lib/game-data";

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>) => ({ key: typeof s['key'] === "string" ? s['key'] : "" }),
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
  const { key: urlKey } = Route.useSearch();
  const [key, setKey] = useState(urlKey);
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const fetchStats = useServerFn(adminStats);
  const seed = useServerFn(adminSeed);
  const reset = useServerFn(adminReset);

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
      </ul>
      {err && <p className="mt-4 text-sm text-primary">{err}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button disabled={busy} onClick={() => run(() => seed({ data: { key, count: 24 } }))} className="flex-1 rounded border border-primary px-4 py-3 font-display text-primary transition hover:bg-primary/10 disabled:opacity-50">
          {busy ? "Working…" : "Seed Mock Class Data (24)"}
        </button>
        <button disabled={busy} onClick={() => setConfirm(true)} className="flex-1 rounded bg-destructive px-4 py-3 font-display text-destructive-foreground disabled:opacity-50">
          Reset All Class Data
        </button>
      </div>
      <div className="mt-6 flex gap-4 text-sm">
        <Link to="/results" className="text-muted-foreground hover:text-primary">Open live results →</Link>
      </div>

      {confirm && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-80 flex items-center justify-center bg-background/90 p-5 backdrop-blur">
          <div className="paper-card w-full max-w-sm rounded-lg p-6 fade-scene">
            <h2 className="font-display text-2xl text-bone">Erase every answer?</h2>
            <p className="mt-2 text-sm text-muted-foreground">All players, answers and results will be permanently deleted.</p>
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
