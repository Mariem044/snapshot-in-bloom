import { createServerFn } from "@tanstack/react-start";
import type { CharacterKey } from "./game-data";

const ADMIN_FALLBACK = "silenthill2026";
function checkKey(key: string) {
  const expected = process.env.ADMIN_KEY || ADMIN_FALLBACK;
  if (key !== expected) throw new Error("Invalid admin key");
}

async function insertRun(choices: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { scoreChoices } = await import("./scoring.server");
  const { character, scores } = scoreChoices(choices);
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
  });
  if (rErr) throw new Error("Could not save result");
  return { character, playerId: player.id };
}

export const submitTest = createServerFn({ method: "POST" })
  .inputValidator((d: { choices: string[] }) => {
    if (!Array.isArray(d?.choices) || d.choices.length !== 8 || !d.choices.every((c) => typeof c === "string"))
      throw new Error("Invalid answers");
    return { choices: d.choices.map((c) => c.slice(0, 8)) };
  })
  .handler(async ({ data }) => {
    const { character } = await insertRun(data.choices);
    return { character: character as CharacterKey };
  });

export type ClassStats = { total: number; counts: Record<CharacterKey, number> };

async function readStats(): Promise<ClassStats> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const counts: Record<CharacterKey, number> = { james: 0, maria: 0, angela: 0, eddie: 0, laura: 0 };
  const keys = Object.keys(counts) as CharacterKey[];
  await Promise.all(
    keys.map(async (k) => {
      const { count } = await supabaseAdmin.from("results").select("id", { count: "exact", head: true }).eq("character", k);
      counts[k] = count ?? 0;
    }),
  );
  return { total: keys.reduce((s, k) => s + counts[k], 0), counts };
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
    return { ok: true };
  });
