import { describe, expect, it } from "vitest";
import { scoreChoices } from "./scoring.server";

describe("scoreChoices", () => {
  it("gives +2 per choice to the matching character", () => {
    const r = scoreChoices(["x4k", "p3w", "e7s", "z5l", "s4e", "i6p", "f2v", "w7j"]);
    expect(r.scores.james).toBe(16);
    expect(r.character).toBe("james");
  });

  it("breaks ties with the Question 7 choice", () => {
    // maria 4 (q1,q2), eddie 4 (q3,q4), laura 4 (q5,q6), q7 eddie -> eddie 6? keep tie: q7 angela, q8 angela -> angela 4
    const r = scoreChoices(["b9r", "f8n", "t9a", "y6f", "l2x", "q3t", "r4n", "t6y"]);
    expect(r.scores).toEqual({ james: 0, maria: 4, angela: 4, eddie: 4, laura: 4 });
    expect(r.character).toBe("angela");
  });

  it("rejects wrong answer counts", () => {
    expect(() => scoreChoices(["x4k"])).toThrow();
  });
});

describe("axis scoring", () => {
  it("normalizes a maximal hope run to 100", () => {
    const r = scoreChoices(["h1z", "f8n", "w1y", "d1q", "l2x", "h8w", "k9z", "g3s"]);
    expect(r.axes.hope).toBe(100);
  });

  it("keeps every axis within 0-100", () => {
    for (let i = 0; i < 200; i++) {
      const r = scoreChoices(randomChoices());
      for (const v of Object.values(r.axes)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
        expect(Number.isInteger(v)).toBe(true);
      }
    }
  });
});

describe("secret ending", () => {
  it("unlocks when one axis dominates at least 7 of 8 scenes", () => {
    // hope-dominant in every scene except scene 2 (denial)
    const r = scoreChoices(["h1z", "f8n", "w1y", "d1q", "l2x", "h8w", "k9z", "g3s"]);
    expect(r.character).toBe("hidden");
  });

  it("stays locked when no axis reaches 7 scenes", () => {
    // hope-dominant in only 6 scenes
    const r = scoreChoices(["h1z", "f8n", "w1y", "d1q", "l2x", "h8w", "k9z", "w7j"]);
    expect(r.character).not.toBe("hidden");
  });
});
