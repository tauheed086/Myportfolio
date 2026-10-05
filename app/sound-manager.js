"use client";

// Sound effects manager for portfolio audio experiences
const STORAGE_KEY = "portfolio_sound_enabled";

let soundEnabled = true;
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      soundEnabled = saved === "true";
    }
  } catch {
    soundEnabled = true;
  }
}

const listeners = new Set();
function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn(soundEnabled);
    } catch (e) {
      console.warn("Sound listener error:", e);
    }
  });
}

// Audio caches
let diveInAudio = null;
let lastDiveInTime = 0;
let riseUpAudio = null;
let lastRiseUpTime = 0;
let isAudioUnlocked = false;

// Preloaded bubble audio pool (bubble1.mp3, bubble2.mp3, bubble3.mp3)
const BUBBLE_SRCS = [
  "/sounds/ocean/bubble1.mp3",
  "/sounds/ocean/bubble2.mp3",
  "/sounds/ocean/bubble3.mp3"
];
let bubbleAudioPool = [];
let lastBubbleIndex = -1;

function initBubblePool() {
  if (typeof window === "undefined" || bubbleAudioPool.length > 0) return;
  try {
    for (let i = 0; i < BUBBLE_SRCS.length; i++) {
      for (let j = 0; j < 2; j++) {
        const audio = new Audio(BUBBLE_SRCS[i]);
        audio.preload = "auto";
        audio.volume = 0.55;
        bubbleAudioPool.push({
          soundIndex: i,
          audio: audio
        });
      }
    }
  } catch (e) {
    console.warn("Could not initialize bubble audio pool:", e);
  }
}

function getDiveInAudio() {
  if (typeof window === "undefined") return null;
  if (!diveInAudio) {
    try {
      diveInAudio = new Audio("/sounds/ocean/dive-in.mp3");
      diveInAudio.preload = "auto";
      diveInAudio.volume = 0.65;
    } catch (e) {
      console.warn("Could not initialize dive-in audio:", e);
    }
  }
  return diveInAudio;
}

function getRiseUpAudio() {
  if (typeof window === "undefined") return null;
  if (!riseUpAudio) {
    try {
      riseUpAudio = new Audio("/sounds/ocean/rise-up.mp3");
      riseUpAudio.preload = "auto";
      riseUpAudio.volume = 0.65;
    } catch (e) {
      console.warn("Could not initialize rise-up audio:", e);
    }
  }
  return riseUpAudio;
}

// Browser Autoplay Policy: unlock audio on first user gesture
export function unlockAudio() {
  if (isAudioUnlocked || typeof window === "undefined") return;
  isAudioUnlocked = true;

  // Prime the audio elements silently so subsequent plays have zero latency
  const diveAudio = getDiveInAudio();
  if (diveAudio) {
    diveAudio.load();
  }
  const riseAudio = getRiseUpAudio();
  if (riseAudio) {
    riseAudio.load();
  }
  const underAudio = getUnderwaterAudio();
  if (underAudio) {
    underAudio.load();
  }

  initBubblePool();
  bubbleAudioPool.forEach(item => {
    try {
      item.audio.load();
    } catch {}
  });

  window.removeEventListener("pointerdown", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
  window.removeEventListener("touchstart", unlockAudio);
}

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
  window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
  window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  try {
    localStorage.setItem(STORAGE_KEY, String(soundEnabled));
  } catch {}
  notifyListeners();
  if (!soundEnabled) {
    if (diveInAudio) {
      diveInAudio.pause();
      diveInAudio.currentTime = 0;
    }
    if (riseUpAudio) {
      riseUpAudio.pause();
      riseUpAudio.currentTime = 0;
    }
    if (underwaterAudio) {
      underwaterAudio.pause();
      underwaterAudio.volume = 0;
      currentUnderwaterVolume = 0;
      targetUnderwaterVolume = 0;
    }
  } else {
    updateAmbientScrollAudio();
  }
}

export function toggleSound() {
  setSoundEnabled(!soundEnabled);
  return soundEnabled;
}

export function subscribeSound(callback) {
  listeners.add(callback);
  callback(soundEnabled);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Play dive-in splash / plunge sound effect when entering the ocean waves
 */
export function playDiveIn() {
  if (!soundEnabled || typeof window === "undefined") return;

  const now = performance.now();
  // Prevent duplicate triggering within 2.5 seconds
  if (now - lastDiveInTime < 2500) {
    return;
  }
  lastDiveInTime = now;

  const audio = getDiveInAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = 0.65;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        // Autoplay policy prevented playback, suppressed cleanly
        if (err.name !== "AbortError") {
          // Will be unlocked on next gesture
        }
      });
    }
  } catch (err) {
    console.warn("Error playing dive-in sound:", err);
  }
}

