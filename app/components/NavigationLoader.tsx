"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPath = useRef<string>(`${pathname}${searchParams}`);

  const startProgress = () => {
    setProgress(0);
    setVisible(true);
    let current = 0;
    timerRef.current = setInterval(() => {
      const increment =
        current < 30 ? 6 : current < 60 ? 3 : current < 80 ? 1 : 0.3;
      current = Math.min(current + increment, 85);
      setProgress(current);
    }, 120);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => setVisible(false), 400);
  };

  useEffect(() => {
    const currentPath = `${pathname}${searchParams}`;
    if (currentPath !== prevPath.current) {
      prevPath.current = currentPath;
      completeProgress();
    }
  }, [pathname, searchParams]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    (window as any).__startNavLoader = startProgress;
    return () => {
      delete (window as any).__startNavLoader;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #ff42b3, #ff7b4f)",
          boxShadow: "0 0 8px #ff42b3aa",
          transition:
            progress === 100 ? "width 0.25s ease-out" : "width 0.12s linear",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  );
}
