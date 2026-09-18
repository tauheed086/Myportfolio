"use client";

import { useEffect, useRef, useState } from "react";

// A near-overhead field of closely spaced columns. Pointer trails generate
// expanding wavefronts; the column bases stay fixed while their tops move.
export default function WaveScene({ paused }: { paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const [ready, setReady] = useState(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => {};

    async function setup() {
      const THREE = await import("three");
      const [{ EffectComposer }, { RenderPass }, { ShaderPass }, { OutputPass }] = await Promise.all([
        import("three/addons/postprocessing/EffectComposer.js"),
        import("three/addons/postprocessing/RenderPass.js"),
        import("three/addons/postprocessing/ShaderPass.js"),
        import("three/addons/postprocessing/OutputPass.js"),
      ]);
      if (disposed || !container) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.95;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#b8b8bd");
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 12, 0);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const key = new THREE.DirectionalLight(0xffffff, 4);
      key.position.set(-20, 10, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 0.1, far: 65 });
      key.shadow.bias = 0.0001;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 1);
      fill.position.set(10, 5, -3);
      scene.add(fill);

      const side = 40;
      const spacing = 0.81;
      const geometry = new THREE.BoxGeometry(0.8, 3, 0.8);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
      const cubes = new THREE.InstancedMesh(geometry, material, side * side);
      cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      cubes.castShadow = cubes.receiveShadow = true;
      cubes.frustumCulled = false;
      scene.add(cubes);

      const composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      // Slight RGB separation on the outer part of the image gives fine cube
      // edges the restrained iridescent quality visible in the reference.
      const fringePass = new ShaderPass({
        uniforms: { tDiffuse: { value: null } },
        vertexShader: `varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
          void main() {
            vec2 radial = vUv - 0.5;
            float edge = smoothstep(0.12, 0.64, length(radial));
            vec2 shift = radial * edge * 0.003;
            vec3 c = vec3(texture2D(tDiffuse, vUv + shift).r,
                          texture2D(tDiffuse, vUv).g,
                          texture2D(tDiffuse, vUv - shift).b);
            gl_FragColor = vec4(c * (1.0 - edge * 0.035), 1.0);
          }`,
      });
      const outputPass = new OutputPass();
      composer.addPass(fringePass);
      composer.addPass(outputPass);

      const transform = new THREE.Object3D();
      const white = new THREE.Color("#ffffff");
      const blue = new THREE.Color("#0055ff");
      const color = new THREE.Color();
      const positions = Array.from({ length: side * side }, (_, i) => ({
        x: (i % side - (side - 1) / 2) * spacing,
        z: (Math.floor(i / side) - (side - 1) / 2) * spacing,
      }));
      type Ripple = { x: number; z: number; age: number; strength: number };
      const ripples: Ripple[] = [{ x: 4, z: 2, age: 0.7, strength: 0.65 }];
      const pointer = new THREE.Vector2();
      const smoothed = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
      const surface = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.5);
      const hit = new THREE.Vector3();
      let lastPoint: { x: number; z: number } | null = null;
      let idle = 4;
      let autoTimer = 0;
      let lastPointerTime = 0;
      let dirty = true;
      let frame = 0;
      let lastTime = performance.now();

      const addRipple = (x: number, z: number, strength: number) => {
        if (ripples.length >= 32) ripples.shift();
        ripples.push({ x, z, age: 0, strength });
      };
      const onPointer = (event: PointerEvent) => {
        pointer.set(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2);
        if (pausedRef.current) return;
        raycaster.setFromCamera(pointer, camera);
        if (!raycaster.ray.intersectPlane(surface, hit)) return;
        const distance = lastPoint ? Math.hypot(hit.x - lastPoint.x, hit.z - lastPoint.z) : 0.6;
        if (distance < 0.13 || performance.now() - lastPointerTime < 35) return;
        addRipple(hit.x, hit.z, Math.min(distance, 1));
        lastPoint = { x: hit.x, z: hit.z };
        lastPointerTime = performance.now();
        idle = autoTimer = 0;
      };
      const onPress = (event: PointerEvent) => {
        onPointer(event);
        if (pausedRef.current) return;
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.ray.intersectPlane(surface, hit)) addRipple(hit.x, hit.z, 1);
      };
      const onLeave = () => { pointer.set(0, 0); lastPoint = null; };
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPress, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      const resize = () => {
        const width = container.clientWidth, height = container.clientHeight;
        renderer.setSize(width, height);
        composer.setSize(width, height);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
        dirty = true;
      };
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();

      const render = (now: number) => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        if (document.hidden || (pausedRef.current && !dirty)) return;
        dirty = false;
        if (!pausedRef.current) {
          idle += delta;
          autoTimer += delta;
          if (idle > 3 && autoTimer > 1.7) {
            addRipple((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 9, 0.7);
            autoTimer = 0;
          }
          ripples.forEach(ripple => { ripple.age += delta; });
          while (ripples.length && ripples[0].age > 7) ripples.shift();
          smoothed.lerp(pointer, 0.04);
        }
        const yaw = smoothed.x * Math.PI * 0.05;
        const pitch = smoothed.y * Math.PI * 0.03;
        camera.position.set(-12 * Math.cos(pitch) * Math.sin(yaw), 12 * Math.cos(pitch) * Math.cos(yaw), 12 * Math.sin(pitch));
        camera.lookAt(0, 0, 0);
        positions.forEach(({ x, z }, i) => {
          let displacement = 0, weightSum = 0;
          for (const ripple of ripples) {
            const distance = Math.hypot(x - ripple.x, z - ripple.z);
            const front = distance - ripple.age * 6;
            const weight = Math.exp(-front * front / 9 - ripple.age / 2) * ripple.strength / (1 + distance * 0.1);
            displacement += Math.cos(front * 1.2) * weight;
            weightSum += weight;
          }
          displacement = THREE.MathUtils.clamp(displacement / Math.max(1, weightSum) * 0.4, -0.4, 0.4);
          transform.position.set(x, displacement / 2, z);
          transform.scale.set(1, 1 + displacement / 3, 1);
          transform.updateMatrix();
          cubes.setMatrixAt(i, transform.matrix);
          color.copy(white).lerp(blue, Math.max(0, displacement / 0.4));
          cubes.setColorAt(i, color);
        });
        cubes.instanceMatrix.needsUpdate = true;
        if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;
        composer.render();
      };
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerdown", onPress);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        geometry.dispose(); material.dispose(); key.shadow.map?.dispose();
        fringePass.dispose(); outputPass.dispose(); composer.dispose(); renderer.dispose();
        renderer.domElement.remove();
      };
      render(performance.now());
      setReady(true);
    }
    setup().catch(() => { cleanup(); });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={host} className={`wave-scene ${ready ? "is-ready" : ""}`} aria-hidden="true"><div className="scene-fallback" /></div>;
}
