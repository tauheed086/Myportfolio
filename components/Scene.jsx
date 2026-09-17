"use client";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
const WaveScene = lazy(() => import("../app/wave-scene"));
export default function Scene({ paused, settings, label = "Interactive wave field" }) {
  const host = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    }, { rootMargin: "100px" });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return <div className="scene-host" ref={host} role="img" aria-label={label}>
    <div className="scene-fallback" aria-hidden="true" />
    {loaded && <Suspense fallback={<span className="scene-loading">Preparing the playground…</span>}><WaveScene paused={paused || !visible} settings={settings} /></Suspense>}
  </div>;
}
