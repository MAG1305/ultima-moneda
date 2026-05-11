import { startGame, handleCoinChoice } from './game.js';

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

document.querySelectorAll('.btn-choice').forEach(btn => {
  btn.addEventListener('click', () => handleCoinChoice(btn.dataset.choice));
});