/**
 * Play rise-up emergence sound effect when surfacing from the ocean
 */
export function playRiseUp() {
  if (!soundEnabled || typeof window === "undefined") return;

  const now = performance.now();
  // Prevent duplicate triggering within 2.5 seconds
  if (now - lastRiseUpTime < 2500) {
    return;
  }
  lastRiseUpTime = now;

  const audio = getRiseUpAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = 0.65;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        // Autoplay policy prevented playback, suppressed cleanly
        if (err.name !== "AbortError") {
          // Will be unlocked on next gesture
        }
      });
    }
  } catch (err) {
    console.warn("Error playing rise-up sound:", err);
  }
}

// =========================================================================
// Ambient Underwater Audio Controller
// Plays continuously in the ocean, slowly fading away as we reach space.
// =========================================================================
const MAX_UNDERWATER_VOLUME = 0.48;
let underwaterAudio = null;
let currentUnderwaterVolume = 0;
let targetUnderwaterVolume = 0;
let underwaterFadeRaf = null;

export function getUnderwaterAudio() {
  if (typeof window === "undefined") return null;
  if (!underwaterAudio) {
    try {
      underwaterAudio = new Audio("/sounds/ocean/underwater.mp3");
      underwaterAudio.loop = true;
      underwaterAudio.preload = "auto";
      underwaterAudio.volume = 0;
    } catch (e) {
      console.warn("Could not initialize underwater audio:", e);
    }
  }
  return underwaterAudio;
}

function updateVolumeStep() {
  const audio = getUnderwaterAudio();
  if (!audio) return;

  const diff = targetUnderwaterVolume - currentUnderwaterVolume;
  if (Math.abs(diff) < 0.003) {
    currentUnderwaterVolume = targetUnderwaterVolume;
    audio.volume = currentUnderwaterVolume;
    if (currentUnderwaterVolume === 0) {
      if (!audio.paused) {
        audio.pause();
      }
    }
    underwaterFadeRaf = null;
    return;
  }

  // Smooth lerp: ~0.08 per frame creates a gentle, organic acoustic fade
  currentUnderwaterVolume += diff * 0.08;
  audio.volume = Math.max(0, Math.min(1, currentUnderwaterVolume));

  if (currentUnderwaterVolume > 0.005 && audio.paused && soundEnabled) {
    audio.play().catch(() => {});
  }

  underwaterFadeRaf = requestAnimationFrame(updateVolumeStep);
}

export function setUnderwaterTargetVolume(target) {
  if (!soundEnabled) {
    target = 0;
  }
  targetUnderwaterVolume = Math.max(0, Math.min(1, target));

  const audio = getUnderwaterAudio();
  if (!audio) return;

  if (targetUnderwaterVolume > 0 && audio.paused && soundEnabled) {
    audio.play().catch(() => {});
  }

  if (!underwaterFadeRaf) {
    underwaterFadeRaf = requestAnimationFrame(updateVolumeStep);
  }
}

/**
 * Automatically adjusts ambient underwater volume depending on scroll depth:
 * - Surface / Hero (progress <= 0.05): Silent (volume 0)
 * - Entering Ocean (progress 0.05 -> 0.16): Smoothly fades in as waves cover the view
 * - Deep Ocean / Narrative / About: Full immersion (volume ~0.48)
 * - Approaching & Entering Space: Slowly fades away to 0 as cosmic starfield appears
 */
