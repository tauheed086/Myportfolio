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
let clickToEnterAudio = null;
let isAudioUnlocked = false;

// Preloaded bubble audio pool (bubble1.mp3, bubble2.mp3, bubble3.mp3)
const BUBBLE_SRCS = [
  "/sounds/ocean/bubble1.mp3",
  "/sounds/ocean/bubble2.mp3",
  "/sounds/ocean/bubble3.mp3"
];
let bubbleAudioPool = [];
let lastBubbleIndex = -1;

// Preloaded planet hover audio pool (planet-hover.mp3)
const PLANET_HOVER_SRC = "/sounds/space/planet-hover.mp3";
let planetHoverAudioPool = [];
let planetHoverPoolIndex = 0;
let lastPlanetHoverTime = 0;

function initPlanetHoverPool() {
  if (typeof window === "undefined" || planetHoverAudioPool.length > 0) return;
  try {
    for (let i = 0; i < 4; i++) {
      const audio = new Audio(PLANET_HOVER_SRC);
      audio.preload = "auto";
      audio.volume = 0.5;
      planetHoverAudioPool.push(audio);
    }
  } catch (e) {
    console.warn("Could not initialize planet hover audio pool:", e);
  }
}

// Preloaded fish swimming sound pool (whoosh.mp3, sloosh.mp3)
const FISH_SWIM_SRCS = [
  "/sounds/ocean/whoosh.mp3",
  "/sounds/ocean/sloosh.mp3"
];
let fishSwimAudioPool = [];
let lastFishSwimIndex = -1;
let lastFishSwimTime = 0;

function initFishSwimPool() {
  if (typeof window === "undefined" || fishSwimAudioPool.length > 0) return;
  try {
    for (let i = 0; i < FISH_SWIM_SRCS.length; i++) {
      for (let j = 0; j < 2; j++) {
        const audio = new Audio(FISH_SWIM_SRCS[i]);
        audio.preload = "auto";
        audio.volume = 0.26;
        fishSwimAudioPool.push({
          soundIndex: i,
          type: i === 0 ? "whoosh" : "sloosh",
          audio: audio
        });
      }
    }
  } catch (e) {
    console.warn("Could not initialize fish swim audio pool:", e);
  }
}

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

