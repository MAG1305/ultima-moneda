// ===== ESTADO DEL JUEGO =====
const STATE = {
  money: 0,
  round: 0,
  totalRounds: 5,
  moneyPerWin: 100,
  maxMoney: 500,        // base máximo (5 rondas x $100)
  extraPhase: false,    // true cuando se están jugando las rondas extra
  fingers: [false, false, false, false, false], // false = intacto, true = cortado
  qteActive: false,
  qteTimeout: null,
  qteAnimFrame: null,
  qteStartTime: null,
  qteDuration: 1500,    // ms para pulsar en el QTE
  waitingForNext: false,
};

// ===== REFERENCIAS DOM =====
const screenStart   = document.getElementById('screen-start');
const screenGame    = document.getElementById('screen-game');
const screenEnd     = document.getElementById('screen-end');
const btnStart      = document.getElementById('btn-start');
const btnRestart    = document.getElementById('btn-restart');

const roundCurrent  = document.getElementById('round-current');
const roundTotal    = document.getElementById('round-total');
const moneyAmount   = document.getElementById('money-amount');
const moneyBar      = document.getElementById('money-bar');
const moneyBarLabel = document.getElementById('money-bar-label');

const coin          = document.getElementById('coin');
const coinResult    = document.getElementById('coin-result');
const choiceArea    = document.getElementById('choice-area');
const choiceButtons = document.querySelectorAll('.btn-choice');

const qteOverlay    = document.getElementById('qte-overlay');
const qteBar        = document.getElementById('qte-bar');

const continueOverlay = document.getElementById('continue-overlay');
const continueMoney   = document.getElementById('continue-money');
const btnContinueYes  = document.getElementById('btn-continue-yes');
const btnContinueNo   = document.getElementById('btn-continue-no');

const endTitle      = document.getElementById('end-title');
const endSummary    = document.getElementById('end-summary');
const endFingers    = document.getElementById('end-fingers');
const endMoney      = document.getElementById('end-money');

const fingerSlots   = [
  document.getElementById('finger-0'),
  document.getElementById('finger-1'),
  document.getElementById('finger-2'),
  document.getElementById('finger-3'),
  document.getElementById('finger-4'),
];

// ===== INICIO =====
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', () => {
  screenEnd.classList.remove('active');
  startGame();
});

btnContinueYes.addEventListener('click', () => {
  continueOverlay.classList.add('hidden');
  startExtraPhase();
});

btnContinueNo.addEventListener('click', () => {
  continueOverlay.classList.add('hidden');
  showEndScreen();
});

choiceButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (STATE.waitingForNext) return;
    const choice = btn.dataset.choice;
    handleChoice(choice);
  });
});

// ===== FUNCIONES PRINCIPALES =====

function startGame() {
  STATE.money = 0;
  STATE.round = 0;
  STATE.totalRounds = 5;
  STATE.moneyPerWin = 100;
  STATE.maxMoney = 500;
  STATE.extraPhase = false;
  STATE.fingers = [false, false, false, false, false];
  STATE.waitingForNext = false;

  // Resetear dedos visualmente
  fingerSlots.forEach(slot => {
    slot.classList.remove('cut', 'saved', 'active-round');
  });

  updateMoneyUI();
  showScreen('game');
  nextRound();
}

function startExtraPhase() {
  STATE.extraPhase = true;
  STATE.moneyPerWin = 200;
  STATE.totalRounds = STATE.round + 5;
  STATE.maxMoney = STATE.money + 1000; // 5 rondas x $200
  STATE.waitingForNext = false;

  // Resetear dedos para las 5 rondas extra
  STATE.fingers = [false, false, false, false, false];
  fingerSlots.forEach(slot => {
    slot.classList.remove('cut', 'saved', 'active-round');
  });

  updateMoneyUI();
  nextRound();
}

function nextRound() {
  STATE.round++;
  STATE.waitingForNext = false;
  coinResult.textContent = '';
  coinResult.className = '';

  const roundIndex = STATE.extraPhase
    ? STATE.round - (STATE.totalRounds - 5) // índice local dentro de las extra
    : STATE.round;

  // Marcar dedo activo
  fingerSlots.forEach(s => s.classList.remove('active-round'));
  const fingerIndex = (roundIndex - 1) % 5;
  fingerSlots[fingerIndex].classList.add('active-round');

  updateRoundUI();
  enableChoiceButtons(true);
}

function handleChoice(playerChoice) {
  enableChoiceButtons(false);
  STATE.waitingForNext = true;

  const result = Math.random() < 0.5 ? 'cara' : 'cruz';

  // Animación de moneda
  coin.classList.remove('spinning');
  void coin.offsetWidth; // reflow para reiniciar animación
  coin.classList.add('spinning');

  setTimeout(() => {
    coin.classList.remove('spinning');
    // Mostrar resultado en la moneda (frente = cara, dorso = cruz)
    const front = coin.querySelector('.coin-face.front');
    const back  = coin.querySelector('.coin-face.back');
    if (result === 'cara') {
      front.textContent = 'C';
      back.textContent  = 'X';
    } else {
      front.textContent = 'X';
      back.textContent  = 'C';
    }

    const won = playerChoice === result;

    if (won) {
      coinResult.textContent = `¡${result.toUpperCase()}! ✓ +$${STATE.moneyPerWin}`;
      coinResult.style.color = '#66bb6a';
      STATE.money += STATE.moneyPerWin;
      updateMoneyUI();
      scheduleNextRound(1400);
    } else {
      coinResult.textContent = `${result.toUpperCase()} — ¡Perdiste!`;
      coinResult.style.color = '#ff4444';
      setTimeout(() => startQTE(), 700);
    }
  }, 900);
}

