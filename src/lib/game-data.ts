// Client-safe game content. Choice ids are opaque; the character mapping lives only on the server.
export type CharacterKey = "james" | "maria" | "angela" | "eddie" | "laura";

export const CHARACTER_KEYS: CharacterKey[] = ["james", "maria", "angela", "eddie", "laura"];

export type Question = { id: number; scene: string; choices: { id: string; text: string }[] };

export const QUESTIONS: Question[] = [
  { id: 1, scene: "You wake up alone in a foggy, empty town.", choices: [
    { id: "x4k", text: "Keep walking, I need to find what I came for." },
    { id: "b9r", text: "Look for anyone to talk to." },
    { id: "m2t", text: "Find a quiet corner and wait for it to pass." },
    { id: "q7v", text: "Get angry, this must be a joke." },
    { id: "h1z", text: "Follow the strangest sound out of curiosity." },
  ]},
  { id: 2, scene: "A stranger tells you something painful about yourself.", choices: [
    { id: "p3w", text: "Tell myself they're wrong and move on." },
    { id: "f8n", text: "Smile and change the subject." },
    { id: "k5d", text: "Go quiet and feel it for a long time." },
    { id: "r2c", text: "Snap back first." },
    { id: "u6j", text: "Say \"that's not true\" directly." },
  ]},
  { id: 3, scene: "You hurt someone you love.", choices: [
    { id: "e7s", text: "Bury it and never talk about it." },
    { id: "w1y", text: "Be extra warm so they forgive me." },
    { id: "g4h", text: "Blame myself silently." },
    { id: "t9a", text: "Explain why it wasn't really my fault." },
    { id: "n3o", text: "Tell them straight away." },
  ]},
  { id: 4, scene: "Something scary appears in the corridor.", choices: [
    { id: "z5l", text: "Face it, even if it hurts." },
    { id: "c2m", text: "Talk my way out." },
    { id: "j8b", text: "Freeze." },
    { id: "y6f", text: "Attack first." },
    { id: "d1q", text: "Run for the exit without overthinking." },
  ]},
  { id: 5, scene: "You find an old photo of someone you lost.", choices: [
    { id: "s4e", text: "Put it away, I can't look." },
    { id: "a9u", text: "Keep it close as if they're still here." },
    { id: "v3i", text: "Cry quietly." },
    { id: "o7g", text: "Get irritated by feelings I can't control." },
    { id: "l2x", text: "Ask myself what really happened." },
  ]},
  { id: 6, scene: "Someone offers you comfort that feels too good.", choices: [
    { id: "i6p", text: "Doubt it, nothing comes without a price." },
    { id: "h8w", text: "Take it, I need it." },
    { id: "b1k", text: "Don't believe I deserve it." },
    { id: "m5r", text: "Push it away, people always want something." },
    { id: "q3t", text: "Accept it but stay honest about what I want." },
  ]},
  { id: 7, scene: "What do you fear most?", choices: [
    { id: "f2v", text: "Learning the truth about myself." },
    { id: "k9z", text: "Being left alone." },
    { id: "r4n", text: "Being hurt again by someone close." },
    { id: "u1d", text: "Being seen as weak." },
    { id: "e5c", text: "Not being believed." },
  ]},
  { id: 8, scene: "A door in front of you hides the truth.", choices: [
    { id: "w7j", text: "Open it, even though part of me already knows." },
    { id: "g3s", text: "Ask someone to come with me." },
    { id: "t6y", text: "Wait, I'm not ready." },
    { id: "n2a", text: "Kick it open to prove I'm not scared." },
    { id: "z8o", text: "Open it and ask whoever is there for the truth." },
  ]},
];

export type Character = {
  key: CharacterKey;
  name: string;
  epithet: string;
  sigil: string;
  summary: string;
  traits: string[];
  coping: { label: string; text: string }[];
  colorClass: string;
  bgClass: string;
};

export const CHARACTERS: Record<CharacterKey, Character> = {
  james: {
    key: "james", name: "James", epithet: "The One Who Forgets", sigil: "✉",
    summary: "You carry guilt like a letter you refuse to reread. You keep walking forward, hoping the fog will hide what you already know.",
    traits: ["Determined", "Guarded", "Self-protective", "Haunted by the past"],
    coping: [
      { label: "Defense", text: "Denial — painful truths get pushed out of sight." },
      { label: "Strength", text: "You keep going when others would stop." },
      { label: "Shadow", text: "What you bury tends to come back with a face." },
    ],
    colorClass: "text-char-james", bgClass: "bg-char-james",
  },
  maria: {
    key: "maria", name: "Maria", epithet: "The One Who Stays Close", sigil: "♡",
    summary: "You find your footing through other people. Warmth is your shelter, and the silence of being alone is the scariest room in the hotel.",
    traits: ["Warm", "Charming", "Connection-seeking", "Afraid of abandonment"],
    coping: [
      { label: "Defense", text: "Seeking comfort — closeness soothes the fear." },
      { label: "Strength", text: "You make others feel seen and less alone." },
      { label: "Shadow", text: "You may give pieces of yourself to keep people near." },
    ],
    colorClass: "text-char-maria", bgClass: "bg-char-maria",
  },
  angela: {
    key: "angela", name: "Angela", epithet: "The One Who Carries It Quietly", sigil: "✦",
    summary: "You withdraw when things hurt, holding pain inside instead of letting it out. Your silence hides more depth than anyone realizes.",
    traits: ["Sensitive", "Withdrawn", "Deeply feeling", "Self-critical"],
    coping: [
      { label: "Defense", text: "Withdrawal — you retreat and turn the pain inward." },
      { label: "Strength", text: "Profound empathy for others who suffer." },
      { label: "Shadow", text: "You may believe you don't deserve kindness." },
    ],
    colorClass: "text-char-angela", bgClass: "bg-char-angela",
  },
  eddie: {
    key: "eddie", name: "Eddie", epithet: "The One Who Strikes First", sigil: "✕",
    summary: "Under the armor is insecurity. You hit back before you can be hurt, because looking weak feels more dangerous than any monster.",
    traits: ["Defensive", "Reactive", "Proud", "Secretly insecure"],
    coping: [
      { label: "Defense", text: "Aggression — anger shields a fragile core." },
      { label: "Strength", text: "You refuse to be pushed around." },
      { label: "Shadow", text: "You can wound the people who were never a threat." },
    ],
    colorClass: "text-char-eddie", bgClass: "bg-char-eddie",
  },
  laura: {
    key: "laura", name: "Laura", epithet: "The One the Fog Can't Touch", sigil: "☀",
    summary: "You see things as they are. Stubborn, direct, and honest, you trust your own reality — the town simply has less to show you.",
    traits: ["Direct", "Stubborn", "Honest", "Curious"],
    coping: [
      { label: "Defense", text: "Confrontation — you name the truth out loud." },
      { label: "Strength", text: "Clarity that cuts through everyone's fog." },
      { label: "Shadow", text: "Your bluntness can land harder than you intend." },
    ],
    colorClass: "text-char-laura", bgClass: "bg-char-laura",
  },
};

export const COMPLETED_KEY = "sh2_test_completed";
