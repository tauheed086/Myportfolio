"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { profile, projects } from "./content";

// =========================================================================
// Procedural Canvas Texture Generators for 3D Celestial Bodies
// Generates photorealistic spherical planet textures without external assets
// =========================================================================

function createIceGiantTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Deep azure-cyan background
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#082f49");
  grad.addColorStop(0.2, "#0284c7");
  grad.addColorStop(0.5, "#38bdf8");
  grad.addColorStop(0.8, "#0369a1");
  grad.addColorStop(1.0, "#082f49");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Atmospheric ice wind bands
  for (let y = 0; y < 256; y += 4) {
    const bandAlpha = 0.08 + Math.sin(y * 0.14) * 0.06;
    ctx.fillStyle = y % 8 === 0 ? `rgba(224, 242, 254, ${bandAlpha})` : `rgba(14, 165, 233, ${bandAlpha})`;
    ctx.fillRect(0, y, 512, 3);
  }

  // Soft atmospheric swirl clouds
  for (let i = 0; i < 28; i++) {
    const x = Math.random() * 512;
    const y = 40 + Math.random() * 176;
    const rad = 25 + Math.random() * 50;
    const radial = ctx.createRadialGradient(x, y, 0, x, y, rad);
    radial.addColorStop(0, "rgba(240, 249, 255, 0.22)");
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createSolarAmberTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Molten amber/solar base
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#451a03");
  grad.addColorStop(0.25, "#b45309");
  grad.addColorStop(0.5, "#f59e0b");
  grad.addColorStop(0.75, "#d97706");
  grad.addColorStop(1.0, "#451a03");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Turbulent solar bands
  for (let y = 0; y < 256; y += 3) {
    const alpha = 0.12 + Math.sin(y * 0.18) * 0.08;
    ctx.fillStyle = y % 6 === 0 ? `rgba(254, 243, 199, ${alpha})` : `rgba(180, 83, 9, ${alpha})`;
    ctx.fillRect(0, y, 512, 2.5);
  }

  // Giant data plasma vortex (Great Amber Storm Spot)
  const stormX = 320;
  const stormY = 160;
  const stormRad = 45;
  const stormGrad = ctx.createRadialGradient(stormX, stormY, 5, stormX, stormY, stormRad);
  stormGrad.addColorStop(0, "rgba(254, 240, 138, 0.7)");
  stormGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.45)");
  stormGrad.addColorStop(1, "transparent");
  ctx.fillStyle = stormGrad;
  ctx.beginPath();
  ctx.ellipse(stormX, stormY, stormRad * 1.5, stormRad * 0.8, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createEmeraldBioTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Deep emerald oceanic realm
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#022c22");
  grad.addColorStop(0.3, "#065f46");
  grad.addColorStop(0.5, "#047857");
  grad.addColorStop(0.7, "#064e3b");
  grad.addColorStop(1.0, "#022c22");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Bioluminescent neural landmasses & patterns
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = 30 + Math.random() * 196;
    const r = 18 + Math.random() * 42;
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, "rgba(110, 231, 183, 0.55)");
    radial.addColorStop(0.6, "rgba(16, 185, 129, 0.25)");
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Neural network branching lines
  ctx.strokeStyle = "rgba(167, 243, 208, 0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    let lx = Math.random() * 512;
    let ly = Math.random() * 256;
    ctx.moveTo(lx, ly);
    for (let j = 0; j < 4; j++) {
      lx += (Math.random() - 0.5) * 80;
      ly += (Math.random() - 0.5) * 60;
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
  }

    const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createTurfArenaTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Emerald stadium pitch base with electric sports energy
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#022c22");
  grad.addColorStop(0.2, "#065f46");
  grad.addColorStop(0.5, "#059669");
  grad.addColorStop(0.8, "#047857");
  grad.addColorStop(1.0, "#022c22");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Concentric stadium boundary rings & crease lines
  for (let i = 0; i < 16; i++) {
    const y = 20 + i * 14;
    ctx.strokeStyle = i % 4 === 0 ? "rgba(110, 231, 183, 0.4)" : "rgba(52, 211, 153, 0.18)";
    ctx.lineWidth = i % 4 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Floodlit pitch glowing energy arcs
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * 512;
    const y = 30 + Math.random() * 196;
    const r = 20 + Math.random() * 45;
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, "rgba(52, 211, 153, 0.55)");
    radial.addColorStop(0.5, "rgba(16, 185, 129, 0.2)");
    radial.addColorStop(1, "transparent");
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createTerraOceanTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Deep sapphire living ocean
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, "#0f172a");
  grad.addColorStop(0.2, "#1e3a8a");
  grad.addColorStop(0.5, "#1d4ed8");
  grad.addColorStop(0.8, "#1e3a8a");
  grad.addColorStop(1.0, "#0f172a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Continental landmasses
  ctx.fillStyle = "rgba(13, 148, 136, 0.65)";
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * 512;
    const y = 40 + Math.random() * 176;
    const w = 40 + Math.random() * 80;
    const h = 25 + Math.random() * 55;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Continental coastal green rim
  ctx.fillStyle = "rgba(34, 197, 94, 0.4)";
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * 512;
    const y = 40 + Math.random() * 176;
    ctx.beginPath();
    ctx.arc(x, y, 20 + Math.random() * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Atmospheric swirl cloud layers
  for (let i = 0; i < 35; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 25 + Math.random() * 60;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, "rgba(255, 255, 255, 0.45)");
    cloud.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
    cloud.addColorStop(1, "transparent");
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createRingTexture(hexColor) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 256, 16);
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0.0, "transparent");
  grad.addColorStop(0.15, hexColor + "55");
  grad.addColorStop(0.35, hexColor + "cc");
  grad.addColorStop(0.55, "transparent"); // Cassini division gap
  grad.addColorStop(0.65, hexColor + "ee");
  grad.addColorStop(0.88, hexColor + "88");
  grad.addColorStop(1.0, "transparent");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 16);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.2, "rgba(224, 242, 254, 0.95)");
  grad.addColorStop(0.5, "rgba(56, 189, 248, 0.45)");
  grad.addColorStop(1, "rgba(1, 10, 18, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// =========================================================================
// Main 3D Space Travel WebGL Scene Component
// =========================================================================
export default function SpaceTravelScene({ flightProgressRef }) {
  const containerRef = useRef(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState(-1);
  const [showBrandGate, setShowBrandGate] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isHoveringPlanet, setIsHoveringPlanet] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock scroll, handle Escape key, and hide floating navigation when Modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedProject) {
        setSelectedProject(null);
      }
    };

    if (selectedProject) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.start();
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [selectedProject]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x01090e, 0.00038);

    const camera = new THREE.PerspectiveCamera(58, width / height, 1, 8000);
    camera.position.set(0, 0, 250);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x162b3d, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
    sunLight.position.set(280, 180, 120);
    scene.add(sunLight);

    // 3. Dynamic Multi-Layered Moving Starfield Systems
    const starTexture = createStarTexture();

    // Layer A: Main 3D Deep Space Star Corridor (Continuous forward flight & warp streaming)
    const starCount = 3600;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      starPositions[idx] = (Math.random() - 0.5) * 2200;
      starPositions[idx + 1] = (Math.random() - 0.5) * 1500;
      // Distributed along the forward flight corridor from +300 to -4500
      starPositions[idx + 2] = 300 - Math.random() * 4800;

      // Color temperature variation (radiant blue-white, golden amber, cool cyan)
      const tone = Math.random();
      if (tone > 0.8) {
        starColors[idx] = 1.0; starColors[idx + 1] = 0.9; starColors[idx + 2] = 0.7; // Warm gold
      } else if (tone > 0.4) {
        starColors[idx] = 0.65; starColors[idx + 1] = 0.88; starColors[idx + 2] = 1.0; // Cyan-blue
      } else {
        starColors[idx] = 0.95; starColors[idx + 1] = 0.98; starColors[idx + 2] = 1.0; // Pure white
      }
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 3.2,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Layer B: Fast Cosmic Warp Dust (Streams past camera with high-speed depth)
    const dustCount = 550;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const idx = i * 3;
      dustPositions[idx] = (Math.random() - 0.5) * 1100;
      dustPositions[idx + 1] = (Math.random() - 0.5) * 800;
      dustPositions[idx + 2] = 200 - Math.random() * 3200;

      dustColors[idx] = 0.45;
      dustColors[idx + 1] = 0.85;
      dustColors[idx + 2] = 1.0; // Radiant cyan ion dust
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));

    const dustMat = new THREE.PointsMaterial({
      size: 4.8,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dustField = new THREE.Points(dustGeo, dustMat);
    scene.add(dustField);

    // Layer C: Distant Deep Galaxy Cosmos (Slow rotating cosmic background)
    const distantCount = 1400;
    const distantPositions = new Float32Array(distantCount * 3);
    for (let i = 0; i < distantCount; i++) {
      const idx = i * 3;
      const radius = 2200 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      distantPositions[idx] = radius * Math.cos(phi) * Math.cos(theta);
      distantPositions[idx + 1] = radius * Math.sin(phi);
      distantPositions[idx + 2] = radius * Math.cos(phi) * Math.sin(theta) - 2200;
    }

    const distantGeo = new THREE.BufferGeometry();
    distantGeo.setAttribute("position", new THREE.BufferAttribute(distantPositions, 3));
    const distantMat = new THREE.PointsMaterial({
      size: 2.2,
      map: starTexture,
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const distantStars = new THREE.Points(distantGeo, distantMat);
    scene.add(distantStars);

    // 4. Create the 4 Celestial Worlds in 3D Space
    const planetMeshes = [];
    const planetGroups = [];

    // Planet Configs along the flight path:
    // P0: z = -550 (left) - Seamie
    // P1: z = -1350 (right) - Quick Win Bot
    // P2: z = -2150 (left) - Turf Hero
    // P3: z = -2950 (right) - Synovial Fluid Detection
    // P4: z = -3750 (center) - Nexus LMS
    const planetConfigs = [
      {
        id: 0,
        name: "Seamie Software Installer",
        radius: 44,
        pos: new THREE.Vector3(-46, 6, -550),
        texture: createIceGiantTexture(),
        ring: { color: "#38bdf8", inner: 58, outer: 92, rotX: 1.25, rotY: -0.32 },
        hasAurora: false,
        hasMoon: false,
        emissiveColor: 0x0284c7
      },
      {
        id: 1,
        name: "Quick Win Bot",
        radius: 52,
        pos: new THREE.Vector3(48, -6, -1350),
        texture: createSolarAmberTexture(),
        ring: { color: "#f59e0b", inner: 68, outer: 108, rotX: 1.15, rotY: 0.28 },
        hasAurora: false,
        hasMoon: false,
        emissiveColor: 0xb45309
      },
      {
        id: 2,
        name: "Turf Hero",
        radius: 48,
        pos: new THREE.Vector3(-44, 5, -2150),
        texture: createTurfArenaTexture(),
        ring: { color: "#10b981", inner: 62, outer: 98, rotX: 1.2, rotY: -0.25 },
        hasAurora: false,
        hasMoon: false,
        emissiveColor: 0x059669
      },
      {
        id: 3,
        name: "Synovial Fluid Detection",
        radius: 46,
        pos: new THREE.Vector3(44, -4, -2950),
        texture: createEmeraldBioTexture(),
        ring: null,
        hasAurora: true,
        hasMoon: false,
        emissiveColor: 0x059669
      },
      {
        id: 4,
        name: "Nexus LMS",
        radius: 50,
        pos: new THREE.Vector3(0, 0, -3750),
        texture: createTerraOceanTexture(),
        ring: null,
        hasAurora: false,
        hasMoon: true,
        emissiveColor: 0x2563eb
      }
    ];

    planetConfigs.forEach((cfg, idx) => {
      const group = new THREE.Group();
      group.position.copy(cfg.pos);

      // Sphere Geometry & Material
      const sphereGeo = new THREE.SphereGeometry(cfg.radius, 48, 48);
      const sphereMat = new THREE.MeshStandardMaterial({
        map: cfg.texture,
        roughness: 0.55,
        metalness: 0.15,
        emissive: new THREE.Color(cfg.emissiveColor),
        emissiveIntensity: 0.12
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.userData = { projectIndex: idx };
      group.add(sphereMesh);
      planetMeshes.push(sphereMesh);

      // Planetary Rings
      if (cfg.ring) {
        const ringGeo = new THREE.RingGeometry(cfg.ring.inner, cfg.ring.outer, 64);
        const ringTexture = createRingTexture(cfg.ring.color);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = cfg.ring.rotX;
        ringMesh.rotation.y = cfg.ring.rotY;
        group.add(ringMesh);
      }

      // Emerald Aurora Atmosphere Shell
      if (cfg.hasAurora) {
        const auroraGeo = new THREE.SphereGeometry(cfg.radius * 1.12, 32, 32);
        const auroraMat = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          transparent: true,
          opacity: 0.28,
          wireframe: true
        });
        const auroraMesh = new THREE.Mesh(auroraGeo, auroraMat);
        group.add(auroraMesh);
        group.userData.aurora = auroraMesh;
      }

      // Orbiting Satellite Moonlet
      if (cfg.hasMoon) {
        const moonGeo = new THREE.SphereGeometry(4.5, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          color: 0x93c5fd,
          roughness: 0.4,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.3
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(cfg.radius + 28, 6, 0);
        group.add(moonMesh);
        group.userData.moon = moonMesh;
      }

      scene.add(group);
      planetGroups.push(group);
    });



    // 5. Raycasting Interaction (Hover & Click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e) => {
      const rawProgress = flightProgressRef?.current ?? 0;
      if (rawProgress <= 0.02) {
        renderer.domElement.style.cursor = "default";
        setIsHoveringPlanet(false);
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes, false);

      if (intersects.length > 0) {
        renderer.domElement.style.cursor = "pointer";
        setIsHoveringPlanet(true);
      } else {
        renderer.domElement.style.cursor = "default";
        setIsHoveringPlanet(false);
      }
    };

    const onPointerDown = (e) => {
      const rawProgress = flightProgressRef?.current ?? 0;
      if (rawProgress <= 0.02) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetMeshes, false);

      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.projectIndex;
        if (idx !== undefined && projects[idx]) {
          setSelectedProject(projects[idx]);
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onPointerDown);

    // 6. Responsive Resize
    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // 7. Smooth 60fps Flight Render Loop
    let animId;
    let smoothedProgress = 0;
    let lastProgress = 0;
    let flightVelocity = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Read flight progress scrubbed by user scroll
      const rawTargetProgress = flightProgressRef?.current ?? 0;
      smoothedProgress += (rawTargetProgress - smoothedProgress) * 0.12;

      // 100% hide all 3D planets and HUD during ocean-to-space dissolve phase
      // Only the serene starfield is rendered until space flight begins
      const arePlanetsActive = smoothedProgress > 0.03 && rawTargetProgress > 0.001;
      planetGroups.forEach((g) => {
        g.visible = arePlanetsActive;
      });

      // Camera Z moves along flight corridor from +250 to -4450 across all 5 worlds
      const camZ = 250 - smoothedProgress * 4700;
      camera.position.z += (camZ - camera.position.z) * 0.15;

      // Camera lateral banking curve towards active planets
      let steerX = 0;
      let steerY = 0;
      let activeIdx = -1;

      if (!arePlanetsActive) {
        steerX = 0;
        steerY = 0;
        activeIdx = -1;
      } else if (smoothedProgress >= 0.06 && smoothedProgress <= 0.19) {
        steerX = -14;
        steerY = 2;
        activeIdx = 0; // Seamie Software Installer
      } else if (smoothedProgress > 0.19 && smoothedProgress < 0.24) {
        steerX = 0;
        steerY = 0;
        activeIdx = -1; // Traveling through stars between worlds
      } else if (smoothedProgress >= 0.24 && smoothedProgress <= 0.37) {
        steerX = 14;
        steerY = -2;
        activeIdx = 1; // Quick Win Bot
      } else if (smoothedProgress > 0.37 && smoothedProgress < 0.42) {
        steerX = 0;
        steerY = 0;
        activeIdx = -1; // Traveling through stars between worlds
      } else if (smoothedProgress >= 0.42 && smoothedProgress <= 0.55) {
        steerX = -13;
        steerY = 1;
        activeIdx = 2; // Turf Hero
      } else if (smoothedProgress > 0.55 && smoothedProgress < 0.60) {
        steerX = 0;
        steerY = 0;
        activeIdx = -1; // Traveling through stars between worlds
      } else if (smoothedProgress >= 0.60 && smoothedProgress <= 0.73) {
        steerX = 13;
        steerY = -1;
        activeIdx = 3; // Synovial Fluid Detection
      } else if (smoothedProgress > 0.73 && smoothedProgress < 0.78) {
        steerX = 0;
        steerY = 0;
        activeIdx = -1; // Traveling through stars between worlds
      } else if (smoothedProgress >= 0.78 && smoothedProgress <= 0.89) {
        steerX = 0;
        steerY = 0;
        activeIdx = 4; // Nexus LMS
      } else {
        // Beyond Planet 4: The Brand Gate Station
        steerX = 0;
        steerY = 0;
        activeIdx = -1;
      }

      const isGate = arePlanetsActive && smoothedProgress > 0.89;
      setShowBrandGate((prev) => (prev !== isGate ? isGate : prev));

      camera.position.x += (steerX - camera.position.x) * 0.08;
      camera.position.y += (steerY - camera.position.y) * 0.08;
      camera.lookAt(camera.position.x * 0.35, camera.position.y * 0.35, camera.position.z - 350);

      // =====================================================================
      // DYNAMIC STARFIELD MOTION: Continuous Cruising & Scroll Warp Streaming
      // =====================================================================
      const scrollVelocity = Math.abs(smoothedProgress - lastProgress) / Math.max(delta, 0.001);
      lastProgress = smoothedProgress;

      // Smooth flight velocity with damping (warp boost on scroll!)
      flightVelocity += (scrollVelocity * 450 - flightVelocity) * 0.15;

      // Cruising forward motion + warp boost
      // When idle, stars drift at 68 units/sec forward. When scrolling, warp acceleration streams stars past camera!
      const cruisingSpeed = arePlanetsActive ? 68 : 42;
      const mainSpeed = (cruisingSpeed + flightVelocity * 2.8) * delta;
      const dustSpeed = (cruisingSpeed * 2.4 + flightVelocity * 5.6) * delta;

      // 1. Move main stars forward towards camera
      const starPosArr = starGeo.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        const zIdx = i * 3 + 2;
        starPosArr[zIdx] += mainSpeed;

        // Wrap around when passing behind camera
        if (starPosArr[zIdx] > camera.position.z + 120) {
          starPosArr[zIdx] -= 4800;
          starPosArr[i * 3] = camera.position.x + (Math.random() - 0.5) * 2200;
          starPosArr[i * 3 + 1] = camera.position.y + (Math.random() - 0.5) * 1500;
        }
      }
      starGeo.attributes.position.needsUpdate = true;

      // 2. Move high-speed warp dust streamers (close foreground flybys)
      const dustPosArr = dustGeo.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        const zIdx = i * 3 + 2;
        dustPosArr[zIdx] += dustSpeed;

        if (dustPosArr[zIdx] > camera.position.z + 80) {
          dustPosArr[zIdx] -= 3200;
          dustPosArr[i * 3] = camera.position.x + (Math.random() - 0.5) * 1100;
          dustPosArr[i * 3 + 1] = camera.position.y + (Math.random() - 0.5) * 800;
        }
      }
      dustGeo.attributes.position.needsUpdate = true;

      // 3. Subtle cosmic celestial spin & follow camera on deep background
      distantStars.rotation.z += 0.015 * delta;
      distantStars.position.z = camera.position.z - 2200;
      starField.rotation.z += 0.003 * delta;

      // Rotate all planets on their axes
      planetMeshes.forEach((mesh, i) => {
        mesh.rotation.y += (0.25 + i * 0.05) * delta;
      });

      // Orbit satellite moonlet (Nexus LMS at index 4)
      if (planetGroups[4]?.userData.moon) {
        const time = clock.getElapsedTime() * 0.8;
        const dist = 76;
        planetGroups[4].userData.moon.position.x = Math.cos(time) * dist;
        planetGroups[4].userData.moon.position.z = Math.sin(time) * dist;
      }

      // Pulse emerald aurora (Synovial Fluid Detection at index 3)
      if (planetGroups[3]?.userData.aurora) {
        const time = clock.getElapsedTime() * 1.5;
        planetGroups[3].userData.aurora.rotation.y += 0.3 * delta;
        const scale = 1.0 + Math.sin(time) * 0.04;
        planetGroups[3].userData.aurora.scale.set(scale, scale, scale);
      }

      setActiveProjectIndex(activeIdx);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onPointerDown);
      window.removeEventListener("resize", onResize);

      // Clean disposal
      starGeo.dispose();
      starMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      distantGeo.dispose();
      distantMat.dispose();
      starTexture.dispose();
      planetMeshes.forEach((m) => {
        m.geometry.dispose();
        if (m.material.map) m.material.map.dispose();
        m.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [flightProgressRef]);

  const activeProj = activeProjectIndex >= 0 ? projects[activeProjectIndex] : null;

  return (
    <div className="space-travel-container" ref={containerRef}>
      {/* Deep Ocean to Space Atmospheric Glow Backdrop */}
      <div className="space-realm-backdrop" aria-hidden="true" />

      {/* Floating Spatial Project HUD Card (Tracks with current world) */}
      {activeProj && (
        <div
          className={`space-project-hud planet-theme-${activeProj.id} hud-pos-${
            activeProjectIndex === 0
              ? "right"
              : activeProjectIndex === 1
              ? "left"
              : activeProjectIndex === 2
              ? "right"
              : activeProjectIndex === 3
              ? "left"
              : "center"
          }`}
          onClick={() => setSelectedProject(activeProj)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedProject(activeProj);
            }
          }}
        >
          <div className="hud-badge-tag">
            <span className="hud-beacon-pip" />
            <span>0{activeProjectIndex + 1} // {activeProj.category.toUpperCase()}</span>
            {activeProj.isLive && (
              <span className="hud-live-tag">
                <span className="live-pulse-dot" />
                LIVE APP
              </span>
            )}
          </div>

          <h3 className="hud-project-title">{activeProj.title}</h3>
          {activeProj.subtitle && <p className="hud-project-subtitle">{activeProj.subtitle}</p>}

          <div className="hud-actions-row">
            <div className="hud-explore-btn">
              <span className="btn-sparkle">✦</span>
              <span>CLICK PLANET TO EXPLORE</span>
              <span className="btn-arrow">↗</span>
            </div>
            {activeProj.liveUrl && (
              <a
                href={activeProj.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="hud-direct-live-btn"
                onClick={(e) => e.stopPropagation()}
                title="Launch Live Application"
              >
                <span>LAUNCH APP</span>
                <span className="btn-arrow">↗</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Brand Casing & GitHub Station (After 4th Planet) */}
      {showBrandGate && (
        <div className="space-brand-gate" role="region" aria-label="Developer Repositories & Contact">
         

          <h2 className="brand-gate-title">Explore the Source on GitHub</h2>

          <p className="brand-gate-subtitle">
            From low-level Windows endpoint telemetry engines to multithreaded backend pipelines and reactive web applications.
            Every project begins with clean code, modular architecture, and curiosity.
          </p>

          

          <div className="brand-gate-actions">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="brand-gate-btn brand-gate-btn-primary"
            >
              <svg className="gate-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Visit GitHub Repositories</span>
              <span className="btn-arrow">↗</span>
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="brand-gate-btn brand-gate-btn-secondary"
            >
              <svg className="gate-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
              <span className="btn-arrow">↗</span>
            </a>

            {profile.resume && (
              <a
                href={profile.resume}
                download
                className="brand-gate-btn brand-gate-btn-secondary"
              >
                <span>Download Résumé</span>
                <span className="btn-arrow">↓</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Cinematic Project Details Dossier Modal */}
      {selectedProject && isMounted && createPortal(
        <div
          className="project-modal-backdrop"
          onClick={() => setSelectedProject(null)}
          onWheel={(e) => e.stopPropagation()}
          data-lenis-prevent="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-project-title"
        >
          <div
            className={`project-modal-card planet-theme-${selectedProject.id}`}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            {/* Ambient Sci-Fi Cyber Corner Accents & Glow */}
            <div className="modal-cyber-glow" aria-hidden="true" />
            <div className="modal-cyber-corner corner-tl" aria-hidden="true" />
            <div className="modal-cyber-corner corner-tr" aria-hidden="true" />
            <div className="modal-cyber-corner corner-bl" aria-hidden="true" />
            <div className="modal-cyber-corner corner-br" aria-hidden="true" />

            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-tag-group">
                <span className="modal-dot" />
                <span className="modal-category">
                  PLANET // {selectedProject.id} · {selectedProject.category.toUpperCase()}
                </span>
                {selectedProject.isLive && (
                  <span className="modal-live-tag">
                    <span className="live-pulse-dot" />
                    LIVE PRODUCTION
                  </span>
                )}
                {selectedProject.award && (
                  <span className="modal-award-badge">
                    ★ {selectedProject.award}
                  </span>
                )}
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedProject(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Title Block */}
            <div className="modal-title-area">
              <h2 id="modal-project-title" className="modal-title">
                {selectedProject.title}
              </h2>
              {selectedProject.subtitle && (
                <p className="modal-subtitle">{selectedProject.subtitle}</p>
              )}
            </div>

            {/* Tech Stack Badges */}
            <div className="modal-stack-row">
              {selectedProject.stack.map((tech) => (
                <span key={tech} className="modal-tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            {/* Dedicated Scrollable Content Container (Native smooth scroll) */}
            <div
              className="modal-scrollable-body"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Modal Content Sections */}
              <div className="modal-body-grid">
                <div className="modal-card">
                  <span className="modal-card-label">PROJECT OVERVIEW</span>
                  <p className="modal-card-text">{selectedProject.description}</p>
                </div>

                {selectedProject.highlights && (
                  <div className="modal-card modal-card-highlights">
                    <span className="modal-card-label">CORE ARCHITECTURAL HIGHLIGHTS</span>
                    <ul className="modal-highlights-list">
                      {selectedProject.highlights.map((h, i) => (
                        <li key={i}>
                          <span className="highlight-bullet">▹</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-subgrid">
                  <div className="modal-card">
                    <span className="modal-card-label">CHALLENGE</span>
                    <p className="modal-card-subtext">{selectedProject.problem}</p>
                  </div>
                  {selectedProject.approach && (
                    <div className="modal-card">
                      <span className="modal-card-label">APPROACH</span>
                      <p className="modal-card-subtext">{selectedProject.approach}</p>
                    </div>
                  )}
                  <div className="modal-card">
                    <span className="modal-card-label">KEY OUTCOMES</span>
                    <p className="modal-card-subtext">{selectedProject.outcome}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <div className="modal-footer-actions">
                {selectedProject.liveUrl && (
                  <a
                    className="modal-live-btn"
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="live-pulse-dot" />
                    <span>LAUNCH LIVE APPLICATION ↗</span>
                  </a>
                )}

                {selectedProject.repoUrl && (
                  <a
                    className="modal-repo-btn"
                    href={selectedProject.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GITHUB REPO ↗</span>
                  </a>
                )}

                {!selectedProject.liveUrl && !selectedProject.repoUrl && (
                  <div className="modal-status-badge">
                    <span className="status-dot" />
                    <span>STATUS: DEPLOYED &amp; OPERATIONAL</span>
                  </div>
                )}
              </div>

              <button
                className="modal-dismiss-btn"
                onClick={() => setSelectedProject(null)}
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
