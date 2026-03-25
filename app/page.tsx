"use client";

import { useState } from "react";

// --- Types ---

type PersonalityKey = "bold" | "cozy" | "social" | "health" | "artisan";

interface Personality {
  key: PersonalityKey;
  name: string;
  coffee: string;
  tagline: string;
  colorClass: string;
}

interface Option {
  emoji: string;
  text: string;
  maps_to: PersonalityKey;
}

interface Question {
  id: number;
  text: string;
  emoji: string;
  options: Option[];
}

type Answers = Record<number, PersonalityKey>;
type Screen = "start" | "quiz" | "results";

// --- Static Data ---

const PERSONALITIES: Personality[] = [
  { key: "bold",    name: "Bold Adventurer",  coffee: "Double Espresso",         tagline: "You live for intensity",        colorClass: "bg-bold"    },
  { key: "cozy",    name: "Cozy Classic",     coffee: "Medium Roast Drip",        tagline: "Comfort in every cup",          colorClass: "bg-cozy"    },
  { key: "social",  name: "Social Butterfly", coffee: "Cappuccino",               tagline: "Coffee is better with company", colorClass: "bg-social"  },
  { key: "health",  name: "Health Nut",       coffee: "Oat Milk Americano",       tagline: "Wellness in every sip",         colorClass: "bg-health"  },
  { key: "artisan", name: "Artisan Snob",     coffee: "Pour-Over, Single Origin", tagline: "You know what you like",        colorClass: "bg-artisan" },
];

const QUESTIONS: Question[] = [
  {
    id: 1, text: "It's movie night. What are you watching?", emoji: "🎬",
    options: [
      { emoji: "💥", text: "An action blockbuster — bigger explosions, better movie", maps_to: "bold" },
      { emoji: "😂", text: "A comfort comedy I've seen 10 times", maps_to: "cozy" },
      { emoji: "🎭", text: "A critically acclaimed indie with subtitles", maps_to: "artisan" },
      { emoji: "🌱", text: "A documentary that changes how I see the world", maps_to: "health" },
      { emoji: "🥂", text: "A rom-com to watch with friends", maps_to: "social" },
    ],
  },
  {
    id: 2, text: "Ideal weekend?", emoji: "✈️",
    options: [
      { emoji: "🏔️", text: "Hiking somewhere I've never been", maps_to: "bold" },
      { emoji: "🛋️", text: "Staying home, zero plans, maximum comfort", maps_to: "cozy" },
      { emoji: "🍷", text: "Dinner party with my favorite people", maps_to: "social" },
      { emoji: "🧘", text: "Farmers market, yoga, meal prep", maps_to: "health" },
      { emoji: "🎨", text: "Visiting a gallery or local craft market", maps_to: "artisan" },
    ],
  },
  {
    id: 3, text: "Pick a color that speaks to you", emoji: "🎨",
    options: [
      { emoji: "🔴", text: "Deep red — bold and intense", maps_to: "bold" },
      { emoji: "🟤", text: "Warm tan — soft and familiar", maps_to: "cozy" },
      { emoji: "🟢", text: "Sage green — calm and intentional", maps_to: "health" },
      { emoji: "🔵", text: "Navy blue — refined and considered", maps_to: "artisan" },
      { emoji: "🟡", text: "Sunny yellow — warm and social", maps_to: "social" },
    ],
  },
  {
    id: 4, text: "Which Netflix show are you binging?", emoji: "📺",
    options: [
      { emoji: "🔥", text: "Squid Game — high stakes, can't look away", maps_to: "bold" },
      { emoji: "🏠", text: "Schitt's Creek — comfort TV, always makes me smile", maps_to: "cozy" },
      { emoji: "🌿", text: "Our Planet — beautiful and eye-opening", maps_to: "health" },
      { emoji: "🍷", text: "The Crown — slow, detailed, worth every minute", maps_to: "artisan" },
      { emoji: "😂", text: "Brooklyn Nine-Nine — funny and best with friends", maps_to: "social" },
    ],
  },
  {
    id: 5, text: "How do you order at a restaurant?", emoji: "🍽️",
    options: [
      { emoji: "🗺️", text: "Whatever sounds most adventurous on the menu", maps_to: "bold" },
      { emoji: "✅", text: "My usual — why mess with what works?", maps_to: "cozy" },
      { emoji: "🌾", text: "Whatever's seasonal, local, or organic", maps_to: "health" },
      { emoji: "🧐", text: "I've already read the reviews and know exactly what to get", maps_to: "artisan" },
      { emoji: "👥", text: "We're getting a bunch of things to share", maps_to: "social" },
    ],
  },
  {
    id: 6, text: "Desert island. You can bring one thing", emoji: "🏝️",
    options: [
      { emoji: "🔪", text: "A multi-tool — I'll figure out the rest", maps_to: "bold" },
      { emoji: "📚", text: "A stack of my favorite books", maps_to: "cozy" },
      { emoji: "🎧", text: "My playlist and headphones", maps_to: "social" },
      { emoji: "🌱", text: "Seeds to start a garden", maps_to: "health" },
      { emoji: "📓", text: "A journal and nice pen", maps_to: "artisan" },
    ],
  },
  {
    id: 7, text: "How do you feel about Monday mornings?", emoji: "☕",
    options: [
      { emoji: "⚡", text: "Bring it — I'm already three steps ahead", maps_to: "bold" },
      { emoji: "😴", text: "Manageable, but only after coffee", maps_to: "cozy" },
      { emoji: "📋", text: "Fine, I prepped everything Sunday", maps_to: "health" },
      { emoji: "🤝", text: "Better when I see my people at the office", maps_to: "social" },
      { emoji: "🎵", text: "Great if I have the right playlist and a good brew", maps_to: "artisan" },
    ],
  },
];

