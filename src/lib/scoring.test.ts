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
