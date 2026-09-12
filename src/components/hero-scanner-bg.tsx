"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Scanner from "@/components/scanner";

export function HeroScannerBg() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-75 transition-opacity duration-500">
      <Scanner
        color1={isDark ? "#b71c1c" : "#e91e63"}
        color2={isDark ? "#ff4081" : "#ab47bc"}
        color3={isDark ? "#ffffff" : "#c2185b"}
        speed={0.4}
        sweepSpeed={0.2}
        sweepWidth={1.8}
        sweepFalloff={5}
        scale={1.4}
        frequency={1.8}
        ripple={0.2}
        bandDensity={10}
        lineSharpness={5.0}
        glow={0.3}
        scanDirection="diagonal"
        colorSpread={0.6}
        brightness={isDark ? 0.9 : 0.75}
        contrast={1.1}
        softness={1.5}
        vignette={0.5}
        scanline={true}
        grain={true}
        grainIntensity={0.03}
        opacity={isDark ? 0.85 : 0.55}
        mouseInteraction={true}
        mouseRadius={0.6}
        mouseStrength={0.4}
      />
    </div>
  );
}

