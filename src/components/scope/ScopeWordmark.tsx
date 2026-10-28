import { cn } from "@/lib/utils";

interface ScopeWordmarkProps {
  className?: string;
}

export function ScopeWordmark({ className }: ScopeWordmarkProps) {
  return (
    <div className={cn("text-center", className)}>
      <span
        className="text-[32px] font-bold italic lowercase leading-none tracking-[-1px] text-scope-red"
        aria-label="Scope"
      >
        scope
      </span>
    </div>
  );
}
