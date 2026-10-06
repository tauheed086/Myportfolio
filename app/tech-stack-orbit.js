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
// Main Tech Stack Orbit System Factory
// Uses the authentic 3D icons from /public/tech-stack/
// Clean unhovered state (zero glow) + radiant neon icon bloom on hover
// =========================================================================

export function createTechStackOrbit({ parentGroup }) {
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(0, 0, 0);

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
      depthWrite: false
    });
    const cleanSprite = new THREE.Sprite(cleanMat);
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
      blending: THREE.NormalBlending
    });
    const glowSprite = new THREE.Sprite(glowMat);
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
    update: (delta, smoothedProgress) => {
      // Visibility threshold: starts materializing at 0.85
      const isVisible = smoothedProgress >= 0.85;
      orbitGroup.visible = isVisible;

      if (!isVisible) {
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
      techItems.forEach((item) => {
        item.cleanTexture.dispose();
        item.glowTexture.dispose();
        item.cleanSprite.material.dispose();
        item.glowSprite.material.dispose();
      });
    }
  };
}
