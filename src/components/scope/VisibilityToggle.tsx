import { Eye, EyeOff } from "lucide-react";

interface VisibilityToggleProps {
  shown: boolean;
  onToggle: () => void;
  /** What the field holds, e.g. "password" — used for the accessible label. */
  label: string;
}

export function VisibilityToggle({ shown, onToggle, label }: VisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? `Hide ${label}` : `Show ${label}`}
      aria-pressed={shown}
      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-label-muted transition-colors hover:text-value-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-escrow-green/40"
    >
      {shown ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  );
}
