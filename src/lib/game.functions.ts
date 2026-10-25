import { createServerFn } from "@tanstack/react-start";
import { CHARACTER_KEYS, HIDDEN_KEY, type AnyCharacterKey, type CharacterKey } from "./game-data";
import type { AxisKey, Axes } from "./scoring.server";

const ADMIN_FALLBACK = "silenthill2026";
function checkKey(key: string) {
  const expected = process.env['ADMIN_KEY'] || ADMIN_FALLBACK;
  if (key !== expected) throw new Error("Invalid admin key");
}

const ALL_CHARACTERS: AnyCharacterKey[] = [...CHARACTER_KEYS, HIDDEN_KEY];

async function insertRun(choices: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { scoreChoices } = await import("./scoring.server");
  const { character, scores, axes } = scoreChoices(choices);
<<<<<<< HEAD
=======
  const ranked = (Object.keys(scores) as Array<keyof typeof scores>).sort((a, b) => scores[b] - scores[a]);
  const runnerUp = ranked[1] ?? null;
>>>>>>> 5ba2b08 (Initial commit)
  const { data: player, error: pErr } = await supabaseAdmin.from("players").insert({}).select("id").single();
  if (pErr || !player) throw new Error("Could not save player");
  const { error: aErr } = await supabaseAdmin
    .from("answers")
    .insert(choices.map((c, i) => ({ player_id: player.id, question_id: i + 1, choice_id: c })));
  if (aErr) throw new Error("Could not save answers");
  const { error: rErr } = await supabaseAdmin.from("results").insert({
    player_id: player.id,
    character,
    score_james: scores.james,
    score_maria: scores.maria,
    score_angela: scores.angela,
    score_eddie: scores.eddie,
    score_laura: scores.laura,
    score_guilt: axes.guilt,
    score_denial: axes.denial,
    score_fight: axes.fight,
    score_hope: axes.hope,
  });
  if (rErr) throw new Error("Could not save result");
<<<<<<< HEAD
  return { character, playerId: player.id, axes };
=======
  return { character, playerId: player.id, axes, runnerUp };
>>>>>>> 5ba2b08 (Initial commit)
}

export const submitTest = createServerFn({ method: "POST" })
  .inputValidator((d: { choices: string[] }) => {
    if (!Array.isArray(d?.choices) || d.choices.length !== 8 || !d.choices.every((c) => typeof c === "string"))
      throw new Error("Invalid answers");
    return { choices: d.choices.map((c) => c.slice(0, 8)) };
  })
  .handler(async ({ data }) => {
<<<<<<< HEAD
    const { character, playerId, axes } = await insertRun(data.choices);
=======
    const { character, playerId, axes, runnerUp } = await insertRun(data.choices);
>>>>>>> 5ba2b08 (Initial commit)

    // Percentile of the student's strongest axis vs the rest of the class.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("results")
      .select("score_guilt, score_denial, score_fight, score_hope")
      .neq("player_id", playerId);
    let percentile: { axis: AxisKey; pct: number } | null = null;
    if (rows && rows.length > 0) {
      const axis = (Object.keys(axes) as AxisKey[]).reduce((a, b) => (axes[a] >= axes[b] ? a : b));
      const col = `score_${axis}` as const;
      const mine = axes[axis];
      const below = rows.filter((r) => (r[col] as number) < mine).length;
      percentile = { axis, pct: Math.round((below / rows.length) * 100) };
    }
<<<<<<< HEAD
    return { character: character as AnyCharacterKey, playerId, axes, percentile };
=======
    return { character: character as AnyCharacterKey, playerId, axes, percentile, runnerUp: runnerUp as AnyCharacterKey | null };
>>>>>>> 5ba2b08 (Initial commit)
  });

export const predictWinner = createServerFn({ method: "POST" })
  .inputValidator((d: { playerId: string; prediction: string }) => ({
    playerId: String(d?.playerId ?? ""),
    prediction: String(d?.prediction ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!CHARACTER_KEYS.includes(data.prediction as CharacterKey)) throw new Error("Invalid prediction");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated } = await supabaseAdmin
      .from("players")
      .update({ prediction: data.prediction })
      .eq("id", data.playerId)
      .is("prediction", null)
      .select("prediction");
    if (updated && updated.length > 0) return { ok: true, prediction: data.prediction };
    const { data: existing } = await supabaseAdmin
      .from("players")
      .select("prediction")
      .eq("id", data.playerId)
      .single();
    if (existing?.prediction) return { ok: false, already: true, prediction: existing.prediction };
    throw new Error("Could not save prediction");
  });

