import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)] ring-1 ring-black/5",
        compact ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" fill="#F3E8DA" />
        <g fill="#0B0A09">
          <circle cx="70" cy="50" r="15" />
          <circle cx="60" cy="32.68" r="15" />
          <circle cx="40" cy="32.68" r="15" />
          <circle cx="30" cy="50" r="15" />
          <circle cx="40" cy="67.32" r="15" />
          <circle cx="60" cy="67.32" r="15" />
          <circle cx="50" cy="50" r="16" />
        </g>
        <circle cx="50" cy="50" r="7" fill="#F3E8DA" />
      </svg>
    </div>
  );
}