// --- Scoring ---

function calculateResults(answers: Answers): Array<{ personality: Personality; pct: number }> {
  const counts: Record<PersonalityKey, number> = {
    bold: 0, cozy: 0, social: 0, health: 0, artisan: 0,
  };
  Object.values(answers).forEach((key) => { counts[key]++; });
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return PERSONALITIES
    .map((p) => ({ personality: p, pct: Math.round((counts[p.key] / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

// --- Component ---

export default function CoffeeQuiz() {
  const [screen, setScreen] = useState<Screen>("start");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const results = screen === "results" ? calculateResults(answers) : [];
  const primary = results[0];

  function handleAnswer(key: PersonalityKey) {
    const questionId = QUESTIONS[currentQ].id;
    const newAnswers = { ...answers, [questionId]: key };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setScreen("results");
    }
  }

  function handleRestart() {
    setScreen("start");
    setCurrentQ(0);
    setAnswers({});
  }

  function renderStart() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
        <div className="text-7xl">☕</div>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold text-warm-900 tracking-tight">
            Coffee Personality Quiz
          </h1>
          <p className="text-lg text-warm-700 max-w-sm mx-auto leading-relaxed">
            Discover the brew that matches who you are. 7 questions. No wrong answers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setScreen("quiz")}
          className="mt-2 px-8 py-4 bg-brand text-white rounded-xl text-base font-medium hover:bg-brand-dark transition-colors duration-150"
        >
          Find My Coffee
        </button>
      </div>
    );
  }

  function renderQuiz() {
    const question = QUESTIONS[currentQ];
    return (
      <div className="flex flex-col items-center min-h-screen px-6 py-12">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <div className="flex flex-col gap-3 items-center">
            <div className="flex gap-2">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-150 ${
                    i < currentQ
                      ? "bg-brand"
                      : i === currentQ
                      ? "bg-brand opacity-60"
                      : "bg-warm-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-warm-700">
              Question {currentQ + 1} of {QUESTIONS.length}
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-3">{question.emoji}</div>
            <h2 className="text-2xl font-semibold text-warm-900 leading-snug">
              {question.text}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAnswer(option.maps_to)}
                className="flex items-center gap-4 px-5 py-4 bg-warm-100 border border-warm-200 rounded-xl text-left hover:border-brand hover:bg-brand-light transition-colors duration-150 cursor-pointer"
              >
                <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                <span className="text-base text-warm-900">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderResults() {
    return (
      <div className="flex flex-col items-center min-h-screen px-6 py-12">
        <div className="w-full max-w-lg flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest text-warm-300 font-medium">
              You&apos;re a...
            </p>
            <h1 className="text-4xl font-bold text-warm-900">
              {primary.personality.name}
            </h1>
            <p className="text-xl text-brand font-medium">
              {primary.personality.coffee}
            </p>
            <p className="text-base italic text-warm-700">
              &ldquo;{primary.personality.tagline}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-warm-200" />
            <span className="text-sm text-warm-300 font-medium">Your Full Blend</span>
            <div className="flex-1 h-px bg-warm-200" />
          </div>

          <div className="flex flex-col gap-4">
            {results.map(({ personality, pct }) => (
              <div key={personality.key} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-warm-900">{personality.name}</span>
                  <span className="text-sm text-warm-700">{pct}%</span>
                </div>
                <div className="w-full bg-warm-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${personality.colorClass} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="mt-2 px-8 py-4 border border-warm-300 text-warm-700 rounded-xl text-base font-medium hover:border-brand hover:text-brand transition-colors duration-150"
          >
            Take It Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-warm-50 font-sans">
      {screen === "start"   && renderStart()}
      {screen === "quiz"    && renderQuiz()}
      {screen === "results" && renderResults()}
    </main>
  );
}
