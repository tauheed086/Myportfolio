"use client";

import { useEffect, useRef, useState } from "react";

export default function WaveScene({ paused, burst }: { paused: boolean; burst: number }) {
  const host = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const burstRef = useRef(burst);
  const [ready, setReady] = useState(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { burstRef.current = burst; }, [burst]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => {};
    async function setup() {
      const THREE = await import("three");
      const { RoundedBoxGeometry } = await import("three/addons/geometries/RoundedBoxGeometry.js");
      if (disposed || !container) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.setClearColor(0x080b10, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(12, 13, 17);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight(0xacc9ff, 0x131a2f, 2.5));
      const key = new THREE.DirectionalLight(0xe5efff, 4);
      key.position.set(-3, 12, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x2868ff, 5);
      rim.position.set(6, 4, -7);
      scene.add(rim);
      const count = window.innerWidth < 600 ? 18 : 24;
      const geometry = new RoundedBoxGeometry(0.54, 0.54, 0.54, 2, 0.025);
      const material = new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.5 });
      const mesh = new THREE.InstancedMesh(geometry, material, count * count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      const group = new THREE.Group();
      group.rotation.y = -0.18;
      group.add(mesh);
      scene.add(group);
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();
      for (let i = 0; i < count * count; i++) {
        const x = i % count;
        const z = Math.floor(i / count);
        const band = Math.sin(x * 0.29 + z * 0.24);
        color.set(band > 0.18 ? "#255df2" : band > -0.35 ? "#7893b8" : "#273247");
        mesh.setColorAt(i, color);
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      let visible = true;
      let dirty = true;
      let frame = 0;
      let time = 0;
      let lastTime = performance.now();
      let seenBurst = burstRef.current;
      let ripple = -20;
      const pointer = { x: 0, y: 0 };
      const smoothPointer = { x: 0, y: 0 };
      const onPointer = (event: PointerEvent) => {
        const bounds = container!.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      };
      const resetPointer = () => { pointer.x = 0; pointer.y = 0; };
      container.addEventListener("pointermove", onPointer);
      container.addEventListener("pointerleave", resetPointer);
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      observer.observe(container);
      const resize = () => {
        dirty = true;
        const { width, height } = container.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      };
      const sizeObserver = new ResizeObserver(resize);
      sizeObserver.observe(container);
      resize();
      const render = (now: number) => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        if (!visible || document.hidden) return;
        if (pausedRef.current && !dirty && burstRef.current === seenBurst) return;
        dirty = false;
        if (!pausedRef.current) time += delta;
        if (burstRef.current !== seenBurst) { ripple = time; seenBurst = burstRef.current; }
        if (!pausedRef.current) {
          smoothPointer.x += (pointer.x - smoothPointer.x) * 0.035;
          smoothPointer.y += (pointer.y - smoothPointer.y) * 0.035;
        }
        group.rotation.y = -0.18 + smoothPointer.x * 0.085;
        group.rotation.x = smoothPointer.y * 0.045;
        for (let i = 0; i < count * count; i++) {
          const x = (i % count - (count - 1) / 2) * 0.65;
          const z = (Math.floor(i / count) - (count - 1) / 2) * 0.65;
          const distance = Math.hypot(x, z);
          const wave = Math.sin(x * 0.53 + time * 0.7) * 0.62 + Math.cos(z * 0.59 + time * 0.55) * 0.58;
          const radial = Math.sin(distance * 1.8 - (time - ripple) * 5) * Math.exp(-Math.pow(distance - (time - ripple) * 3.1, 2) / 3) * (time - ripple < 6 ? 0.85 : 0);
          dummy.position.set(x, wave + radial, z);
          dummy.scale.set(1, 1 + (wave + 1.2) * 0.3, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
      };
      render(performance.now());
      setReady(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        sizeObserver.disconnect();
        container.removeEventListener("pointermove", onPointer);
        container.removeEventListener("pointerleave", resetPointer);
        geometry.dispose(); material.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
    }
    setup().catch(() => { /* Keep the decorative CSS fallback available. */ });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div className={`wave-scene ${ready ? "is-ready" : ""}`} ref={host} aria-hidden="true"><div className="scene-fallback">{Array.from({ length: 64 }, (_, i) => <i key={i} style={{ height: `${20 + Math.sin(i * 0.7) * 12}px` }} />)}</div></div>;
}