function startQTE() {
  const roundIndex = STATE.extraPhase
    ? STATE.round - (STATE.totalRounds - 5)
    : STATE.round;
  const fingerIndex = (roundIndex - 1) % 5;

  STATE.qteActive = true;
  STATE.qteStartTime = performance.now();

  qteBar.style.transition = 'none';
  qteBar.style.width = '100%';
  qteOverlay.classList.remove('hidden');

  // Animar la barra QTE
  requestAnimationFrame(() => {
    qteBar.style.transition = `width ${STATE.qteDuration}ms linear`;
    qteBar.style.width = '0%';
  });

  // Listener de teclado
  const onKey = (e) => {
    if (!STATE.qteActive) return;
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      resolveQTE(true, fingerIndex, onKey);
    }
  };
  document.addEventListener('keydown', onKey);

  // También permitir click/tap en el overlay para móvil
  const onTap = () => {
    if (!STATE.qteActive) return;
    resolveQTE(true, fingerIndex, onKey, onTap);
  };
  qteOverlay.addEventListener('click', onTap);

  STATE.qteTimeout = setTimeout(() => {
    if (STATE.qteActive) {
      resolveQTE(false, fingerIndex, onKey, onTap);
    }
  }, STATE.qteDuration);
}

function resolveQTE(saved, fingerIndex, onKey, onTap) {
  STATE.qteActive = false;
  clearTimeout(STATE.qteTimeout);
  document.removeEventListener('keydown', onKey);
  if (onTap) qteOverlay.removeEventListener('click', onTap);

  qteOverlay.classList.add('hidden');
  qteBar.style.transition = 'none';
  qteBar.style.width = '100%';

  const slot = fingerSlots[fingerIndex];
  slot.classList.remove('active-round');

  if (saved) {
    slot.classList.add('saved');
    coinResult.textContent = '¡Dedo salvado! 😅';
    coinResult.style.color = '#66bb6a';
  } else {
    slot.classList.add('cut');
    STATE.fingers[fingerIndex] = true;
    coinResult.textContent = '✂ ¡Dedo cortado!';
    coinResult.style.color = '#ff4444';
  }

  scheduleNextRound(1200);
}

function scheduleNextRound(delay) {
  setTimeout(() => {
    if (STATE.round >= STATE.totalRounds) {
      if (!STATE.extraPhase) {
        showContinueOffer();
      } else {
        showEndScreen();
      }
    } else {
      nextRound();
    }
  }, delay);
}

// ===== UI HELPERS =====

function updateRoundUI() {
  const displayRound = STATE.extraPhase
    ? STATE.round - (STATE.totalRounds - 5)
    : STATE.round;
  roundCurrent.textContent = displayRound;
  roundTotal.textContent = 5;
}

function updateMoneyUI() {
  moneyAmount.textContent = STATE.money;

  const baseMax = STATE.extraPhase
    ? (STATE.totalRounds - 5) * 100 + 5 * 200
    : STATE.totalRounds * 100;
  const pct = Math.min(100, (STATE.money / baseMax) * 100);
  moneyBar.style.width = pct + '%';
  moneyBarLabel.textContent = '$' + STATE.money;
}

function enableChoiceButtons(enabled) {
  choiceButtons.forEach(b => { b.disabled = !enabled; });
}

function showScreen(name) {
  [screenStart, screenGame, screenEnd].forEach(s => s.classList.remove('active'));
  if (name === 'start')  screenStart.classList.add('active');
  if (name === 'game')   screenGame.classList.add('active');
  if (name === 'end')    screenEnd.classList.add('active');
}

function showContinueOffer() {
  continueMoney.textContent = STATE.money;
  continueOverlay.classList.remove('hidden');
}

function showEndScreen() {
  const cutCount = STATE.fingers.filter(Boolean).length;
  const intactCount = 5 - cutCount;
  const allIntact = cutCount === 0;

  endTitle.textContent = allIntact ? '¡SALISTE ILESO!' : 'JUEGO TERMINADO';
  endTitle.style.color = allIntact ? '#66bb6a' : '#d4a017';

  endSummary.textContent = STATE.extraPhase
    ? `Fase extra completada — Dedos cortados: ${cutCount}`
    : `Dedos cortados: ${cutCount} / 5`;

  // Representación visual de dedos
  endFingers.innerHTML = '';
  STATE.fingers.forEach(cut => {
    const span = document.createElement('span');
    span.textContent = cut ? '✂' : '🖐';
    span.title = cut ? 'Dedo cortado' : 'Dedo intacto';
    endFingers.appendChild(span);
  });

  endMoney.textContent = `Ganaste: $${STATE.money}`;

  showScreen('end');
}
