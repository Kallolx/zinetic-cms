import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/brand/logo.png"
        alt="Zinetic Music"
        width={899}
        height={1140}
        style={{ height: size, width: "auto" }}
        className="hidden shrink-0 dark:block"
        priority
      />
      <Image
        src="/brand/logo-black.png"
        alt="Zinetic Music"
        width={899}
        height={1140}
        style={{ height: size, width: "auto" }}
        className="block shrink-0 dark:hidden"
        priority
      />
    </div>
  );
}