export function updateAmbientScrollAudio() {
  if (typeof window === "undefined") return;

  if (!soundEnabled) {
    setUnderwaterTargetVolume(0);
    return;
  }

  const scrollY = window.scrollY;
  const ocean = document.querySelector(".ocean-journey");
  if (!ocean) {
    setUnderwaterTargetVolume(0);
    return;
  }

  const oceanTop = ocean.offsetTop;
  const oceanHeight = ocean.offsetHeight;
  const stageHeight = window.innerHeight;
  const oceanDistance = Math.max(1, oceanHeight - stageHeight);
  const oceanProgress = (scrollY - oceanTop) / oceanDistance;

  // 1. Surface region (sky & hero): underwater sound is 0
  if (oceanProgress <= 0.05) {
    setUnderwaterTargetVolume(0);
    return;
  }

  // 2. Entering ocean: as wave crest rises and submerges screen, fade in smoothly
  if (oceanProgress < 0.16) {
    const entryProgress = (oceanProgress - 0.05) / 0.11;
    setUnderwaterTargetVolume(entryProgress * MAX_UNDERWATER_VOLUME);
    return;
  }

  // 3. Space transition: Check if space flight transition exists
  let spaceTrigger = null;
  if (typeof window !== "undefined" && window.ScrollTrigger) {
    spaceTrigger = window.ScrollTrigger.getById("space-flight-transition");
  }

  if (spaceTrigger) {
    const triggerStart = spaceTrigger.start;

    // A. User is inside the space flight transition
    if (scrollY >= triggerStart) {
      const progressInSpace = spaceTrigger.progress;
      // Slowly fades away as we dissolve into space (first 22% of space sequence)
      if (progressInSpace >= 0.20) {
        // Deep space reached: completely silent
        setUnderwaterTargetVolume(0);
      } else {
        // Slowly fading into cosmic starfield
        const fadeOut = 1 - (progressInSpace / 0.20);
        setUnderwaterTargetVolume(fadeOut * MAX_UNDERWATER_VOLUME);
      }
      return;
    }

    // B. User is in lower part of About approaching space (last 450px of About)
    const distToSpace = triggerStart - (scrollY + stageHeight * 0.6);
    if (distToSpace < 450 && distToSpace > 0) {
      const approachFade = Math.max(0.15, distToSpace / 450);
      setUnderwaterTargetVolume(approachFade * MAX_UNDERWATER_VOLUME);
      return;
    }
  }

  // 4. Default: User is fully in the Ocean narrative and About sections
  setUnderwaterTargetVolume(MAX_UNDERWATER_VOLUME);
}

export function playUnderwaterAmbience(volume = MAX_UNDERWATER_VOLUME) {
  setUnderwaterTargetVolume(volume);
}

export function stopUnderwaterAmbience() {
  setUnderwaterTargetVolume(0);
}

/**
 * Check if the user's viewport is currently within the submerged ocean realm
 * (Beneath the ocean wave crest, through the submerged narrative, and through the About section, before space)
 */
export function isInsideOcean() {
  if (typeof window === "undefined") return false;
  const ocean = document.querySelector(".ocean-journey");
  if (!ocean) return false;

  const scrollY = window.scrollY;
  const oceanTop = ocean.offsetTop;
  const oceanHeight = ocean.offsetHeight;
  const stageHeight = window.innerHeight;
  const oceanDistance = Math.max(1, oceanHeight - stageHeight);
  const oceanProgress = (scrollY - oceanTop) / oceanDistance;

  // Above water / on surface
  if (oceanProgress < 0.08) return false;

  // Inside space flight transition
  if (typeof window !== "undefined" && window.ScrollTrigger) {
    const spaceTrigger = window.ScrollTrigger.getById("space-flight-transition");
    if (spaceTrigger && scrollY >= spaceTrigger.start && spaceTrigger.progress >= 0.18) {
      return false;
    }
  }

  return true;
}

/**
 * Play a random bubble pop sound from bubble1.mp3, bubble2.mp3, or bubble3.mp3
 * Uses a preloaded audio pool to support rapid, overlapping taps without latency or interruption.
 */
export function playRandomBubble(volume = 0.55) {
  if (!soundEnabled || typeof window === "undefined") return;

  initBubblePool();
  if (bubbleAudioPool.length === 0) return;

  // Pick a random sound index (0, 1, or 2), avoiding repeating the exact same one consecutively
  let soundIdx;
  do {
    soundIdx = Math.floor(Math.random() * BUBBLE_SRCS.length);
  } while (soundIdx === lastBubbleIndex && BUBBLE_SRCS.length > 1);
  lastBubbleIndex = soundIdx;

  // Find an available audio instance for this bubble sound
  let match = bubbleAudioPool.find(item => item.soundIndex === soundIdx && (item.audio.paused || item.audio.ended));
  if (!match) {
    match = bubbleAudioPool.find(item => item.soundIndex === soundIdx);
  }
  if (!match) {
    match = bubbleAudioPool[0];
  }

  try {
    match.audio.currentTime = 0;
    match.audio.volume = volume;
    const playPromise = match.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch {}
}

export const playBubble = playRandomBubble;

export function playClick() {
  if (!soundEnabled || typeof window === "undefined") return;
  try {
    const click = new Audio("/sounds/space/onclick.mp3");
    click.volume = 0.5;
    click.play().catch(() => {});
  } catch {}
}