function getClickToEnterAudio() {
  if (typeof window === "undefined") return null;
  if (!clickToEnterAudio) {
    try {
      clickToEnterAudio = new Audio("/sounds/clicktoenter.mp3");
      clickToEnterAudio.preload = "auto";
      clickToEnterAudio.volume = 0.8;
    } catch (e) {
      console.warn("Could not initialize click-to-enter audio:", e);
    }
  }
  return clickToEnterAudio;
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
  const enterAudio = getClickToEnterAudio();
  if (enterAudio) {
    enterAudio.load();
  }
  // Note: underwater and space ambient tracks are deferred to lazy load on demand
  // when the user actually navigates near those sections, saving 2.2MB on initial load.

  initBubblePool();
  bubbleAudioPool.forEach(item => {
    try {
      item.audio.load();
    } catch {}
  });

  initPlanetHoverPool();
  planetHoverAudioPool.forEach(audio => {
    try {
      audio.load();
    } catch {}
  });

  initFishSwimPool();
  fishSwimAudioPool.forEach(item => {
    try {
      item.audio.load();
    } catch {}
  });

  try {
    const ctx = getKeystrokeAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  } catch {}

  try {
    updateAmbientScrollAudio();
  } catch {}

  window.removeEventListener("pointerdown", unlockAudio);
  window.removeEventListener("click", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
  window.removeEventListener("touchstart", unlockAudio);
}

export function isAudioUnlockedState() {
  return isAudioUnlocked;
}

/**
 * Pause all audio playback when tab is hidden, minimized, or backgrounded.
 * Keeps target volume states preserved so audio gracefully fades back in when user returns.
 */
export function pauseAllAudio() {
  if (underwaterFadeRaf) {
    cancelAnimationFrame(underwaterFadeRaf);
    underwaterFadeRaf = null;
  }
  if (spaceFadeRaf) {
    cancelAnimationFrame(spaceFadeRaf);
    spaceFadeRaf = null;
  }
  if (underwaterAudio && !underwaterAudio.paused) {
    try { underwaterAudio.pause(); } catch {}
  }
  if (spaceAudio && !spaceAudio.paused) {
    try { spaceAudio.pause(); } catch {}
  }
  if (diveInAudio && !diveInAudio.paused) {
    try { diveInAudio.pause(); } catch {}
  }
  if (riseUpAudio && !riseUpAudio.paused) {
    try { riseUpAudio.pause(); } catch {}
  }
  if (clickToEnterAudio && !clickToEnterAudio.paused) {
    try { clickToEnterAudio.pause(); } catch {}
  }
  planetHoverAudioPool.forEach(audio => {
    try {
      if (!audio.paused) audio.pause();
    } catch {}
  });
  fishSwimAudioPool.forEach(item => {
    try {
      if (!item.audio.paused) item.audio.pause();
    } catch {}
  });
  bubbleAudioPool.forEach(item => {
    try {
      if (!item.audio.paused) item.audio.pause();
    } catch {}
  });
  if (keystrokeAudioCtx && keystrokeAudioCtx.state === "running") {
    try { keystrokeAudioCtx.suspend().catch(() => {}); } catch {}
  }
}

/**
 * Complete teardown and hard mute of all audio on page exit / window close / navigation.
 */
export function stopAllAudio() {
  pauseAllAudio();
  if (underwaterAudio) {
    try {
      underwaterAudio.volume = 0;
      underwaterAudio.currentTime = 0;
    } catch {}
  }
  currentUnderwaterVolume = 0;
  targetUnderwaterVolume = 0;

  if (spaceAudio) {
    try {
      spaceAudio.volume = 0;
      spaceAudio.currentTime = 0;
    } catch {}
  }
  currentSpaceVolume = 0;
  targetSpaceVolume = 0;

  if (diveInAudio) {
    try {
      diveInAudio.volume = 0;
      diveInAudio.currentTime = 0;
    } catch {}
  }
  if (riseUpAudio) {
    try {
      riseUpAudio.volume = 0;
      riseUpAudio.currentTime = 0;
    } catch {}
  }
  if (clickToEnterAudio) {
    try {
      clickToEnterAudio.volume = 0;
      clickToEnterAudio.currentTime = 0;
    } catch {}
  }
  if (keystrokeAudioCtx) {
    try {
      keystrokeAudioCtx.close().catch(() => {});
    } catch {}
    keystrokeAudioCtx = null;
  }
}

if (typeof window !== "undefined") {
  // Prime & unlock audio on first user gesture
  window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
  window.addEventListener("click", unlockAudio, { once: true, passive: true });
  window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
  window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });

  // 1. Page Visibility API: Stop music when user minimizes browser, switches tabs, or leaves screen
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAllAudio();
    } else {
      if (soundEnabled && isAudioUnlocked) {
        if (keystrokeAudioCtx && keystrokeAudioCtx.state === "suspended") {
          keystrokeAudioCtx.resume().catch(() => {});
        }
        updateAmbientScrollAudio();
      }
    }
  });

  // 2. Pagehide event (recommended modern standard for tab/window close or navigation)
  window.addEventListener("pagehide", () => {
    stopAllAudio();
  });

  // 3. Beforeunload & unload events (ensures instant audio termination when closing window/tab)
  window.addEventListener("beforeunload", () => {
    stopAllAudio();
  });
  window.addEventListener("unload", () => {
    stopAllAudio();
  });

  // 4. Page Lifecycle API: freeze event (when browser freezes inactive tab)
  document.addEventListener("freeze", () => {
    pauseAllAudio();
  });

  // 5. Restore audio if restored from bfcache
  window.addEventListener("pageshow", (e) => {
    if (e.persisted && soundEnabled && isAudioUnlocked && !document.hidden) {
      updateAmbientScrollAudio();
    }
  });
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
    if (spaceAudio) {
      spaceAudio.pause();
      spaceAudio.volume = 0;
      currentSpaceVolume = 0;
      targetSpaceVolume = 0;
    }
    planetHoverAudioPool.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    fishSwimAudioPool.forEach(item => {
      try {
        item.audio.pause();
        item.audio.currentTime = 0;
      } catch {}
    });
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
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

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
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

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

/**
 * Play custom entrance sound effect (clicktoenter.mp3) when entering the portfolio
 */
