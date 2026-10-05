// Chiptune SFX via the Web Audio API — no audio files needed.
// Square-wave "blips" in the Game Boy register: click = short descending
// square, hover = soft high pin, toggle = warm triangle slide.

let ctx = null;

function ensureContext() {
  if (ctx) return ctx;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  ctx = new AudioContext();
  return ctx;
}

// Must be called from a user gesture at least once, or Chrome keeps the
// context suspended until then (browsers require it for autoplay policy).
export function unlockAudio() {
  const ac = ensureContext();
  if (ac && ac.state === "suspended") ac.resume().catch(() => {});
}

function blip({
  type = "square",
  frequency = 880,
  slideTo = null,
  gain = 0.05,
  duration = 0.06,
}) {
  const ac = ensureContext();
  if (!ac || ac.state !== "running") return;

  const now = ac.currentTime;
  const oscillator = ac.createOscillator();
  const envelope = ac.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  }

  envelope.gain.setValueAtTime(gain, now);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(envelope).connect(ac.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

export function sfxClick() {
  blip({ type: "square", frequency: 880, slideTo: 440, gain: 0.06, duration: 0.05 });
}

export function sfxHover() {
  blip({ type: "square", frequency: 1318, gain: 0.018, duration: 0.03 });
}

export function sfxToggle(on) {
  blip({
    type: "triangle",
    frequency: on ? 440 : 660,
    slideTo: on ? 880 : 330,
    gain: 0.05,
    duration: 0.09,
  });
}

// Rate-limits hover blips so moving the mouse across the grid does not
// turn into a machine gun.
let lastHoverAt = 0;
const HOVER_MIN_INTERVAL = 90;

export function initSfx() {
  document.addEventListener(
    "click",
    (event) => {
      unlockAudio();
      if (event.target.closest("button")) sfxClick();
    },
    true
  );

  document.addEventListener(
    "mouseover",
    (event) => {
      const now = performance.now();
      if (now - lastHoverAt < HOVER_MIN_INTERVAL) return;
      if (event.target.closest("button, a, .pokemon-card")) {
        lastHoverAt = now;
        sfxHover();
      }
    },
    true
  );
}
