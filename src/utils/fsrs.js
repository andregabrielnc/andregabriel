/**
 * FSRS-4.5 (Free Spaced Repetition Scheduler)
 * Algoritmo de aprendizagem por repetição espaçada — mesmo usado pelo Anki.
 *
 * Referência: https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
 *
 * Ratings: 1=Again | 2=Hard | 3=Good | 4=Easy
 * States:  new | learning | review | relearning
 */

// Pesos treinados por ML (FSRS-4.5 default)
const W = [
  0.4072, 1.1829, 3.1262, 15.4722, // w0–w3: S₀ por rating
  7.2102, 0.5316,                   // w4–w5: dificuldade inicial
  1.0651, 0.0589,                   // w6–w7: atualização de dificuldade
  1.5330, 0.1544, 1.0070,           // w8–w10: estabilidade após acerto
  1.9395, 0.1100, 0.2900, 2.2700,  // w11–w14: estabilidade após erro
  0.0000, 2.9898,                   // w15–w16: penalidade hard / bônus easy
];

// Constantes da curva de esquecimento (forgetting curve)
const DECAY  = -0.5;
const FACTOR = 19 / 81;           // = 0.9^(1/DECAY) - 1
const MAX_INTERVAL    = 36500;    // ~100 anos
const TARGET_RETENTION = 0.9;    // 90% de taxa de retenção alvo

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// ─── Funções核心 ──────────────────────────────────────────────────────────────

/** Probabilidade de lembrar o card após `elapsed` dias com estabilidade `S` */
export function retrievability(elapsed, S) {
  if (S <= 0) return 0;
  return (1 + FACTOR * elapsed / S) ** DECAY;
}

/** Intervalo ideal (dias) para manter retenção >= 90% */
export function nextInterval(S) {
  // Derivado de R(I,S) = TARGET_RETENTION → I = S quando DECAY=-0.5, FACTOR=19/81
  return clamp(Math.round(S), 1, MAX_INTERVAL);
}

/** Estabilidade inicial para novo card (primeira revisão) */
function initStability(rating) {
  return Math.max(W[rating - 1], 0.1);
}

/** Dificuldade inicial — escala [1, 10] */
function initDifficulty(rating) {
  return clamp(W[4] - Math.exp(W[5] * (rating - 1)) + 1, 1, 10);
}

// D₀(4): alvo de regressão à média da dificuldade (≈ 3.28, não W[4] = 7.21)
const D0_4 = W[4] - Math.exp(W[5] * 3) + 1;

/** Atualiza dificuldade após revisão (com mean-reversion para evitar deriva) */
function nextDifficulty(D, rating) {
  const d = D - W[6] * (rating - 3);
  return clamp(W[7] * D0_4 + (1 - W[7]) * d, 1, 10); // regressão à média → D₀(4)
}

/** Nova estabilidade após acerto (recall) — cresce com cada revisão bem-sucedida */
function recallStability(D, S, R, rating) {
  const hardPenalty = rating === 2 ? W[15] : 1;
  const easyBonus   = rating === 4 ? W[16] : 1;
  return S * (
    Math.exp(W[8]) *
    (11 - D) *
    S ** (-W[9]) *
    (Math.exp((1 - R) * W[10]) - 1) *
    hardPenalty * easyBonus + 1
  );
}

/** Nova estabilidade após lapso (esquecimento) */
function forgetStability(D, S, R) {
  return (
    W[11] *
    D ** (-W[12]) *
    ((S + 1) ** W[13] - 1) *
    Math.exp((1 - R) * W[14])
  );
}

// ─── Formatação de intervalo ─────────────────────────────────────────────────

export function formatInterval(days) {
  if (days < 1 / 24)       return `${Math.round(days * 24 * 60)} min`;
  if (days < 1)             return `${Math.round(days * 24)}h`;
  if (days < 30)            return `${Math.round(days)}d`;
  if (days < 365)           return `${Math.round(days / 30)}m`;
  return `${(days / 365).toFixed(1)}a`;
}

// ─── Agendador principal ─────────────────────────────────────────────────────

/**
 * Dado o estado atual do card, retorna o próximo estado para cada rating (1–4).
 * Retorna um objeto { 1: {...}, 2: {...}, 3: {...}, 4: {...} }
 */
export function schedule(card) {
  const {
    state      = 'new',
    stability  = 0.1,
    difficulty = W[4],
    elapsed_days = 0,
    lapses     = 0,
  } = card;

  const S = Math.max(stability, 0.1);
  const D = clamp(difficulty, 1, 10);
  const R = state === 'new' ? 1 : retrievability(elapsed_days, S);

  const results = {};

  for (const rating of [1, 2, 3, 4]) {

    // ── Novo card (visto pela primeira vez) ──────────────────────────────
    if (state === 'new') {
      const newS = initStability(rating);
      const newD = initDifficulty(rating);

      if (rating === 1) {
        results[rating] = { state: 'learning', stability: newS, difficulty: newD, interval: 1 / 1440, scheduled_days: 0, lapses };
      } else if (rating === 2) {
        results[rating] = { state: 'learning', stability: newS, difficulty: newD, interval: 5 / 1440, scheduled_days: 0, lapses };
      } else if (rating === 3) {
        const interval = nextInterval(newS);
        results[rating] = { state: 'review', stability: newS, difficulty: newD, interval, scheduled_days: interval, lapses };
      } else {
        const boostedS = newS * (W[16] || 1.3);
        const interval = nextInterval(boostedS);
        results[rating] = { state: 'review', stability: boostedS, difficulty: newD, interval, scheduled_days: interval, lapses };
      }

    // ── Em aprendizado / reaprendizado ───────────────────────────────────
    } else if (state === 'learning' || state === 'relearning') {
      const newD = nextDifficulty(D, rating);
      const newS = initStability(rating);

      if (rating === 1) {
        results[rating] = { state, stability: newS, difficulty: newD, interval: 1 / 1440, scheduled_days: 0, lapses };
      } else if (rating === 2) {
        results[rating] = { state, stability: newS, difficulty: newD, interval: 10 / 1440, scheduled_days: 0, lapses };
      } else {
        const interval = nextInterval(newS);
        results[rating] = { state: 'review', stability: newS, difficulty: newD, interval, scheduled_days: interval, lapses };
      }

    // ── Revisão normal ────────────────────────────────────────────────────
    } else {
      const newD = nextDifficulty(D, rating);

      if (rating === 1) {
        // Lapso: esqueceu o card
        const newS = Math.max(forgetStability(newD, S, R), 0.1);
        results[rating] = { state: 'relearning', stability: newS, difficulty: newD, interval: 10 / 1440, scheduled_days: 0, lapses: lapses + 1 };
      } else {
        const newS = recallStability(newD, S, R, rating);
        const interval = nextInterval(newS);
        results[rating] = { state: 'review', stability: newS, difficulty: newD, interval, scheduled_days: interval, lapses };
      }
    }
  }

  return results;
}
