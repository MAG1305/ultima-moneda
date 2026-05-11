// Howl es global vía CDN (cargado antes del módulo en index.html)
/* global Howl */

const heartbeatSound = new Howl({
  src: ['audio/heartbeat.mp3'],
  loop:   true,
  volume: 0.8,
});

export function startHeartbeat() {
  if (!heartbeatSound.playing()) {
    heartbeatSound.play();
  }
}

export function stopHeartbeat() {
  heartbeatSound.stop();
}
