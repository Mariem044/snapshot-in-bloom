import type { AnyCharacterKey, CharacterKey } from "./game-data";

// Secret scoring matrix: choice id -> character. Server-only.
const MATRIX: Record<string, CharacterKey> = {
  x4k: "james", b9r: "maria", m2t: "angela", q7v: "eddie", h1z: "laura",
  p3w: "james", f8n: "maria", k5d: "angela", r2c: "eddie", u6j: "laura",
  e7s: "james", w1y: "maria", g4h: "angela", t9a: "eddie", n3o: "laura",
  z5l: "james", c2m: "maria", j8b: "angela", y6f: "eddie", d1q: "laura",
  s4e: "james", a9u: "maria", v3i: "angela", o7g: "eddie", l2x: "laura",
  i6p: "james", h8w: "maria", b1k: "angela", m5r: "eddie", q3t: "laura",
  f2v: "james", k9z: "maria", r4n: "angela", u1d: "eddie", e5c: "laura",
  w7j: "james", g3s: "maria", t6y: "angela", n2a: "eddie", z8o: "laura",
};

const QUESTION_CHOICES: string[][] = [
  ["x4k", "b9r", "m2t", "q7v", "h1z"],
  ["p3w", "f8n", "k5d", "r2c", "u6j"],
  ["e7s", "w1y", "g4h", "t9a", "n3o"],
  ["z5l", "c2m", "j8b", "y6f", "d1q"],
  ["s4e", "a9u", "v3i", "o7g", "l2x"],
  ["i6p", "h8w", "b1k", "m5r", "q3t"],
  ["f2v", "k9z", "r4n", "u1d", "e5c"],
  ["w7j", "g3s", "t6y", "n2a", "z8o"],
];

// ---- Hidden trait axes (server-only) ----
export type AxisKey = "guilt" | "denial" | "fight" | "hope";
export type Axes = Record<AxisKey, number>;
export const AXIS_KEYS: AxisKey[] = ["guilt", "denial", "fight", "hope"];

// Secret axis weights per choice: [guilt, denial, fight, hope]. Server-only.
const AXIS_WEIGHTS: Record<string, [number, number, number, number]> = {
  x4k: [2, 1, 1, 0], b9r: [0, 0, 0, 2], m2t: [1, 2, 0, 0], q7v: [0, 1, 2, 0], h1z: [0, 0, 1, 2],
  p3w: [1, 2, 0, 0], f8n: [0, 2, 0, 1], k5d: [2, 0, 0, 0], r2c: [0, 0, 2, 0], u6j: [0, 1, 2, 1],
  e7s: [2, 2, 0, 0], w1y: [1, 1, 0, 2], g4h: [2, 1, 0, 0], t9a: [0, 2, 2, 0], n3o: [1, 0, 1, 2],
  z5l: [1, 0, 2, 1], c2m: [0, 1, 1, 1], j8b: [1, 1, 0, 0], y6f: [0, 0, 2, 0], d1q: [0, 0, 1, 2],
  s4e: [2, 2, 0, 0], a9u: [1, 2, 0, 1], v3i: [2, 0, 0, 1], o7g: [1, 1, 1, 0], l2x: [0, 0, 1, 2],
  i6p: [1, 1, 1, 0], h8w: [0, 0, 0, 2], b1k: [2, 1, 0, 0], m5r: [0, 1, 2, 0], q3t: [0, 0, 1, 2],
  f2v: [2, 1, 0, 0], k9z: [0, 0, 0, 2], r4n: [2, 0, 0, 1], u1d: [0, 1, 2, 0], e5c: [0, 0, 1, 2],
  w7j: [2, 0, 2, 1], g3s: [0, 0, 0, 2], t6y: [1, 2, 0, 0], n2a: [0, 1, 2, 0], z8o: [0, 0, 2, 2],
};

// Max raw score per axis across all 8 questions (for 0-100 normalization).
const AXIS_MAX: Axes = AXIS_KEYS.reduce((acc, _a, i) => {
  acc[AXIS_KEYS[i] as AxisKey] = QUESTION_CHOICES.reduce(
    (sum, opts) => sum + Math.max(...opts.map((c) => AXIS_WEIGHTS[c]![i]!)),
    0,
  );
  return acc;
}, {} as Axes);

