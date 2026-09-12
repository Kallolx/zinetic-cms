import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  wordmarkClassName,
  size = 32,
}: {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/brand/logo.png"
        alt="Zinetic Music"
        width={899}
        height={935}
        style={{ height: size, width: "auto" }}
        className="shrink-0"
        priority
      />
      {showWordmark && (
        <span
          className={cn(
            "font-heading text-lg font-bold tracking-tight whitespace-nowrap",
            wordmarkClassName
          )}
        >
          Zinetic Music
        </span>
      )}
    </div>
  );
}
