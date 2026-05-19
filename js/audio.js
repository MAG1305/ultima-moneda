// Howl es global vía CDN (cargado antes del módulo en index.html)
/* global Howl */

const heartbeatSound = new Howl({
  src: ['audio/heartbeat.mp3'],
  loop:   true,
  volume: 0.8,
});

const guillotineSound = new Howl({
  src: ['audio/guillotine.mp3'],
  volume: 0.9,
});

const screamSounds = [1, 2, 3, 4, 5].map(n => new Howl({
  src: [`audio/scream_${n}.mp3`],
  volume: 0.85,
}));

export function startHeartbeat() {
  if (!heartbeatSound.playing()) {
    heartbeatSound.play();
  }
}

export function stopHeartbeat() {
  heartbeatSound.stop();
}

export function playGuillotine() {
  guillotineSound.stop();
  guillotineSound.play();
}

export function playRandomScream() {
  const s = screamSounds[Math.floor(Math.random() * screamSounds.length)];
  s.stop();
  s.play();
}

// Reproduce guillotina + grito (ligero retraso para superponer el grito al impacto)
export function playLossSequence() {
  playGuillotine();
  setTimeout(playRandomScream, 320);
}
