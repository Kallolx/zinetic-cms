"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Scanner from "@/components/scanner";

export function HeroScannerBg({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <div
      className={
        className ??
        "pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30 dark:opacity-75 transition-opacity duration-500"
      }
    >
      <Scanner
        color1={isDark ? "#b71c1c" : "#fee2e2"}
        color2={isDark ? "#ff4081" : "#fca5a5"}
        color3={isDark ? "#ffffff" : "#ef4444"}
        speed={0.4}
        sweepSpeed={0.2}
        sweepWidth={1.8}
        sweepFalloff={5}
        scale={1.4}
        frequency={1.8}
        ripple={0.2}
        bandDensity={10}
        lineSharpness={5.0}
        glow={isDark ? 0.3 : 0.15}
        scanDirection="diagonal"
        colorSpread={0.6}
        brightness={isDark ? 0.9 : 0.6}
        contrast={1.1}
        softness={1.5}
        vignette={0.5}
        scanline={true}
        grain={true}
        grainIntensity={0.03}
        opacity={isDark ? 0.85 : 0.35}
        mouseInteraction={true}
        mouseRadius={0.6}
        mouseStrength={0.4}
      />
    </div>
  );
}

