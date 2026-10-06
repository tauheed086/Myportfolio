import * as THREE from "three";

// =========================================================================
// Official Tech Stack Definitions
// 10 Icons loaded directly from /public/tech-stack/:
// Python, HTML, CSS, JavaScript, React, MySQL, PostgreSQL, Django, Git, Selenium
// =========================================================================

export const TECH_STACK = [
  {
    id: "python",
    name: "Python",
    //role: "Automation & Backend Engine",
    file: "Python",
    badgeBg: "#1e293b",
    iconColor: "#ffffff",
    glowColor: "#38bdf8"
  },
  {
    id: "html5",
    name: "HTML5",
    //role: "Semantic Web Structure",
    file: "HTML",
    badgeBg: "#e34f26",
    iconColor: "#ffffff",
    glowColor: "#f97316"
  },
  {
    id: "css3",
    name: "CSS3",
    //role: "Fluid Layouts & Visuals",
    file: "CSS",
    badgeBg: "#1572b6",
    iconColor: "#ffffff",
    glowColor: "#38bdf8"
  },
  {
    id: "javascript",
    name: "JavaScript",
    //role: "Core Interactive Runtime",
    file: "JavaScript",
    badgeBg: "#f7df1e",
    iconColor: "#000000",
    glowColor: "#facc15"
  },
  {
    id: "react",
    name: "React.js",
    //role: "Reactive UI Architectures",
    file: "React",
    badgeBg: "#0f172a",
    iconColor: "#ffffff",
    glowColor: "#61dafb"
  },
  {
    id: "mysql",
    name: "MySQL",
    //role: "Relational Indexing & Storage",
    file: "MySQL",
    badgeBg: "#00758f",
    iconColor: "#ffffff",
    glowColor: "#38bdf8"
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    //role: "ACID Concurrency Database",
    file: "PostgreSQL",
    badgeBg: "#336791",
    iconColor: "#ffffff",
    glowColor: "#60a5fa"
  },
  {
    id: "django",
    name: "Django",
    //role: "Full-Stack Web Framework",
    file: "Django",
    badgeBg: "#092e20",
    iconColor: "#ffffff",
    glowColor: "#34d399"
  },
  {
    id: "git",
    name: "Git",
    //role: "Version Control & Branching",
    file: "Git",
    badgeBg: "#f05032",
    iconColor: "#ffffff",
    glowColor: "#fb7185"
  },
  {
    id: "selenium",
    name: "Selenium",
    //role: "Automated Testing & Scraping",
    file: "Selenium",
    badgeBg: "#43b02a",
    iconColor: "#ffffff",
    glowColor: "#4ade80"
  }
];

// =========================================================================
// Cinematic 3D Poster Typography Texture
// Blockbuster depth: "// WHAT I USE TO BUILD // TECH STACK" rendered behind the planet
// =========================================================================

