import type { CharacterKey } from "./game-data";

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

export type Scores = Record<CharacterKey, number>;

/** choices[i] is the chosen id for question i+1. Throws on invalid input. */
export function scoreChoices(choices: string[]): { character: CharacterKey; scores: Scores } {
  if (!Array.isArray(choices) || choices.length !== 8) throw new Error("Exactly 8 answers required");
  const scores: Scores = { james: 0, maria: 0, angela: 0, eddie: 0, laura: 0 };
  choices.forEach((c, i) => {
    if (!QUESTION_CHOICES[i].includes(c)) throw new Error(`Invalid answer for question ${i + 1}`);
    scores[MATRIX[c]] += 2;
  });
  const max = Math.max(...Object.values(scores));
  const top = (Object.keys(scores) as CharacterKey[]).filter((k) => scores[k] === max);
  const q7 = MATRIX[choices[6]];
  const character = top.length === 1 ? top[0] : top.includes(q7) ? q7 : top[0];
  return { character, scores };
}

export function randomChoices(): string[] {
  return QUESTION_CHOICES.map((opts) => opts[Math.floor(Math.random() * opts.length)]);
}
