"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Portrait3DCanvas
 * Interactive WebGL Depth-Map Parallax Hologram (2.5D)
 * Built with Three.js & custom GLSL fragment shader inspired by Axel Vanhessche
 */
export default function Portrait3DCanvas({
  originalSrc = "/myportrait.png",
  depthSrc = "/myportrait-depth.jpg",
  className = "",
  alt = "Tauheed Mulla",
  isEntered = false,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const resizeHandlerRef = useRef(null);

  // Trigger resize recalculation when isEntered changes
  useEffect(() => {
    if (isEntered && resizeHandlerRef.current) {
      setTimeout(() => {
        resizeHandlerRef.current?.();
      }, 50);
    }
  }, [isEntered]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId = null;
    let isDisposed = false;

    // Initial safe dimensions fallback
    let width = container.clientWidth || 360;
    let height = container.clientHeight || 640;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 2.0;

    // 2. Renderer Setup
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (e) {
      console.warn("WebGL not supported for 3D portrait, fallback active", e);
      return;
    }

    // 3. Texture Loading & Mesh
    const textureLoader = new THREE.TextureLoader();
    let originalTexture = null;
    let depthTexture = null;
    let material = null;
    let mesh = null;
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Parallax sensitivity thresholds (tuned to prevent occlusion/tearing artifacts)
    const thresholdX = 32.0;
    const thresholdY = 28.0;

    const cursor = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    const updateSize = () => {
      if (!container || isDisposed || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Fit plane geometry (aspect 941/1672) into camera view
      if (mesh) {
        const vFov = (camera.fov * Math.PI) / 180;
        const visibleHeight = 2.0 * Math.tan(vFov / 2.0) * camera.position.z;
        const visibleWidth = visibleHeight * (w / h);
        const imgAspect = 941 / 1672;

        const isMobile = w < 640 || (typeof window !== "undefined" && window.innerWidth <= 940);

        if (isMobile) {
          // On mobile, prominently size the portrait so face and shoulders fill the viewport
          const planeW = Math.max(visibleWidth * 1.15, visibleHeight * 0.70);
          const planeH = planeW / imgAspect;
          mesh.scale.set(planeW, planeH, 1);

          // Position: place top of head gracefully below the top nav
          const topTarget = (visibleHeight / 2) - 0.08 * visibleHeight;
          mesh.position.set(0, topTarget - planeH / 2, 0);
        } else {
          // Heroic sizing: scale so portrait covers the right side and full viewport height
          const baseH = Math.max(visibleHeight, visibleWidth * 0.75);
          const planeH = baseH * 1.08;
          const planeW = planeH * imgAspect;
          mesh.scale.set(planeW, planeH, 1);

          // Position: anchor bottom so chest touches the bottom edge, shift rightwards to fill right viewport
          mesh.position.y = -(planeH - visibleHeight) * 0.46;
          if (visibleWidth > planeW) {
            mesh.position.x = (visibleWidth - planeW) * 0.32;
          } else {
            mesh.position.x = 0;
          }
        }
      }
    };
    resizeHandlerRef.current = updateSize;

    textureLoader.load(originalSrc, (origTex) => {
      if (isDisposed) return;
      origTex.generateMipmaps = true;
      origTex.minFilter = THREE.LinearMipmapLinearFilter;
      origTex.magFilter = THREE.LinearFilter;
      origTex.colorSpace = THREE.SRGBColorSpace;
      originalTexture = origTex;

      textureLoader.load(depthSrc, (dTex) => {
        if (isDisposed) return;
        dTex.generateMipmaps = true;
        dTex.minFilter = THREE.LinearMipmapLinearFilter;
        dTex.magFilter = THREE.LinearFilter;
        depthTexture = dTex;

        material = new THREE.ShaderMaterial({
          uniforms: {
            uOriginalTexture: { value: originalTexture },
            uDepthTexture: { value: depthTexture },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uThreshold: { value: new THREE.Vector2(thresholdX, thresholdY) },
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            precision mediump float;
            uniform sampler2D uOriginalTexture;
            uniform sampler2D uDepthTexture;
            uniform vec2 uMouse;
            uniform vec2 uThreshold;
            varying vec2 vUv;

            void main() {
              vec4 depthVal = texture2D(uDepthTexture, vUv);
              // depthVal.r: 1.0 is foreground (chin/nose/collar), 0.0 is background
              float depth = depthVal.r - 0.48;
              vec2 displacement = depth * (uMouse / uThreshold);
              // Safety clamp: limits maximum displacement to prevent silhouette separation tearing
              displacement = clamp(displacement, vec2(-0.016), vec2(0.016));
              vec2 fake3d = clamp(vUv + displacement, 0.001, 0.999);

              gl_FragColor = texture2D(uOriginalTexture, fake3d);
            }
          `,
          transparent: true,
        });

        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        updateSize();
        setIsLoaded(true);
      });
    });

    // 4. Mouse / Touch & Idle Tracking
    let hasUserMoved = false;
    let clock = new THREE.Clock();

    const handleMouseMove = (e) => {
      hasUserMoved = true;
      const rawX = (e.clientX / window.innerWidth) * 2 - 1;
      const rawY = -(e.clientY / window.innerHeight) * 2 + 1;
      // Soft saturation via Math.tanh: linear in center, gracefully capped at extremes
      cursor.targetX = Math.tanh(rawX * 1.1) * 0.6;
      cursor.targetY = Math.tanh(rawY * 1.1) * 0.55;
    };

    const handleTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      hasUserMoved = true;
      const touch = e.touches[0];
      const rawX = (touch.clientX / window.innerWidth) * 2 - 1;
      const rawY = -(touch.clientY / window.innerHeight) * 2 + 1;
      cursor.targetX = Math.tanh(rawX * 1.1) * 0.6;
      cursor.targetY = Math.tanh(rawY * 1.1) * 0.55;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", updateSize);

    // ResizeObserver watches container to handle entrance animation & visibility changes
    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);
    }

    // 5. Render Loop with Smooth Inertia + Subtle Life-like Idle Breathing
    const animate = () => {
      if (isDisposed) return;
      const elapsedTime = clock.getElapsedTime();

      // Check if container just acquired width/height from visibility change
      if (container.clientWidth > 0 && renderer.domElement.width === 0) {
        updateSize();
      }

      let targetX = cursor.targetX;
      let targetY = cursor.targetY;
      if (!hasUserMoved) {
        targetX = Math.sin(elapsedTime * 0.8) * 0.22;
        targetY = Math.cos(elapsedTime * 0.6) * 0.18;
      }

      // Smooth exponential damping / lerp
      cursor.currentX += (targetX - cursor.currentX) * 0.055;
      cursor.currentY += (targetY - cursor.currentY) * 0.055;

      if (material && material.uniforms) {
        material.uniforms.uMouse.value.set(cursor.currentX, cursor.currentY);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 6. Cleanup
    return () => {
      isDisposed = true;
      resizeHandlerRef.current = null;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", updateSize);
      if (resizeObserver) resizeObserver.disconnect();

      geometry.dispose();
      if (material) material.dispose();
      if (originalTexture) originalTexture.dispose();
      if (depthTexture) depthTexture.dispose();
      if (renderer) renderer.dispose();
    };
  }, [originalSrc, depthSrc]);

  return (
    <div
      ref={containerRef}
      className={`portrait-3d-canvas-wrap ${className}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      {/* Fallback image: ALWAYS visible until WebGL texture is ready */}
      <img
        src={originalSrc}
        alt={alt}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          opacity: isLoaded ? 0 : 1,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        }}
      />

      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
