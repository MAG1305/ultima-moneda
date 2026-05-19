import { STATE, SETS_CONFIG, resetState, intactFingerIndices } from './state.js';
import { startHeartbeat, stopHeartbeat, playLossSequence } from './audio.js';
import { showDialog } from './dialog.js';
import * as UI from './ui.js';
import { start as startMG1 } from './minigames/set1.js';
import { start as startMG2 } from './minigames/set2.js';
import { start as startMG3 } from './minigames/set3.js';
import { start as startMG4 } from './minigames/set4.js';

const MINIGAMES = [startMG1, startMG2, startMG3, startMG4];

// Texto placeholder para las cajas de diálogo (a refinar más adelante)
const PRE_MINIGAME_LINES = [
  'Ya te dije que no te ibas a librar tan fácil.',
  'Veamos qué tan rápidos son tus reflejos.',
  'A ver si la suerte sigue contigo.',
  'No tiembles. Es solo un dedo.',
];
const SAVED_LINES = [
  'Tuviste suerte... esta vez.',
  'Mmh. Te salvaste por poco.',
  'No te confíes. Vuelve a la moneda.',
];
const CUT_LINES = [
  '¡Otro dedo para mi colección!',
  'Te lo advertí.',
  'Eso es. La casa siempre gana.',
];

function randomLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

// ===== Entry points =====

export function startGame() {
  resetState();
  UI.resetFingers();
  UI.updateMoney(0);
  UI.setBossSprite('initial');
  UI.showScreen('game');
  beginSet(0);
}

// ===== Set flow =====

function beginSet(setIndex) {
  STATE.currentSet   = setIndex;
  STATE.currentRound = 0;

  const cfg = SETS_CONFIG[setIndex];

  if (cfg.rounds === -1) {
    STATE.totalRoundsInSet = intactFingerIndices().length;
    if (STATE.totalRoundsInSet === 0) {
      UI.showEndScreen(STATE);
      return;
    }
  } else {
    STATE.totalRoundsInSet = cfg.rounds;
  }

  UI.showSetTransition(cfg, () => beginRound());
}

function beginRound() {
  STATE.currentRound++;
  STATE.waitingForNext = false;

  if (STATE.currentSet === 3) {
    // Set 4: un dedo intacto por ronda, en orden
    const intact = intactFingerIndices();
    STATE.activeFingerIndex = intact[STATE.currentRound - 1] ?? -1;
  } else {
    // Sets 1-3: siempre el dedo amenaza actual (avanza solo al cortarse)
    STATE.activeFingerIndex = STATE.threatFingerIndex;
  }

  UI.clearCoinResult();
  UI.setActiveRoundFinger(STATE.activeFingerIndex);
  UI.updateHUD(STATE.currentSet + 1, STATE.currentRound, STATE.totalRoundsInSet);
  UI.setBossSprite('initial');
  UI.enableCoinChoice(true);
}

// ===== Coin choice =====

export function handleCoinChoice(playerChoice) {
  if (STATE.waitingForNext) return;
  STATE.waitingForNext = true;
  UI.enableCoinChoice(false);

  const result      = Math.random() < 0.5 ? 'cara' : 'cruz';
  const moneyPerWin = SETS_CONFIG[STATE.currentSet].moneyPerWin;

  UI.animateCoin(result, () => {
    if (playerChoice === result) {
      STATE.money += moneyPerWin;
      UI.updateMoney(STATE.money);
      UI.showCoinResult(
        `¡${result.toUpperCase()}!  +$${moneyPerWin.toLocaleString('es')}`,
        '#66bb6a',
      );
      UI.setBossSprite('smile');
      scheduleNext(1400);
    } else {
      UI.showCoinResult(`${result.toUpperCase()} — Perdiste`, '#ff4444');
      UI.setBossSprite('angry');

      const fingerAlreadyCut = STATE.fingers[STATE.activeFingerIndex];
      if (fingerAlreadyCut) {
        UI.showCoinResult('Ya no queda dedo...', '#666');
        scheduleNext(1200);
      } else {
        setTimeout(() => {
          startHeartbeat();
          const delay = Math.random() * 5000;
          STATE.heartbeatDelayTimeout = setTimeout(() => triggerMinigame(), delay);
        }, 700);
      }
    }
  });
}

// ===== Minigame =====

async function triggerMinigame() {
  stopHeartbeat();

  // Diálogo de prueba antes del minijuego
  await showDialog({
    sprite:  'angry',
    text:    randomLine(PRE_MINIGAME_LINES),
    buttons: [{ id: 'go', label: 'EMPEZAR' }],
  });

  MINIGAMES[STATE.currentSet]({
    fingerIndex: STATE.activeFingerIndex,
    onSaved: () => onMinigameResult(true),
    onCut:   () => onMinigameResult(false),
  });
}

async function onMinigameResult(saved) {
  stopHeartbeat();
  const fi = STATE.activeFingerIndex;

  if (saved) {
    UI.markFingerSaved(fi);
    UI.showCoinResult('DEDO SALVADO', '#66bb6a');
    UI.setBossSprite('angry');

    await showDialog({
      sprite:  'angry',
      text:    randomLine(SAVED_LINES),
      buttons: [{ id: 'next', label: 'SEGUIR' }],
    });
  } else {
    STATE.fingers[fi] = true;

    // Efectos: sonido (guillotina + grito) + sacudida + flash rojo
    playLossSequence();
    UI.triggerLossFx();
    UI.markFingerCut(fi);
    UI.showCoinResult('DEDO CORTADO', '#cc2200');
    UI.setBossSprite('toothless');

    // Avanzar al siguiente dedo en sets 1-3
    if (STATE.currentSet < 3) {
      let next = STATE.threatFingerIndex + 1;
      while (next < 5 && STATE.fingers[next]) next++; // saltar si ya estaba cortado
      STATE.threatFingerIndex = Math.min(next, 4);
    }

    // Esperamos un poco al impacto antes del diálogo
    await wait(900);

    await showDialog({
      sprite:  'toothless',
      text:    randomLine(CUT_LINES),
      buttons: [{ id: 'next', label: 'SEGUIR' }],
    });
  }

  scheduleNext(400);
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ===== Next round / set =====

function scheduleNext(delay) {
  setTimeout(() => {
    if (STATE.currentRound >= STATE.totalRoundsInSet) {
      const nextSet = STATE.currentSet + 1;
      if (nextSet < SETS_CONFIG.length) {
        offerNextSet(nextSet);
      } else {
        UI.showEndScreen(STATE);
      }
    } else {
      beginRound();
    }
  }, delay);
}

function offerNextSet(nextSetIndex) {
  UI.showContinueOffer(
    STATE.money,
    SETS_CONFIG[nextSetIndex],
    () => beginSet(nextSetIndex),
    () => UI.showEndScreen(STATE),
  );
}
