import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ActionButtonVariant = "primary" | "secondary";

interface ActionButtonProps extends ComponentProps<"button"> {
  variant: ActionButtonVariant;
  children: ReactNode;
}

const VARIANTS: Record<ActionButtonVariant, string> = {
  primary:
    "h-[49px] border border-transparent bg-action-green text-white hover:bg-action-green-hover active:bg-action-green-active",
  secondary:
    "h-[51px] border border-cancel-red bg-white text-cancel-red hover:bg-cancel-red-hover-bg active:bg-cancel-red-hover-bg/80",
};

export function ActionButton({
  variant,
  children,
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "w-full rounded-[11px] text-[15px] font-bold transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "primary"
          ? "focus-visible:ring-action-green"
          : "focus-visible:ring-cancel-red",
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