/** Dominant axis of a choice; ties break toward guilt, then denial, then fight. */
function dominantAxis(choice: string): AxisKey {
  const w = AXIS_WEIGHTS[choice]!;
  let best: AxisKey = "guilt";
  for (const k of AXIS_KEYS) if (w[AXIS_KEYS.indexOf(k)]! > w[AXIS_KEYS.indexOf(best)]!) best = k;
  return best;
}

// Secret ending rule (server-only): same dominant axis in at least 7 of 8 scenes.
const SECRET_THRESHOLD = 7;

export type Scores = Record<CharacterKey, number>;

/** choices[i] is the chosen id for question i+1. Throws on invalid input. */
export function scoreChoices(choices: string[]): { character: AnyCharacterKey; scores: Scores; axes: Axes } {
  if (!Array.isArray(choices) || choices.length !== 8) throw new Error("Exactly 8 answers required");
  const scores: Scores = { james: 0, maria: 0, angela: 0, eddie: 0, laura: 0 };
  const raw: Axes = { guilt: 0, denial: 0, fight: 0, hope: 0 };
  const axisHits: Axes = { guilt: 0, denial: 0, fight: 0, hope: 0 };
  choices.forEach((c, i) => {
    if (!QUESTION_CHOICES[i]?.includes(c)) throw new Error(`Invalid answer for question ${i + 1}`);
    scores[MATRIX[c] as CharacterKey] += 2;
    const w = AXIS_WEIGHTS[c]!;
    AXIS_KEYS.forEach((k, j) => { raw[k] += w[j]!; });
    axisHits[dominantAxis(c)] += 1;
  });
  const axes: Axes = AXIS_KEYS.reduce((acc, k) => {
    acc[k] = Math.max(0, Math.min(100, Math.round((raw[k] / AXIS_MAX[k]) * 100)));
    return acc;
  }, {} as Axes);

  const max = Math.max(...Object.values(scores));
  const top = (Object.keys(scores) as CharacterKey[]).filter((k) => scores[k] === max);
  const q7 = MATRIX[choices[6] as string] as CharacterKey;
  let character: AnyCharacterKey = (top.length === 1 ? top[0] : top.includes(q7) ? q7 : top[0]) as CharacterKey;

  // The Hidden Ending: one axis dominates nearly every scene.
  if (AXIS_KEYS.some((k) => axisHits[k] >= SECRET_THRESHOLD)) character = "hidden";

  return { character, scores, axes };
}

// ---- Class verdict (server-only) ----
const CHARACTER_NAMES: Record<AnyCharacterKey, string> = {
  james: "James", maria: "Maria", angela: "Angela", eddie: "Eddie", laura: "Laura", hidden: "The Hidden Ending",
};

const VERDICTS: Record<AxisKey, string[]> = {
  guilt: [
    "This class carries its pain quietly, like a letter no one rereads.",
    "This class blames itself first and asks questions later.",
    "In this class, guilt is the fog everyone walks through.",
  ],
  denial: [
    "This class copes with pain mostly through denial.",
    "This class would rather not look — and the town knows it.",
    "This class keeps walking, hoping the fog hides what it already knows.",
  ],
  fight: [
    "This class meets fear with its fists up.",
    "This class strikes first and licks its wounds later.",
    "In this class, anger is the armor of choice.",
  ],
  hope: [
    "This class still believes the door can be opened.",
    "This class walks into the fog expecting to walk out.",
    "This class holds on to each other — and to hope.",
  ],
};

/** One generated sentence about the class from average axes + most common character. */
export function classVerdict(avg: Axes, dominant: AnyCharacterKey | null): string {
  const axis = AXIS_KEYS.reduce((a, b) => (avg[a] >= avg[b] ? a : b));
  const variant = Math.min(2, Math.floor(avg[axis] / 34));
  let sentence = VERDICTS[axis][variant]!;
  if (dominant && dominant !== "hidden") sentence += ` Its soul leans toward ${CHARACTER_NAMES[dominant]}.`;
  return sentence;
}

export function randomChoices(): string[] {
  return QUESTION_CHOICES.map((opts) => opts[Math.floor(Math.random() * opts.length)] as string);
}