export function createCinematicPosterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, 2048, 1024);

  // 1. Top Kicker: // WHAT I USE TO BUILD //
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const kickerY = 175;
  // Decorative tech rule lines
  ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(560, kickerY);
  ctx.lineTo(760, kickerY);
  ctx.moveTo(1288, kickerY);
  ctx.lineTo(1488, kickerY);
  ctx.stroke();

  // Cyan terminal accent dots
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(760, kickerY, 3, 0, Math.PI * 2);
  ctx.arc(1288, kickerY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "700 22px 'Outfit', 'Inter', -apple-system, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.letterSpacing = "12px";
  ctx.fillText("// WHAT I USE TO BUILD //", 1024, kickerY);
  ctx.restore();

  // 2. Monumental 3D Title: "TECH" on left, "STACK" on right
  // Wide central clearance for planet and orbit ring
  const titleY = 512;
  const fontStr = "900 155px 'Outfit', 'Inter', -apple-system, sans-serif";
  const leftX = 410;
  const rightX = 1638;

  ctx.save();
  ctx.font = fontStr;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "12px";

  // Pass 1: Luminous deep space cyan-blue aura
  ctx.shadowColor = "rgba(56, 189, 248, 0.4)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
  ctx.fillText("TECH", leftX, titleY);
  ctx.fillText("STACK", rightX, titleY);

  // Pass 2: 3D Extrusion Depth Bevels
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillText("TECH", leftX + 4, titleY + 6);
  ctx.fillText("STACK", rightX + 4, titleY + 6);

  // Pass 3: Metallic vertical gradient fill
  const textGrad = ctx.createLinearGradient(0, titleY - 80, 0, titleY + 80);
  textGrad.addColorStop(0.0, "#ffffff");
  textGrad.addColorStop(0.25, "#f8fafc");
  textGrad.addColorStop(0.65, "#94a3b8");
  textGrad.addColorStop(1.0, "#475569");

  ctx.fillStyle = textGrad;
  ctx.fillText("TECH", leftX, titleY);
  ctx.fillText("STACK", rightX, titleY);

  // Pass 4: Crisp metallic rim highlight stroke
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1.8;
  ctx.strokeText("TECH", leftX, titleY);
  ctx.strokeText("STACK", rightX, titleY);
  ctx.restore();

  // 3. Subtitles framed neatly under each title block (leaving center wide open)
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 15px 'Courier New', monospace";
  ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
  ctx.letterSpacing = "6px";
  ctx.fillText("ARCHITECTURES & ENGINES", leftX, 625);
  ctx.fillText("MODERN WEB & AUTOMATION", rightX, 625);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// =========================================================================
// Main Tech Stack Orbit System Factory
// Uses the authentic 3D icons from /public/tech-stack/
// Clean unhovered state (zero glow) + radiant neon icon bloom on hover
// =========================================================================

export function createTechStackOrbit({ parentGroup, scene, camera }) {
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(0, 0, 0);

  // 1. Cinematic 3D Poster Text Billboard (Background layer: renderOrder = 1)
  const posterTexture = createCinematicPosterTexture();
  const posterGeo = new THREE.PlaneGeometry(1, 1);
  const posterMat = new THREE.MeshBasicMaterial({
    map: posterTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    fog: false,
    side: THREE.DoubleSide
  });
  const posterMesh = new THREE.Mesh(posterGeo, posterMat);
  posterMesh.renderOrder = 1; // Lowest renderOrder: drawn FIRST behind planet & badges
  posterMesh.position.set(0, 0, -5250);

  if (scene) {
    scene.add(posterMesh);
  } else {
    parentGroup.add(posterMesh);
  }

  // Base orbit radius outside the planet's atmospheric corona (planet r=66, corona r=82.5)
  const baseOrbitRadius = 118;
  const badgeBaseScale = 25; // Base diameter in 3D units

  const textureLoader = new THREE.TextureLoader();
  const techItems = [];
  const raycastSprites = [];

  TECH_STACK.forEach((tech, i) => {
    const itemGroup = new THREE.Group();

    // 1. Clean non-glowing sprite (authentic 3D icon from /public/tech-stack/)
    const cleanTexture = textureLoader.load(`/tech-stack/${tech.file}-clean.png`);
    cleanTexture.colorSpace = THREE.SRGBColorSpace;
    cleanTexture.generateMipmaps = true;
    cleanTexture.minFilter = THREE.LinearMipmapLinearFilter;
    cleanTexture.magFilter = THREE.LinearFilter;

    const cleanMat = new THREE.SpriteMaterial({
      map: cleanTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false
    });
    const cleanSprite = new THREE.Sprite(cleanMat);
    cleanSprite.renderOrder = 1000; // ALWAYS above poster text (renderOrder 1) & planet
    cleanSprite.scale.set(badgeBaseScale, badgeBaseScale, 1);
    cleanSprite.userData = { techIndex: i, tech };
    itemGroup.add(cleanSprite);
    raycastSprites.push(cleanSprite);

    // 2. Glowing icon sprite (visible ONLY on hover - vibrant neon glow around icon)
    const glowTexture = textureLoader.load(`/tech-stack/${tech.file}-glow.png`);
    glowTexture.colorSpace = THREE.SRGBColorSpace;
    glowTexture.generateMipmaps = true;
    glowTexture.minFilter = THREE.LinearMipmapLinearFilter;
    glowTexture.magFilter = THREE.LinearFilter;

    const glowMat = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending
    });
    const glowSprite = new THREE.Sprite(glowMat);
    glowSprite.renderOrder = 1001; // ALWAYS above clean sprite on hover
    glowSprite.scale.set(badgeBaseScale, badgeBaseScale, 1);
    glowSprite.visible = false; // Strictly invisible by default: ZERO glow until hovered!
    itemGroup.add(glowSprite);

    // Initial position along the 360 circle (evenly spaced by 36 degrees)
    const baseAngle = (i / TECH_STACK.length) * Math.PI * 2;
    itemGroup.position.x = Math.cos(baseAngle) * baseOrbitRadius;
    itemGroup.position.y = Math.sin(baseAngle) * baseOrbitRadius;
    itemGroup.position.z = Math.sin(baseAngle * 2) * 4;

    const itemData = {
      techIndex: i,
      tech,
      group: itemGroup,
      cleanSprite,
      glowSprite,
      cleanTexture,
      glowTexture,
      baseAngle,
      hoverFactor: 0,
      currentScale: 1.0,
      targetScale: 1.0
    };

    orbitGroup.add(itemGroup);
    techItems.push(itemData);
  });

  // Attach inside parentGroup (smokyGroup) so they expand seamlessly with the planet
  parentGroup.add(orbitGroup);

  let hoveredIndex = -1;

  return {
    group: orbitGroup,
    sprites: raycastSprites,
    getHoveredIndex: () => hoveredIndex,

    // Called every animation frame
    update: (delta, smoothedProgress, currentCamera) => {
      // Visibility threshold: starts materializing at 0.85
      const isVisible = smoothedProgress >= 0.85;
      orbitGroup.visible = isVisible;
      posterMesh.visible = isVisible;

      if (!isVisible) {
        posterMat.opacity = 0;
        techItems.forEach((item) => {
          item.cleanSprite.material.opacity = 0;
          item.glowSprite.material.opacity = 0;
          item.glowSprite.visible = false;
        });
        return;
      }

      // Smooth entrance factor (0.85 -> 0.88 fades in 0 -> 1)
      const entranceFactor = Math.min(1, Math.max(0, (smoothedProgress - 0.85) / 0.03));

      // As camera enters the dense white smoke at smoothedProgress >= 0.91,
      // badges smoothly dissolve into the luminous atmosphere before Contact Realm
      let exitFactor = 1.0;
      if (smoothedProgress >= 0.91) {
        exitFactor = Math.max(0, 1 - (smoothedProgress - 0.91) / 0.03);
      }
      const alpha = entranceFactor * exitFactor;

      // 3D Cinematic Poster Text: Fade opacity
      posterMat.opacity = alpha * 0.95;

      // Screen-lock calculation: Fills display width & maintains stable cinematic framing
      const activeCam = currentCamera || camera;
      if (activeCam) {
        const posterZ = -5250;
        posterMesh.position.z = posterZ;
        posterMesh.position.x = activeCam.position.x;
        posterMesh.quaternion.copy(activeCam.quaternion);

        // Compute perspective frustum dimensions at poster plane depth
        const dist = Math.abs(activeCam.position.z - posterZ);
        const vHeight = 2.0 * Math.tan(THREE.MathUtils.degToRad(activeCam.fov / 2.0)) * dist;
        const vWidth = vHeight * activeCam.aspect;

        // Fills the display horizontally (~94% width)
        const fillFraction = activeCam.aspect < 1.0 ? 0.98 : 0.94;
        const targetW = vWidth * fillFraction;
        const targetH = targetW * (1024 / 2048); // 2:1 canvas aspect ratio

        posterMesh.scale.set(targetW, targetH, 1);
        posterMesh.position.y = activeCam.position.y;
      }

      // Scroll-driven rotation (NO continuous automatic spin):
      // Scroll down (progress increases) -> rotates CLOCKWISE (decreasing angle)
      // Scroll up (progress decreases) -> rotates ANTI-CLOCKWISE (increasing angle)
      const scrollRotationMultiplier = 42;
      const currentOrbitAngle = -(smoothedProgress - 0.85) * scrollRotationMultiplier;

      // Dynamic expansion bonus as camera accelerates into the planet
      let orbitExpansion = 1.0;
      if (smoothedProgress > 0.89) {
        const t = Math.min(1, (smoothedProgress - 0.89) / 0.05);
        orbitExpansion = 1.0 + Math.pow(t, 2.0) * 0.4;
      }
      const currentRadius = baseOrbitRadius * orbitExpansion;

      // Position each badge along the revolving orbit & update hover glow
      techItems.forEach((item, i) => {
        const isHovered = hoveredIndex === i;

        // Smoothly interpolate hoverFactor between 0 (clean, zero glow) and 1 (radiant glow)
        const targetHover = isHovered ? 1 : 0;
        item.hoverFactor += (targetHover - item.hoverFactor) * 0.22;

        if (item.hoverFactor < 0.005) {
          item.hoverFactor = 0;
        }

        // Base clean sprite is always visible when active
        item.cleanSprite.material.opacity = alpha;

        // Glowing icon sprite illuminates ONLY on hover
        if (item.hoverFactor > 0.01 && alpha > 0.01) {
          item.glowSprite.visible = true;
          item.glowSprite.material.opacity = item.hoverFactor * alpha;
        } else {
          item.glowSprite.visible = false;
          item.glowSprite.material.opacity = 0;
        }

        // Position along revolving orbit
        const angle = item.baseAngle + currentOrbitAngle;
        item.group.position.x = Math.cos(angle) * currentRadius;
        item.group.position.y = Math.sin(angle) * currentRadius;
        item.group.position.z = Math.sin(angle * 2) * 5;

        // Smooth scale animation on hover
        item.targetScale = isHovered ? 1.25 : 1.0;
        item.currentScale += (item.targetScale - item.currentScale) * 0.22;

        const s = item.currentScale;
        item.group.scale.set(s, s, 1);
      });
    },

    // Raycast check for hover interaction
    checkHover: (raycaster) => {
      if (!orbitGroup.visible) {
        hoveredIndex = -1;
        return null;
      }

      const intersects = raycaster.intersectObjects(raycastSprites, false);
      if (intersects.length > 0) {
        const hitSprite = intersects[0].object;
        hoveredIndex = hitSprite.userData.techIndex;
        return hitSprite.userData.tech;
      } else {
        hoveredIndex = -1;
        return null;
      }
    },

    dispose: () => {
      if (scene) {
        scene.remove(posterMesh);
      } else {
        parentGroup.remove(posterMesh);
      }
      posterGeo.dispose();
      posterMat.dispose();
      posterTexture.dispose();
      techItems.forEach((item) => {
        item.cleanTexture.dispose();
        item.glowTexture.dispose();
        item.cleanSprite.material.dispose();
        item.glowSprite.material.dispose();
      });
    }
  };
}
