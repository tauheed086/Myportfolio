"use client";

import { useEffect, useRef, useState } from "react";

// Water, the boat, and birds share one clock, including pause/reduced motion.
export default function WaveScene({ paused, night = false, waveProgressRef, foregroundCanvasRef }) {
  const host = useRef(null);
  const pausedRef = useRef(paused);
  const nightRef = useRef(night);
  const waveProgressRefProp = useRef(waveProgressRef);
  const foregroundCanvasRefProp = useRef(foregroundCanvasRef);
  const [ready, setReady] = useState(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { nightRef.current = night; }, [night]);
  useEffect(() => { waveProgressRefProp.current = waveProgressRef; }, [waveProgressRef]);
  useEffect(() => { foregroundCanvasRefProp.current = foregroundCanvasRef; }, [foregroundCanvasRef]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => { };
    async function setup() {
      if (!container) return;
      const THREE = await import("three");
      if (disposed) return;
      const texture = await new THREE.TextureLoader().loadAsync("/sunset-painting.png");
      if (disposed) { texture.dispose(); return; }
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" }); }
      catch { texture.dispose(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
      camera.position.z = 1;
      const geometry = new THREE.PlaneGeometry(2, 2);
      const rippleCount = 8;
      const ripples = Array.from({ length: rippleCount }, () => new THREE.Vector4(-2, -2, -100, 0));
      const uniforms = {
        painting: { value: texture }, time: { value: 0 },
        aspect: { value: 1 }, crop: { value: new THREE.Vector2(1, 1) },
        viewportHeight: { value: 800 },
        boat: { value: new THREE.Vector2(0.26, 0.32) },
        boatEnergy: { value: 0 },
        nightMix: { value: nightRef.current ? 1 : 0 },
        travel: { value: new THREE.Vector3().setScalar(nightRef.current ? 1.45 : 0) },
        ripples: { value: ripples },
        foregroundBird: { value: -1 },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: `
          uniform sampler2D painting;
          uniform float time, aspect, viewportHeight, boatEnergy, nightMix, foregroundBird;
          uniform vec3 travel;
          uniform vec2 crop, boat;
          uniform vec4 ripples[8];
          varying vec2 vUv;
          float starHash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          vec3 nightPainting(vec3 paint, vec2 uv, float water) {
            float luminance = dot(paint, vec3(0.299, 0.587, 0.114));
            // Preserve every painted cloud and brushstroke under cool moonlight.
            vec3 shadow = vec3(0.018, 0.028, 0.080);
            vec3 moonlit = vec3(0.22, 0.31, 0.46);
            vec3 result = mix(shadow, moonlit, pow(luminance, 1.8) * 0.78);
            result += vec3(0.028, 0.014, 0.058) * paint.r;
            result *= mix(1.0, 0.76, water);
            vec2 moonDelta = (uv - vec2(0.505, 0.348)) * vec2(1.5, 1.0);
            float moonDistance = length(moonDelta);
            float halo = exp(-moonDistance * 38.0);
            result += vec3(0.20, 0.28, 0.38) * halo;
            float moon = 1.0 - smoothstep(0.015, 0.0165, moonDistance);
            float lunarTexture = 0.94 + sin(uv.x * 810.0) * sin(uv.y * 690.0) * 0.035;
            result = mix(result, vec3(0.87, 0.92, 1.0) * lunarTexture, moon);
            // Sparse stars fade toward the horizon and behind brighter clouds.
            vec2 grid = uv * vec2(110.0, 74.0);
            vec2 cell = floor(grid);
            float seed = starHash(cell);
            vec2 offset = vec2(starHash(cell + 3.7), starHash(cell + 9.2)) * 0.6 + 0.2;
            float starDistance = length(fract(grid) - offset);
            float aa = max(fwidth(grid.x), fwidth(grid.y)) * 0.65;
            float stars = (1.0 - smoothstep(0.025, 0.055 + aa, starDistance)) * step(0.974, seed);
            stars *= smoothstep(0.40, 0.65, uv.y) * (1.0 - smoothstep(0.55, 0.95, luminance));
            stars *= 0.65 + sin(time * 0.8 + seed * 90.0) * 0.25;
            result += vec3(0.72, 0.83, 1.0) * stars;
            float reflectionWidth = 0.013 + max(0.0, 0.33 - uv.y) * 0.17;
            float reflection = exp(-pow((uv.x - 0.505) / reflectionWidth, 2.0));
            // Let the original painted reflections supply the texture.
            float paintedLight = smoothstep(0.25, 0.9, luminance);
            result += vec3(0.22, 0.31, 0.42) * reflection * paintedLight * water * 0.30;
            return result;
          }
          vec2 chasePath(float t) {
            float phase = t * 0.85 + sin(t * 0.55) * 0.22;
            return vec2(
              0.505 + sin(phase) * 0.095 + sin(phase * 3.0) * 0.008,
              0.425 + sin(phase * 2.0) * 0.049 + cos(phase) * 0.015
            );
          }
          float wingStroke(vec2 p, vec2 a, vec2 b, float startWidth, float endWidth) {
            vec2 segment = b - a;
            float along = clamp(dot(p - a, segment) / dot(segment, segment), 0.0, 1.0);
            float distance = length(p - a - along * segment);
            return distance - mix(startWidth, endWidth, along);
          }
          float birdSilhouette(vec2 p, float phase) {
            // A soft V with tapered, bent wings, alternating flaps and glides.
            float flutter = sin(time * 3.8 + phase);
            float glide = smoothstep(-0.25, 0.65, sin(time * 0.55 + phase));
            float lift = mix(flutter * 0.45, 0.32, glide);
            vec2 body = vec2(0.0, -0.12);
            vec2 leftElbow = vec2(-0.43, 0.13 + lift * 0.45);
            vec2 rightElbow = vec2(0.43, 0.17 + lift * 0.45);
            float d = wingStroke(p, body, leftElbow, 0.095, 0.085);
            d = min(d, wingStroke(p, leftElbow, vec2(-0.94, 0.12 + lift), 0.085, 0.015));
            d = min(d, wingStroke(p, body, rightElbow, 0.095, 0.085));
            d = min(d, wingStroke(p, rightElbow, vec2(0.9, 0.22 + lift), 0.085, 0.015));
            d = min(d, length((p - vec2(0.0, -0.10)) * vec2(1.0, 0.7)) - 0.10);
            return 1.0 - smoothstep(-0.025, 0.055, d);
          }
          float boatSilhouette(vec2 p) {
            // Raised bow on the right, a low cabin, and a small smokestack.
            float hull = max(max(-p.y, p.y - 0.30 - p.x * 0.07),
              max(-p.x - 0.72 - p.y * 0.7, p.x - 0.65 - p.y * 1.1));
            float cabin = max(abs(p.x + 0.24) - 0.30, abs(p.y - 0.47) - 0.23);
            float window = max(abs(p.x + 0.17) - 0.13, abs(p.y - 0.51) - 0.085);
            cabin = max(cabin, -window);
            float stack = max(abs(p.x + 0.40) - 0.075, abs(p.y - 0.76) - 0.12);
            float rail = wingStroke(p, vec2(-0.78, 0.34), vec2(0.86, 0.43), 0.035, 0.025);
            return 1.0 - smoothstep(-0.025, 0.035, min(min(hull, cabin), min(stack, rail)));
          }
          void main() {
            vec2 uv = (vUv - 0.5) * crop + 0.5;
            float water = 1.0 - smoothstep(0.29, 0.335, uv.y);
            float depth = clamp((0.335 - uv.y) / 0.335, 0.0, 1.0);
            vec2 drift = vec2(
              sin(uv.y * 160.0 + time * 0.7) * 0.0018 + sin(uv.y * 71.0 - time * 0.45) * 0.002,
              sin(uv.x * 22.0 + uv.y * 85.0 + time * 0.6) * 0.0009
            ) * water * (0.2 + depth);
            vec2 boatDelta = (vUv - boat) * vec2(aspect, 1.0);
            float trail = max(0.0, -boatDelta.x);
            float wakeBand = abs(abs(boatDelta.y + 0.004) - trail * 0.16);
            float wake = exp(-wakeBand * 700.0 - trail * 20.0)
              * smoothstep(0.0, 0.015, trail) * (1.0 - smoothstep(0.0, 0.018, boatDelta.y));
            drift.y += sin(trail * 260.0 - time * 2.0) * wake * (0.001 + boatEnergy * 0.003);
            for (int i = 0; i < 8; i++) {
              float age = time - ripples[i].z;
              vec2 delta = (vUv - ripples[i].xy) * vec2(aspect, 1.0);
              float d = length(delta);
              float front = d - age * 0.12;
              float envelope = exp(-front * front * 500.0) * exp(-age * 1.1);
              float wave = sin(front * 100.0) * envelope * ripples[i].w;
              drift += normalize(delta + vec2(0.0001)) * wave * 0.006 * water;
            }
            vec3 color = texture2D(painting, clamp(uv + drift, 0.001, 0.999)).rgb;
            color = mix(color, nightPainting(color, uv + drift, water), nightMix);
            vec3 wakeColor = mix(vec3(0.96, 0.76, 0.58), vec3(0.44, 0.59, 0.76), nightMix);
            color = mix(color, wakeColor, wake * (0.10 + boatEnergy * 0.12));
            float boatSize = clamp(viewportHeight * 0.025, 11.0, 22.0) / viewportHeight;
            float bob = sin(time * 1.6) * 0.001 + sin(time * 5.0) * boatEnergy * 0.0025;
            vec2 boatPoint = (boatDelta - vec2(0.0, bob)) / boatSize;
            float rock = sin(time * 1.3) * 0.035 + sin(time * 4.2) * boatEnergy * 0.14;
            boatPoint = mat2(cos(rock), -sin(rock), sin(rock), cos(rock)) * boatPoint;
            if (abs(boatPoint.x) < 1.4 && boatPoint.y > -0.3 && boatPoint.y < 1.2) {
              color = mix(color, mix(vec3(0.075, 0.095, 0.11), vec3(0.009, 0.015, 0.029), nightMix), boatSilhouette(boatPoint) * 0.97);
              float cabinLight = exp(-length((boatPoint - vec2(-0.17, 0.51)) * vec2(1.0, 1.5)) * 18.0);
              color += vec3(1.0, 0.65, 0.26) * cabinLight * nightMix * 0.8;
            }
            // A broken reflection ties the silhouette to the painted water.
            vec2 reflected = boatDelta / boatSize;
            reflected.x += sin(reflected.y * 18.0 + time * 1.4) * 0.12;
            reflected.y = -reflected.y * 1.7 - 0.10;
            if (abs(reflected.x) < 1.4 && reflected.y > 0.0 && reflected.y < 1.0 && boatDelta.y < 0.0) {
              float broken = 0.55 + 0.45 * sin(boatDelta.y * viewportHeight * 2.1 + time);
              color = mix(color, vec3(0.16, 0.18, 0.23), boatSilhouette(reflected) * broken * 0.22);
            }
            for (int i = 0; i < 2; i++) {
              if (float(i) == foregroundBird) continue;
              float index = float(i);
              float delay = 0.62 + sin(time * 0.48) * 0.20;
              float flightTime = time - index * delay;
              vec2 imageCenter = chasePath(flightTime);
              vec2 center = (imageCenter - 0.5) / crop + 0.5;
              // The birds lead the boat home, then return from the left at dawn.
              float birdTravel = i == 0 ? travel.y : travel.z;
              center.x += birdTravel * (1.12 + index * 0.07);
              center.y += sin(min(abs(birdTravel), 1.0) * 3.14159) * 0.035;
              vec2 velocity = (chasePath(flightTime + 0.04) - chasePath(flightTime - 0.04))
                / crop * vec2(aspect, 1.0);
              float size = clamp(viewportHeight * 0.016, 7.0, 15.0) / viewportHeight;
              size *= (1.0 - index * 0.10) * (0.90 + sin(flightTime * 0.85) * 0.12);
              vec2 p = (vUv - center) * vec2(aspect, 1.0) / size;
              // Bank into climbs and dives without flipping the silhouette upside down.
              float tilt = clamp(atan(velocity.y, abs(velocity.x) + 0.0001), -0.85, 0.85)
                * sign(velocity.x) * 0.65;
              p = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * p;
              if (abs(p.x) < 1.2 && abs(p.y) < 1.2) {
                float silhouette = birdSilhouette(p, index * 1.9);
                color = mix(color, mix(vec3(0.10, 0.13, 0.15), vec3(0.012, 0.020, 0.037), nightMix), silhouette * 0.94);
              }
            }
            gl_FragColor = vec4(color, 1.0);
          }`,
        depthTest: false, depthWrite: false,
      });
      scene.add(new THREE.Mesh(geometry, material));
      let frame = 0, lastTime = performance.now(), lastPointer = 0, rippleIndex = 0;
      let dirty = true;
      let travelPhase = nightRef.current ? "away" : "home";
      let lastNight = nightRef.current;
      const travelSpeed = 0.42;
      const awayPosition = new THREE.Vector3(1.45, 1.45, 1.45);
      const homePosition = new THREE.Vector3();
      // Give each silhouette its own nearby start, instead of shifting the whole group.
      const startEntry = () => {
        const time = uniforms.time.value;
        const cropX = uniforms.crop.value.x;
        const progressData = waveProgressRefProp.current?.current;
        const fillProgress = typeof progressData === "number" ? progressData : (progressData?.progress ?? 0);
        const baseStartX = THREE.MathUtils.clamp((0.265 + Math.sin(time * 0.045) * 0.015 - 0.5) / cropX + 0.5, 0.12, 0.38);
        const targetEndX = THREE.MathUtils.clamp((0.88 - 0.5) / cropX + 0.5, 0.65, 0.94);
        const boatX = THREE.MathUtils.lerp(baseStartX, targetEndX, fillProgress);
        const birdOffset = (index) => {
          const t = time - index * (0.62 + Math.sin(time * 0.48) * 0.20);
          const phase = t * 0.85 + Math.sin(t * 0.55) * 0.22;
          const imageX = 0.505 + Math.sin(phase) * 0.095 + Math.sin(phase * 3) * 0.008;
          const screenX = (imageX - 0.5) / cropX + 0.5;
          return -(screenX + 0.025 + index * 0.012) / (1.12 + index * 0.07);
        };
        uniforms.travel.value.set(-boatX - 0.025, birdOffset(0), birdOffset(1));
      };
      const updateTravel = (delta, reduced) => {
        const night = nightRef.current;
        if (reduced) {
          uniforms.travel.value.setScalar(night ? 1.45 : 0);
          travelPhase = night ? "away" : "home";
          lastNight = night;
          return;
        }
        if (night !== lastNight) {
          if (night && travelPhase !== "away") travelPhase = "leaving";
          if (!night && travelPhase === "away") {
            startEntry();
            travelPhase = "entering";
          }
          lastNight = night;
        }
        // Finish an interrupted departure before re-entering: never jump onscreen.
        if (travelPhase === "leaving") {
          uniforms.travel.value.addScalar(delta * travelSpeed).min(awayPosition);
          if (uniforms.travel.value.x === 1.45 && uniforms.travel.value.y === 1.45 && uniforms.travel.value.z === 1.45) {
            travelPhase = night ? "away" : "entering";
            if (!night) startEntry();
          }
        } else if (travelPhase === "entering") {
          uniforms.travel.value.addScalar(delta * travelSpeed).min(homePosition);
          if (uniforms.travel.value.lengthSq() === 0) travelPhase = "home";
        }
      };
      const positionBoat = () => {
        const time = uniforms.time.value;
        const imageX = 0.265 + Math.sin(time * 0.045) * 0.015;
        const crop = uniforms.crop.value;

        // Wave fill progress (0 = initial left position, 1 = right side near edge)
        const progressData = waveProgressRefProp.current?.current;
        const fillProgress = typeof progressData === "number" ? progressData : (progressData?.progress ?? 0);

        // Progress-bar logic: as screen fills with waves, ship moves toward right side
        const baseStartX = THREE.MathUtils.clamp((imageX - 0.5) / crop.x + 0.5, 0.12, 0.38);
        const targetEndX = THREE.MathUtils.clamp((0.88 - 0.5) / crop.x + 0.5, 0.65, 0.94);
        const boatX = THREE.MathUtils.lerp(baseStartX, targetEndX, fillProgress);

        // Subtle lift with the wave swell as it sails
        const swellLift = fillProgress * 0.010;
        const boatY = (0.322 - 0.5) / crop.y + 0.5 + swellLift;

        uniforms.boat.value.set(
          boatX + uniforms.travel.value.x,
          boatY,
        );
      };
      const drawForegroundBird = (ctx, width, height) => {
        const time = uniforms.time.value;
        const crop = uniforms.crop.value;
        const aspect = uniforms.aspect.value;
        const viewportHeight = uniforms.viewportHeight.value;
        const nightMix = uniforms.nightMix.value;
        const travel = uniforms.travel.value;

        // Determine which bird is in foreground vs background based on 3D orbit depth (z = cos(phase))
        const phase0 = time * 0.85 + Math.sin(time * 0.55) * 0.22;
        const delay = 0.62 + Math.sin(time * 0.48) * 0.20;
        const flightTime1 = time - delay;
        const phase1 = flightTime1 * 0.85 + Math.sin(flightTime1 * 0.55) * 0.22;

        const z0 = Math.cos(phase0);
        const z1 = Math.cos(phase1);

        // The closer bird (higher z in orbit) glides above the text; the other glides beneath the text.
        // As they circle the sun, this naturally and smoothly alternates ("vice versa").
        const fgIndex = z0 >= z1 ? 0 : 1;
        uniforms.foregroundBird.value = fgIndex;

        const flightTime = fgIndex === 0 ? time : flightTime1;
        const phase = fgIndex === 0 ? phase0 : phase1;

        // Exact original chasePath
        const imageX = 0.505 + Math.sin(phase) * 0.095 + Math.sin(phase * 3.0) * 0.008;
        const imageY = 0.425 + Math.sin(phase * 2.0) * 0.049 + Math.cos(phase) * 0.015;

        let centerX = (imageX - 0.5) / crop.x + 0.5;
        let centerY = (imageY - 0.5) / crop.y + 0.5;

        const birdTravel = fgIndex === 0 ? travel.y : travel.z;
        centerX += birdTravel * (1.12 + fgIndex * 0.07);
        centerY += Math.sin(Math.min(Math.abs(birdTravel), 1.0) * Math.PI) * 0.035;

        // Skip if bird has flown far off screen (e.g. at night)
        if (centerX < -0.3 || centerX > 1.3 || centerY < -0.3 || centerY > 1.3) return;

        // Velocity for banking/tilt
        const chasePathAt = (t) => {
          const ph = t * 0.85 + Math.sin(t * 0.55) * 0.22;
          return {
            x: 0.505 + Math.sin(ph) * 0.095 + Math.sin(ph * 3.0) * 0.008,
            y: 0.425 + Math.sin(ph * 2.0) * 0.049 + Math.cos(ph) * 0.015,
          };
        };

        const pPlus = chasePathAt(flightTime + 0.04);
        const pMinus = chasePathAt(flightTime - 0.04);
        const velX = ((pPlus.x - pMinus.x) / crop.x) * aspect;
        const velY = (pPlus.y - pMinus.y) / crop.y;

        let size = Math.max(7.0, Math.min(15.0, viewportHeight * 0.016)) / viewportHeight;
        size *= (1.0 - fgIndex * 0.10) * (0.90 + Math.sin(flightTime * 0.85) * 0.12);

        const tilt = Math.max(-0.85, Math.min(0.85, Math.atan2(velY, Math.abs(velX) + 0.0001)))
          * Math.sign(velX) * 0.65;

        // Wing flap dynamics
        const flutter = Math.sin(time * 3.8 + fgIndex * 1.9);
        const glideSin = Math.sin(time * 0.55 + fgIndex * 1.9);
        const glideT = Math.max(0, Math.min(1, (glideSin - (-0.25)) / (0.65 - (-0.25))));
        const glide = glideT * glideT * (3 - 2 * glideT);
        const lift = flutter * 0.45 * (1 - glide) + 0.32 * glide;

        const leftElbow = { x: -0.43, y: 0.13 + lift * 0.45 };
        const rightElbow = { x: 0.43, y: 0.17 + lift * 0.45 };
        const leftTip = { x: -0.94, y: 0.12 + lift };
        const rightTip = { x: 0.90, y: 0.22 + lift };

        const screenX = centerX * width;
        const screenY = (1.0 - centerY) * height;
        const birdPixelSize = size * height;

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(-tilt);
        ctx.scale(birdPixelSize, -birdPixelSize);

        // Soft drop shadow creates authentic 3D elevation over text
        ctx.shadowColor = nightMix > 0.5 ? "rgba(0, 5, 15, 0.5)" : "rgba(10, 20, 30, 0.35)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;

        const r = Math.round((0.10 * (1 - nightMix) + 0.012 * nightMix) * 255);
        const g = Math.round((0.13 * (1 - nightMix) + 0.020 * nightMix) * 255);
        const b = Math.round((0.15 * (1 - nightMix) + 0.037 * nightMix) * 255);
        const birdColor = `rgba(${r}, ${g}, ${b}, 0.95)`;

        ctx.fillStyle = birdColor;
        ctx.strokeStyle = birdColor;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Body ellipse
        ctx.beginPath();
        ctx.ellipse(0.0, -0.10, 0.10, 0.14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Left wing
        ctx.beginPath();
        ctx.lineWidth = 0.18;
        ctx.moveTo(0.0, -0.12);
        ctx.lineTo(leftElbow.x, leftElbow.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 0.10;
        ctx.moveTo(leftElbow.x, leftElbow.y);
        ctx.lineTo(leftElbow.x * 0.5 + leftTip.x * 0.5, leftElbow.y * 0.5 + leftTip.y * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 0.04;
        ctx.moveTo(leftElbow.x * 0.5 + leftTip.x * 0.5, leftElbow.y * 0.5 + leftTip.y * 0.5);
        ctx.lineTo(leftTip.x, leftTip.y);
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.lineWidth = 0.18;
        ctx.moveTo(0.0, -0.12);
        ctx.lineTo(rightElbow.x, rightElbow.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 0.10;
        ctx.moveTo(rightElbow.x, rightElbow.y);
        ctx.lineTo(rightElbow.x * 0.5 + rightTip.x * 0.5, rightElbow.y * 0.5 + rightTip.y * 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 0.04;
        ctx.moveTo(rightElbow.x * 0.5 + rightTip.x * 0.5, rightElbow.y * 0.5 + rightTip.y * 0.5);
        ctx.lineTo(rightTip.x, rightTip.y);
        ctx.stroke();

        ctx.restore();
      };

      const resize = () => {
        const width = container.clientWidth, height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height);
        const aspect = width / height;
        uniforms.aspect.value = aspect;
        uniforms.viewportHeight.value = height;
        // Cover the viewport; preserve the original painting's proportions.
        uniforms.crop.value.set(Math.min(1, aspect / 1.5), Math.min(1, 1.5 / aspect));
        positionBoat();

        const fgCanvas = foregroundCanvasRefProp.current?.current;
        if (fgCanvas) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          fgCanvas.width = width * dpr;
          fgCanvas.height = height * dpr;
          fgCanvas.style.width = `${width}px`;
          fgCanvas.style.height = `${height}px`;
        }
        dirty = true;
      };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      const onPointer = (event) => {
        if (pausedRef.current || performance.now() - lastPointer < 110) return;
        if (event.target?.closest?.("button, a, dialog")) return;
        const rect = container.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = 1 - (event.clientY - rect.top) / rect.height;
        const boat = uniforms.boat.value;
        const distance = Math.hypot((x - boat.x) * uniforms.aspect.value, y - boat.y);
        const nearBoat = distance < 0.085;
        const imageY = (y - 0.5) * uniforms.crop.value.y + 0.5;
        if (imageY > 0.335 && !nearBoat) return;
        if (nearBoat) uniforms.boatEnergy.value = Math.min(1, uniforms.boatEnergy.value + 0.45);
        ripples[rippleIndex].set(
          nearBoat ? boat.x : x,
          nearBoat ? boat.y - 0.006 : y,
          uniforms.time.value,
          nearBoat ? 1.6 : 1,
        );
        rippleIndex = (rippleIndex + 1) % rippleCount;
        lastPointer = performance.now();
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let lastProgress = 0;
      const render = (now) => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const targetTheme = nightRef.current ? 1 : 0;
        const themeChanging = uniforms.nightMix.value !== targetTheme;
        const traveling = travelPhase === "leaving" || travelPhase === "entering" || nightRef.current !== lastNight;

        const progressData = waveProgressRefProp.current?.current;
        const fillProgress = typeof progressData === "number" ? progressData : (progressData?.progress ?? 0);
        const velocity = progressData?.velocity ?? 0;

        // Dynamic energy surge: kicks up wake foam, rocking, and bobbing during scroll
        if (velocity > 0.0005) {
          uniforms.boatEnergy.value = Math.min(1.0, uniforms.boatEnergy.value + velocity * 14.0);
        }

        const progressChanging = Math.abs(fillProgress - lastProgress) > 0.0002;
        if (progressChanging) {
          dirty = true;
          lastProgress = fillProgress;
        }

        if (document.hidden || (pausedRef.current && !dirty && !themeChanging && !traveling && !progressChanging)) return;
        updateTravel(delta, reducedMotion.matches);
        if (themeChanging) {
          const step = reducedMotion.matches ? 1 : delta / 1.4;
          const difference = targetTheme - uniforms.nightMix.value;
          uniforms.nightMix.value += Math.sign(difference) * Math.min(Math.abs(difference), step);
        }
        if (!pausedRef.current) {
          uniforms.time.value += delta;
          uniforms.boatEnergy.value *= Math.exp(-delta * 1.3);
        }
        positionBoat();
        dirty = false;

        const fgCanvas = foregroundCanvasRefProp.current?.current;
        if (fgCanvas) {
          const width = container.clientWidth;
          const height = Math.max(1, container.clientHeight);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const ctx = fgCanvas.getContext("2d");
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            drawForegroundBird(ctx, width, height);
          } else {
            uniforms.foregroundBird.value = -1;
          }
        } else {
          uniforms.foregroundBird.value = -1;
        }

        renderer.render(scene, camera);
      };
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerdown", onPointer);
        geometry.dispose(); material.dispose(); texture.dispose(); renderer.dispose();
        renderer.domElement.remove();
        const fgCanvas = foregroundCanvasRefProp.current?.current;
        if (fgCanvas) {
          const ctx = fgCanvas.getContext("2d");
          ctx?.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
        }
      };
      render(performance.now());
      setReady(true);
    }
    setup().catch(() => { cleanup(); });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={host} className={`wave-scene ${ready ? "is-ready" : ""}`} aria-hidden="true"><div className="scene-fallback" /></div>;
}