export function playClickToEnter(volume = 0.8) {
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

  const audio = getClickToEnterAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (err.name !== "AbortError") {
          // Autoplay policy fallback
        }
      });
    }
  } catch (err) {
    console.warn("Error playing click-to-enter sound:", err);
  }
}

// =========================================================================
// Ambient Environmental Audio Controllers: Ocean (Underwater) & Space
// Continuously crossfades as you travel between the ocean and deep space.
// =========================================================================
const MAX_UNDERWATER_VOLUME = 0.48;
let underwaterAudio = null;
let currentUnderwaterVolume = 0;
let targetUnderwaterVolume = 0;
let underwaterFadeRaf = null;

const MAX_SPACE_VOLUME = 0.50;
let spaceAudio = null;
let currentSpaceVolume = 0;
let targetSpaceVolume = 0;
let spaceFadeRaf = null;

export function getUnderwaterAudio() {
  if (typeof window === "undefined") return null;
  if (!underwaterAudio) {
    try {
      underwaterAudio = new Audio("/sounds/ocean/underwater.mp3");
      underwaterAudio.loop = true;
      underwaterAudio.preload = "none";
      underwaterAudio.volume = 0;
    } catch (e) {
      console.warn("Could not initialize underwater audio:", e);
    }
  }
  return underwaterAudio;
}

export function getSpaceAudio() {
  if (typeof window === "undefined") return null;
  if (!spaceAudio) {
    try {
      spaceAudio = new Audio("/sounds/space/space-bg-sound.mp3");
      spaceAudio.loop = true;
      spaceAudio.preload = "none";
      spaceAudio.volume = 0;
    } catch (e) {
      console.warn("Could not initialize space audio:", e);
    }
  }
  return spaceAudio;
}

function updateVolumeStep() {
  const audio = getUnderwaterAudio();
  if (!audio) return;

  if (typeof document !== "undefined" && document.hidden) {
    if (!audio.paused) {
      audio.pause();
    }
    underwaterFadeRaf = null;
    return;
  }

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

  if (currentUnderwaterVolume > 0.005 && audio.paused && soundEnabled && (!document.hidden)) {
    audio.play().catch(() => {});
  }

  underwaterFadeRaf = requestAnimationFrame(updateVolumeStep);
}

function updateSpaceVolumeStep() {
  const audio = getSpaceAudio();
  if (!audio) return;

  if (typeof document !== "undefined" && document.hidden) {
    if (!audio.paused) {
      audio.pause();
    }
    spaceFadeRaf = null;
    return;
  }

  const diff = targetSpaceVolume - currentSpaceVolume;
  if (Math.abs(diff) < 0.003) {
    currentSpaceVolume = targetSpaceVolume;
    audio.volume = currentSpaceVolume;
    if (currentSpaceVolume === 0) {
      if (!audio.paused) {
        audio.pause();
      }
    }
    spaceFadeRaf = null;
    return;
  }

  // Smooth lerp: ~0.08 per frame creates a gentle, organic acoustic fade
  currentSpaceVolume += diff * 0.08;
  audio.volume = Math.max(0, Math.min(1, currentSpaceVolume));

  if (currentSpaceVolume > 0.005 && audio.paused && soundEnabled && (!document.hidden)) {
    audio.play().catch(() => {});
  }

  spaceFadeRaf = requestAnimationFrame(updateSpaceVolumeStep);
}

export function setUnderwaterTargetVolume(target) {
  if (!soundEnabled || (typeof document !== "undefined" && document.hidden)) {
    target = 0;
  }
  targetUnderwaterVolume = Math.max(0, Math.min(1, target));

  const audio = getUnderwaterAudio();
  if (!audio) return;

  if (targetUnderwaterVolume > 0 && audio.paused && soundEnabled && (typeof document === "undefined" || !document.hidden)) {
    audio.play().catch(() => {});
  }

  if (!underwaterFadeRaf) {
    underwaterFadeRaf = requestAnimationFrame(updateVolumeStep);
  }
}

