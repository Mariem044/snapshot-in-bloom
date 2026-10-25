// Client-safe game content. Choice ids are opaque; the character mapping lives only on the server.
export type CharacterKey = "james" | "maria" | "angela" | "eddie" | "laura";
export type AnyCharacterKey = CharacterKey | "hidden";

export const CHARACTER_KEYS: CharacterKey[] = ["james", "maria", "angela", "eddie", "laura"];
export const HIDDEN_KEY: AnyCharacterKey = "hidden";

export type Question = { id: number; scene: string; choices: { id: string; text: string }[] };

export const QUESTIONS: Question[] = [
<<<<<<< HEAD
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
=======
  { id: 1, scene: "You wake up in an empty, foggy town.", choices: [
    { id: "x4k", text: "Keep walking" },
    { id: "b9r", text: "Look for someone" },
    { id: "m2t", text: "Hide and wait" },
    { id: "q7v", text: "Get angry" },
    { id: "h1z", text: "Follow the sound" },
  ]},
  { id: 2, scene: "Someone says something painful about you.", choices: [
    { id: "p3w", text: "Ignore it" },
    { id: "f8n", text: "Change the subject" },
    { id: "k5d", text: "Go quiet" },
    { id: "r2c", text: "Snap back" },
    { id: "u6j", text: "That's not true." },
  ]},
  { id: 3, scene: "You hurt someone you love.", choices: [
    { id: "e7s", text: "Bury it" },
    { id: "w1y", text: "Be extra kind" },
    { id: "g4h", text: "Blame myself" },
    { id: "t9a", text: "Explain it away" },
    { id: "n3o", text: "Tell them" },
  ]},
  { id: 4, scene: "Something scary appears.", choices: [
    { id: "z5l", text: "Face it" },
    { id: "c2m", text: "Talk my way out" },
    { id: "j8b", text: "Freeze" },
    { id: "y6f", text: "Attack first" },
    { id: "d1q", text: "Run" },
  ]},
  { id: 5, scene: "You find a photo of someone you lost.", choices: [
    { id: "s4e", text: "Put it away" },
    { id: "a9u", text: "Keep it close" },
    { id: "v3i", text: "Cry quietly" },
    { id: "o7g", text: "Get irritated" },
    { id: "l2x", text: "Ask what happened" },
  ]},
  { id: 6, scene: "Someone offers you comfort.", choices: [
    { id: "i6p", text: "Doubt it" },
    { id: "h8w", text: "Take it" },
    { id: "b1k", text: "I don't deserve it" },
    { id: "m5r", text: "Push it away" },
    { id: "q3t", text: "Accept it, stay honest" },
  ]},
  { id: 7, scene: "What do you fear most?", choices: [
    { id: "f2v", text: "The truth about me" },
    { id: "k9z", text: "Being alone" },
    { id: "r4n", text: "Being hurt again" },
    { id: "u1d", text: "Looking weak" },
    { id: "e5c", text: "Not being believed" },
  ]},
  { id: 8, scene: "A door hides the truth.", choices: [
    { id: "w7j", text: "Open it" },
    { id: "g3s", text: "Bring someone" },
    { id: "t6y", text: "Not ready" },
    { id: "n2a", text: "Kick it open" },
    { id: "z8o", text: "Open it, ask for answers" },
>>>>>>> 5ba2b08 (Initial commit)
  ]},
];

export type Character = {
  key: AnyCharacterKey;
  name: string;
  epithet: string;
  sigil: string;
  summary: string;
<<<<<<< HEAD
=======
  teaser: string;
>>>>>>> 5ba2b08 (Initial commit)
  traits: string[];
  coping: { label: string; text: string }[];
  question: string;
  colorClass: string;
  bgClass: string;
};

