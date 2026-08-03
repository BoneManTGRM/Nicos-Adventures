import knowledgeData from "../catalogs/nico-knowledge.json";
import type { Language, LocalizedText } from "../types";

type KnowledgeEntry = {
  id: string;
  keywords: Record<Language, string[]>;
  answer: LocalizedText;
};

export type NicoAnswer = {
  id: string;
  text: string;
  confidence: "exact" | "related" | "fallback";
};

const knowledge = knowledgeData as KnowledgeEntry[];

const normalize = (value: string): string => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9ñáéíóúü+*/.\-\s]/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const tokenize = (value: string): string[] => normalize(value).split(" ").filter((token) => token.length > 1);

const answerMath = (question: string, language: Language): NicoAnswer | null => {
  const match = normalize(question).match(/(?:what is|calculate|cuanto es|cuánto es|calcula)?\s*(-?\d+(?:\.\d+)?)\s*([+\-*/x])\s*(-?\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const left = Number(match[1]);
  const right = Number(match[3]);
  const operator = match[2].toLowerCase();
  if (!Number.isFinite(left) || !Number.isFinite(right) || Math.abs(left) > 100000 || Math.abs(right) > 100000) return null;
  if (operator === "/" && right === 0) {
    return {
      id: "math-divide-zero",
      text: language === "es-MX" ? "No podemos dividir entre cero." : "We cannot divide by zero.",
      confidence: "exact",
    };
  }
  const result = operator === "+" ? left + right
    : operator === "-" ? left - right
      : operator === "*" || operator === "x" ? left * right
        : left / right;
  const clean = Number.isInteger(result) ? String(result) : String(Math.round(result * 1000) / 1000);
  return {
    id: "math",
    text: language === "es-MX" ? `La respuesta es ${clean}.` : `The answer is ${clean}.`,
    confidence: "exact",
  };
};

export const suggestedQuestions = (language: Language): string[] => language === "es-MX"
  ? ["¿Qué puedo hacer aquí?", "¿Cómo gano estrellas?", "¿Cómo hago una película?", "¿Eres una IA?", "¿Cómo guardo mi progreso?"]
  : ["What can I do here?", "How do I earn stars?", "How do I make a movie?", "Are you an AI?", "How do I back up my progress?"];

export function answerNicoQuestion(rawQuestion: string, language: Language): NicoAnswer {
  const question = rawQuestion.trim().slice(0, 180);
  const math = answerMath(question, language);
  if (math) return math;

  const normalizedQuestion = normalize(question);
  const questionTokens = new Set(tokenize(question));
  let best: { entry: KnowledgeEntry; score: number } | null = null;

  for (const entry of knowledge) {
    let score = 0;
    for (const keyword of entry.keywords[language]) {
      const normalizedKeyword = normalize(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedQuestion === normalizedKeyword) score += 12;
      else if (normalizedQuestion.includes(normalizedKeyword)) score += normalizedKeyword.includes(" ") ? 8 : 4;
      const keywordTokens = tokenize(keyword);
      score += keywordTokens.filter((token) => questionTokens.has(token)).length * 2;
    }
    if (!best || score > best.score) best = { entry, score };
  }

  if (best && best.score >= 4) {
    return {
      id: best.entry.id,
      text: best.entry.answer[language],
      confidence: best.score >= 8 ? "exact" : "related",
    };
  }

  return {
    id: "fallback",
    text: language === "es-MX"
      ? "Todavía no tengo una respuesta segura para eso. Puedo ayudarte con robots, animales, dinosaurios, cuentos, juegos, estrellas, películas, privacidad y respaldos."
      : "I do not have a safe answer for that yet. I can help with robots, animals, dinosaurs, stories, games, stars, movies, privacy, and backups.",
    confidence: "fallback",
  };
}
