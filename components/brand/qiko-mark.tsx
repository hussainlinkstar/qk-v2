import Image from "next/image";
import { cn } from "@/lib/utils";

export function QikoMark({
  className,
  size = 28,
  withWordmark = false,
  wordmark = "Qiko",
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  wordmark?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/qiko-logo.png"
        alt="Qiko"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        priority
      />
      {withWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          {wordmark}
        </span>
      )}
    </span>
  );
}