export const CHARACTERS: Record<AnyCharacterKey, Character> = {
  james: {
    key: "james", name: "James", epithet: "The One Who Forgets", sigil: "✉",
    summary: "You carry guilt like a letter you refuse to reread. You keep walking forward, hoping the fog will hide what you already know.",
<<<<<<< HEAD
=======
    teaser: "He came here because of a letter.",
>>>>>>> 5ba2b08 (Initial commit)
    traits: ["Determined", "Guarded", "Self-protective", "Haunted by the past"],
    coping: [
      { label: "Defense", text: "Denial — painful truths get pushed out of sight." },
      { label: "Strength", text: "You keep going when others would stop." },
      { label: "Shadow", text: "What you bury tends to come back with a face." },
    ],
    question: "What are you refusing to look at?",
    colorClass: "text-char-james", bgClass: "bg-char-james",
  },
  maria: {
    key: "maria", name: "Maria", epithet: "The One Who Stays Close", sigil: "♡",
    summary: "You find your footing through other people. Warmth is your shelter, and the silence of being alone is the scariest room in the hotel.",
<<<<<<< HEAD
=======
    teaser: "She looks like someone he lost.",
>>>>>>> 5ba2b08 (Initial commit)
    traits: ["Warm", "Charming", "Connection-seeking", "Afraid of abandonment"],
    coping: [
      { label: "Defense", text: "Seeking comfort — closeness soothes the fear." },
      { label: "Strength", text: "You make others feel seen and less alone." },
      { label: "Shadow", text: "You may give pieces of yourself to keep people near." },
    ],
    question: "Who would you be if no one needed you?",
    colorClass: "text-char-maria", bgClass: "bg-char-maria",
  },
  angela: {
    key: "angela", name: "Angela", epithet: "The One Who Carries It Quietly", sigil: "✦",
    summary: "You withdraw when things hurt, holding pain inside instead of letting it out. Your silence hides more depth than anyone realizes.",
<<<<<<< HEAD
=======
    teaser: "She's looking for her mother.",
>>>>>>> 5ba2b08 (Initial commit)
    traits: ["Sensitive", "Withdrawn", "Deeply feeling", "Self-critical"],
    coping: [
      { label: "Defense", text: "Withdrawal — you retreat and turn the pain inward." },
      { label: "Strength", text: "Profound empathy for others who suffer." },
      { label: "Shadow", text: "You may believe you don't deserve kindness." },
    ],
    question: "What would you say if you believed someone would stay to hear it?",
    colorClass: "text-char-angela", bgClass: "bg-char-angela",
  },
  eddie: {
    key: "eddie", name: "Eddie", epithet: "The One Who Strikes First", sigil: "✕",
    summary: "Under the armor is insecurity. You hit back before you can be hurt, because looking weak feels more dangerous than any monster.",
<<<<<<< HEAD
=======
    teaser: "He says he's fine. He isn't.",
>>>>>>> 5ba2b08 (Initial commit)
    traits: ["Defensive", "Reactive", "Proud", "Secretly insecure"],
    coping: [
      { label: "Defense", text: "Aggression — anger shields a fragile core." },
      { label: "Strength", text: "You refuse to be pushed around." },
      { label: "Shadow", text: "You can wound the people who were never a threat." },
    ],
    question: "What would people see if you lowered your fists?",
    colorClass: "text-char-eddie", bgClass: "bg-char-eddie",
  },
  laura: {
    key: "laura", name: "Laura", epithet: "The One the Fog Can't Touch", sigil: "☀",
    summary: "You see things as they are. Stubborn, direct, and honest, you trust your own reality — the town simply has less to show you.",
<<<<<<< HEAD
=======
    teaser: "She isn't afraid of this town.",
>>>>>>> 5ba2b08 (Initial commit)
    traits: ["Direct", "Stubborn", "Honest", "Curious"],
    coping: [
      { label: "Defense", text: "Confrontation — you name the truth out loud." },
      { label: "Strength", text: "Clarity that cuts through everyone's fog." },
      { label: "Shadow", text: "Your bluntness can land harder than you intend." },
    ],
    question: "When did you last let someone else be right?",
    colorClass: "text-char-laura", bgClass: "bg-char-laura",
  },
  hidden: {
    key: "hidden", name: "The Hidden Ending", epithet: "The One Who Left Town", sigil: "?",
    summary: "Almost no one answers the way you did. Every scene, the same quiet instinct — as if you had already walked this town once and knew which doors to skip. The fog never really caught you.",
<<<<<<< HEAD
=======
    teaser: "Almost nobody finds this ending.",
>>>>>>> 5ba2b08 (Initial commit)
    traits: ["Uncanny", "Consistent", "Hard to read", "One step outside the story"],
    coping: [
      { label: "Defense", text: "Pattern — you answer every fear the same way, and it works." },
      { label: "Strength", text: "A clarity so steady the town can't build a monster for you." },
      { label: "Shadow", text: "People who leave town early never learn what they were running from." },
    ],
    question: "What would you do with a second chance no one else gets?",
    colorClass: "text-char-hidden", bgClass: "bg-char-hidden",
  },
};

export const COMPLETED_KEY = "sh2_test_completed";

export type CompletedStore = { character?: AnyCharacterKey; playerId?: string; prediction?: CharacterKey; at?: number };

export function readCompleted(): CompletedStore {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? (JSON.parse(raw) as CompletedStore) : {};
  } catch {
    return {};
  }
}

export function writeCompleted(patch: CompletedStore) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify({ ...readCompleted(), ...patch }));
  } catch { /* ignore */ }
}
