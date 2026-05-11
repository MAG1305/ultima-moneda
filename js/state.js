export const SETS_CONFIG = [
  {
    setNum:      1,
    title:       'SET 1',
    desc:        'Presiona la tecla correcta a tiempo',
    rounds:      5,
    moneyPerWin: 1000,
    minigame:    1,
  },
  {
    setNum:      2,
    title:       'SET 2',
    desc:        'Presiona la secuencia de 4 teclas en orden',
    rounds:      5,
    moneyPerWin: 2000,
    minigame:    2,
  },
  {
    setNum:      3,
    title:       'SET 3',
    desc:        'Evita la cuchilla durante 5 segundos',
    rounds:      5,
    moneyPerWin: 4000,
    minigame:    3,
  },
  {
    setNum:      4,
    title:       'SET 4 — FINAL',
    desc:        'Corta el cable del color correcto',
    rounds:      -1,   // dinámico: tantas como dedos intactos
    moneyPerWin: 16000,
    minigame:    4,
  },
];

// Máximo teórico: 5×1000 + 5×2000 + 5×4000 + 5×16000
export const MAX_MONEY = 115000;

export const STATE = {
  money:              0,
  currentSet:         0,   // índice en SETS_CONFIG (0–3)
  currentRound:       0,   // 1-indexed dentro del set actual
  totalRoundsInSet:   5,
  activeFingerIndex:  0,
  threatFingerIndex:  0,   // índice del dedo en riesgo (sets 1-3); avanza al cortarse
  fingers: [false, false, false, false, false], // true = cortado
  waitingForNext:     false,
  heartbeatDelayTimeout: null,
};

export function resetState() {
  STATE.money              = 0;
  STATE.currentSet         = 0;
  STATE.currentRound       = 0;
  STATE.totalRoundsInSet   = 5;
  STATE.activeFingerIndex  = 0;
  STATE.threatFingerIndex  = 0;
  STATE.fingers            = [false, false, false, false, false];
  STATE.waitingForNext     = false;
  clearTimeout(STATE.heartbeatDelayTimeout);
  STATE.heartbeatDelayTimeout = null;
}

export function intactFingerIndices() {
  return STATE.fingers.reduce((acc, cut, i) => {
    if (!cut) acc.push(i);
    return acc;
  }, []);
}