export type ClassStats = {
  total: number;
  counts: Record<AnyCharacterKey, number>;
  axes: Axes;
  verdict: string;
  revealed: boolean;
  dominant: AnyCharacterKey | null;
  predictions: { total: number; correct: number; pct: number };
};

async function isRevealed(): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("settings").select("value").eq("key", "revealed").maybeSingle();
  return data?.value === "true";
}

async function readStats(): Promise<ClassStats> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { classVerdict } = await import("./scoring.server");
  const counts = Object.fromEntries(ALL_CHARACTERS.map((k) => [k, 0])) as Record<AnyCharacterKey, number>;
  const [{ data: rows }, { data: preds }, revealed] = await Promise.all([
    supabaseAdmin.from("results").select("character, score_guilt, score_denial, score_fight, score_hope"),
    supabaseAdmin.from("players").select("prediction").not("prediction", "is", null),
    isRevealed(),
  ]);
  const list = rows ?? [];
  for (const r of list) {
    const k = r.character as AnyCharacterKey;
    if (k in counts) counts[k] += 1;
  }
  const total = list.length;
  const axes: Axes = { guilt: 0, denial: 0, fight: 0, hope: 0 };
  if (total > 0) {
    for (const r of list) {
      axes.guilt += r.score_guilt; axes.denial += r.score_denial;
      axes.fight += r.score_fight; axes.hope += r.score_hope;
    }
    (Object.keys(axes) as AxisKey[]).forEach((k) => { axes[k] = Math.round(axes[k] / total); });
  }
  const dominant = total > 0
    ? (CHARACTER_KEYS.reduce((a, b) => (counts[a] >= counts[b] ? a : b)) as AnyCharacterKey)
    : null;
  const predList = (preds ?? []).map((p) => p.prediction as string);
  const correct = dominant ? predList.filter((p) => p === dominant).length : 0;
  return {
    total,
    counts,
    axes,
    verdict: classVerdict(axes, dominant),
    revealed,
    dominant,
    predictions: {
      total: predList.length,
      correct,
      pct: predList.length ? Math.round((correct / predList.length) * 100) : 0,
    },
  };
}

export const getClassStats = createServerFn({ method: "GET" }).handler(() => readStats());

export const adminStats = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => ({ key: String(d?.key ?? "") }))
  .handler(async ({ data }) => {
    checkKey(data.key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [stats, players, answers] = await Promise.all([
      readStats(),
      supabaseAdmin.from("players").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("answers").select("id", { count: "exact", head: true }),
    ]);
    return { ...stats, players: players.count ?? 0, answers: answers.count ?? 0 };
  });

export const adminReveal = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; revealed: boolean }) => ({
    key: String(d?.key ?? ""),
    revealed: Boolean(d?.revealed),
  }))
  .handler(async ({ data }) => {
    checkKey(data.key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ key: "revealed", value: data.revealed ? "true" : "false" });
    if (error) throw new Error("Could not update reveal state");
    return { ok: true, revealed: data.revealed };
  });

export const adminSeed = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string; count?: number }) => ({
    key: String(d?.key ?? ""),
    count: Math.min(Math.max(Number(d?.count) || 24, 1), 60),
  }))
  .handler(async ({ data }) => {
    checkKey(data.key);
    const { randomChoices } = await import("./scoring.server");
    for (let i = 0; i < data.count; i++) await insertRun(randomChoices());
    return { ok: true, added: data.count };
  });

export const adminReset = createServerFn({ method: "POST" })
  .inputValidator((d: { key: string }) => ({ key: String(d?.key ?? "") }))
  .handler(async ({ data }) => {
    checkKey(data.key);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("players").delete().not("id", "is", null);
    if (error) throw new Error("Reset failed");
    await supabaseAdmin.from("settings").delete().not("key", "is", null);
    return { ok: true };
  });