export function setSpaceTargetVolume(target) {
  if (!soundEnabled || (typeof document !== "undefined" && document.hidden)) {
    target = 0;
  }
  targetSpaceVolume = Math.max(0, Math.min(1, target));

  const audio = getSpaceAudio();
  if (!audio) return;

  if (targetSpaceVolume > 0 && audio.paused && soundEnabled && (typeof document === "undefined" || !document.hidden)) {
    audio.play().catch(() => {});
  }

  if (!spaceFadeRaf) {
    spaceFadeRaf = requestAnimationFrame(updateSpaceVolumeStep);
  }
}

/**
 * Automatically adjusts ambient audio channels depending on scroll depth:
 * - Surface / Hero (progress <= 0.05): Silent (underwater 0, space 0)
 * - Entering Ocean (progress 0.05 -> 0.16): Underwater fades in smoothly (space 0)
 * - Deep Ocean / Narrative / About: Full ocean immersion (underwater ~0.48, space 0)
 * - Ocean-to-Space Dissolve: Underwater smoothly fades away to 0 while Space ambient track smoothly fades in to ~0.50!
 * - Deep Space (Projects / Celestial Flight / Contact): Full space immersion (underwater 0, space ~0.50)
 */
export function updateAmbientScrollAudio() {
  if (typeof window === "undefined") return;

  if (!soundEnabled || (typeof document !== "undefined" && document.hidden)) {
    setUnderwaterTargetVolume(0);
    setSpaceTargetVolume(0);
    return;
  }

  const scrollY = window.scrollY;
  const ocean = document.querySelector(".ocean-journey");
  if (!ocean) {
    setUnderwaterTargetVolume(0);
    setSpaceTargetVolume(0);
    return;
  }

  const oceanTop = ocean.offsetTop;
  const oceanHeight = ocean.offsetHeight;
  const stageHeight = window.innerHeight;
  const oceanDistance = Math.max(1, oceanHeight - stageHeight);
  const oceanProgress = (scrollY - oceanTop) / oceanDistance;

  // 1. Surface region (sky & hero): both ambient sounds are 0
  if (oceanProgress <= 0.05) {
    setUnderwaterTargetVolume(0);
    setSpaceTargetVolume(0);
    stopFishSwim();
    return;
  }

  // 2. Entering ocean: as wave crest rises and submerges screen, fade underwater in smoothly
  if (oceanProgress < 0.16) {
    const entryProgress = (oceanProgress - 0.05) / 0.11;
    setUnderwaterTargetVolume(entryProgress * MAX_UNDERWATER_VOLUME);
    setSpaceTargetVolume(0);
    return;
  }

  // 3. Space transition: Check if space flight transition exists
  let spaceTrigger = null;
  if (typeof window !== "undefined" && window.ScrollTrigger) {
    spaceTrigger = window.ScrollTrigger.getById("space-flight-transition");
  }

  if (spaceTrigger) {
    const triggerStart = spaceTrigger.start;
    const triggerEnd = spaceTrigger.end;

    // A. User is at or beyond the space flight transition
    if (scrollY >= triggerStart) {
      // Scrolled to or past the end of space transition (Contact Realm)
      if (scrollY >= triggerEnd) {
        setUnderwaterTargetVolume(0);
        setSpaceTargetVolume(0);
        stopFishSwim();
        return;
      }

      const progressInSpace = spaceTrigger.progress;

      // 1. Initial Ocean-to-Space Dissolve: Underwater crossfades out, space fades in (0.00 -> 0.20)
      if (progressInSpace < 0.20) {
        const crossfadeProgress = Math.min(1, progressInSpace / 0.20);
        const underwaterFade = (1 - crossfadeProgress) * 0.5; // lower remaining half of underwater
        const spaceFade = 0.35 + crossfadeProgress * 0.65;    // space ramps from 0.35 to 1.0

        setUnderwaterTargetVolume(underwaterFade * MAX_UNDERWATER_VOLUME);
        setSpaceTargetVolume(spaceFade * MAX_SPACE_VOLUME);
        return;
      }

      // 2. Active Space Flight (0.20 -> 0.86): Full deep space immersion (all project planets and flight corridor)
      if (progressInSpace < 0.86) {
        setUnderwaterTargetVolume(0);
        setSpaceTargetVolume(MAX_SPACE_VOLUME);
        stopFishSwim();
        return;
      }

      // 3. Space End / Approaching Contact Planet (0.86 -> 0.94):
      // Smoothly fades out the space ambient sound effect as camera pierces the White Smoky Planet
      if (progressInSpace < 0.94) {
        const fadeOutProgress = (progressInSpace - 0.86) / (0.94 - 0.86); // 0.0 -> 1.0
        const spaceFade = Math.max(0, 1 - fadeOutProgress);                // 1.0 -> 0.0

        setUnderwaterTargetVolume(0);
        setSpaceTargetVolume(spaceFade * MAX_SPACE_VOLUME);
        stopFishSwim();
        return;
      }

      // 4. Contact Page / Interior White Smoke (progressInSpace >= 0.94):
      // Space sound is completely silent on the contact page
      setUnderwaterTargetVolume(0);
      setSpaceTargetVolume(0);
      stopFishSwim();
      return;
    }

    // B. User is in lower part of About approaching space (last 450px of About)
    const distToSpace = triggerStart - (scrollY + stageHeight * 0.6);
    if (distToSpace < 450 && distToSpace > 0) {
      const approachProgress = 1 - (distToSpace / 450); // 0.0 -> 1.0 approaching triggerStart
      const underwaterFade = 1 - (approachProgress * 0.5); // 1.0 -> 0.5
      const spaceFade = approachProgress * 0.35;           // 0.0 -> 0.35

      setUnderwaterTargetVolume(underwaterFade * MAX_UNDERWATER_VOLUME);
      setSpaceTargetVolume(spaceFade * MAX_SPACE_VOLUME);
      return;
    }
  }

  // 4. Default: User is fully in the Ocean narrative and upper/mid About sections
  setUnderwaterTargetVolume(MAX_UNDERWATER_VOLUME);
  setSpaceTargetVolume(0);
}

export function playUnderwaterAmbience(volume = MAX_UNDERWATER_VOLUME) {
  setUnderwaterTargetVolume(volume);
}

export function stopUnderwaterAmbience() {
  setUnderwaterTargetVolume(0);
}

export function playSpaceAmbience(volume = MAX_SPACE_VOLUME) {
  setSpaceTargetVolume(volume);
}

export function stopSpaceAmbience() {
  setSpaceTargetVolume(0);
}

export function isInsideSpace() {
  if (typeof window === "undefined" || !window.ScrollTrigger) return false;
  const spaceTrigger = window.ScrollTrigger.getById("space-flight-transition");
  if (!spaceTrigger) return false;
  return window.scrollY >= spaceTrigger.start && window.scrollY < spaceTrigger.end && spaceTrigger.progress >= 0.18 && spaceTrigger.progress < 0.965;
}

export function isInsideContact() {
  if (typeof window === "undefined" || !window.ScrollTrigger) return false;
  const spaceTrigger = window.ScrollTrigger.getById("space-flight-transition");
  if (!spaceTrigger) return false;
  return window.scrollY >= spaceTrigger.end || (window.scrollY >= spaceTrigger.start && spaceTrigger.progress >= 0.965);
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
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

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

/**
 * Play futuristic planet / project card hover audio feedback
 * Uses preloaded multi-instance audio pool to support fast cursor flybys without clipping or delay.
 */
export function playPlanetHover(volume = 0.5) {
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

  const now = performance.now();
  // Throttle by 85ms to avoid buzzing/stuttering on noisy mouse border movements
  if (now - lastPlanetHoverTime < 85) {
    return;
  }
  lastPlanetHoverTime = now;

  initPlanetHoverPool();
  if (planetHoverAudioPool.length === 0) return;

  let audio = planetHoverAudioPool.find(a => a.paused || a.ended);
  if (!audio) {
    audio = planetHoverAudioPool[planetHoverPoolIndex % planetHoverAudioPool.length];
    planetHoverPoolIndex++;
  }

  try {
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch {}
}

export function playClick() {
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;
  try {
    const click = new Audio("/sounds/space/onclick.mp3");
    click.volume = 0.5;
    click.play().catch(() => {});
  } catch {}
}

// Procedural Web Audio API Synthesizer for tactile mechanical keystroke sound effects
let keystrokeAudioCtx = null;

function getKeystrokeAudioContext() {
  if (typeof window === "undefined") return null;
  if (!keystrokeAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      keystrokeAudioCtx = new AudioCtx();
    }
  }
  if (keystrokeAudioCtx && keystrokeAudioCtx.state === "suspended") {
    keystrokeAudioCtx.resume().catch(() => {});
  }
  return keystrokeAudioCtx;
}

/**
 * Play authentic tactile mechanical keyboard switch sound on typing/backspacing
 * Synthesized procedurally using Web Audio API (0 KB file transfer, zero latency)
 * Features organic acoustic pitch jitter, snappy switch click, and warm bottom-out thock.
 */
export function playKeystroke(isBackspace = false) {
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

  const ctx = getKeystrokeAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Master volume gain for keystrokes (calm, satisfying, non-intrusive)
    const masterGain = ctx.createGain();
    const baseVolume = isBackspace ? 0.08 : 0.11;
    masterGain.gain.setValueAtTime(baseVolume, now);
    masterGain.connect(ctx.destination);

    // 1. High-frequency click snap (tactile switch leaf strike)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    const pitchJitter = (Math.random() - 0.5) * 140;
    const snapFreq = isBackspace ? 1400 + pitchJitter : 2200 + pitchJitter;

    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(snapFreq, now);
    snapOsc.frequency.exponentialRampToValueAtTime(320, now + 0.016);

    snapGain.gain.setValueAtTime(0.75, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    snapOsc.connect(snapGain);
    snapGain.connect(masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.02);

    // 2. Low-frequency "thock" (switch bottom-out chassis resonance)
    const thockOsc = ctx.createOscillator();
    const thockGain = ctx.createGain();
    const thockFreq = isBackspace ? 240 + (Math.random() - 0.5) * 35 : 360 + (Math.random() - 0.5) * 45;

    thockOsc.type = "sine";
    thockOsc.frequency.setValueAtTime(thockFreq, now);
    thockOsc.frequency.exponentialRampToValueAtTime(80, now + 0.034);

    thockGain.gain.setValueAtTime(0.55, now);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    thockOsc.connect(thockGain);
    thockGain.connect(masterGain);
    thockOsc.start(now);
    thockOsc.stop(now + 0.04);

    // 3. Ultra-short noise texture (finger pad physical impact)
    const bufferSize = Math.floor(ctx.sampleRate * 0.012);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(isBackspace ? 1800 : 2800, now);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noiseSrc.start(now);
    noiseSrc.stop(now + 0.016);
  } catch {
    // Graceful fallback
  }
}

export function stopFishSwim() {
  fishSwimAudioPool.forEach(item => {
    try {
      if (!item.audio.paused) {
        item.audio.pause();
        item.audio.currentTime = 0;
      }
    } catch {}
  });
}

/**
 * Play mild, slow underwater fish swimming glide sound (whoosh.mp3 / sloosh.mp3)
 * Alternates organically between whoosh and sloosh, with subtle pitch & volume nuances
 * creating a realistic, slow mild fluid displacement as the fish maneuvers through the sea.
 */
export function playFishSwim({ volume = 0.26, type = null } = {}) {
  if (!soundEnabled || typeof window === "undefined" || (typeof document !== "undefined" && document.hidden)) return;

  const now = performance.now();
  // Throttle by 950ms to allow each stroke to breathe without chaotic overlap
  if (now - lastFishSwimTime < 950) {
    return;
  }
  lastFishSwimTime = now;

  initFishSwimPool();
  if (fishSwimAudioPool.length === 0) return;

  let soundIdx;
  if (type === "whoosh") {
    soundIdx = 0;
  } else if (type === "sloosh") {
    soundIdx = 1;
  } else {
    soundIdx = lastFishSwimIndex === 0 ? 1 : 0;
  }
  lastFishSwimIndex = soundIdx;

  let match = fishSwimAudioPool.find(item => item.soundIndex === soundIdx && (item.audio.paused || item.audio.ended));
  if (!match) {
    match = fishSwimAudioPool.find(item => item.soundIndex === soundIdx);
  }
  if (!match) {
    match = fishSwimAudioPool[0];
  }

  try {
    match.audio.currentTime = 0;
    // Mild, calm volume (clamped between 0.12 and 0.35)
    match.audio.volume = Math.max(0.12, Math.min(0.35, volume));
    // Subtle organic playbackRate (0.92 to 0.98 for that "slow mild" fluid drag)
    match.audio.playbackRate = 0.92 + Math.random() * 0.06;
    const playPromise = match.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch {}
}

