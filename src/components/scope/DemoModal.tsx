import { useEffect, useRef, type ReactNode } from "react";
import { ActionButton } from "./ActionButton";

interface DemoModalProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone: "green" | "red";
  onConfirm: () => void;
  onCancel: () => void;
}

export function DemoModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone,
  onConfirm,
  onCancel,
}: DemoModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2D3C]/40 p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        aria-describedby="demo-modal-description"
        className="w-full max-w-[360px] rounded-[18px] border border-card-border bg-white p-6 shadow-card"
      >
        <h2
          id="demo-modal-title"
          className="text-center text-lg font-bold text-value-dark"
        >
          {title}
        </h2>
        <p
          id="demo-modal-description"
          className="mt-2.5 text-center text-sm leading-[19px] text-helper-gray"
        >
          {description}
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <ActionButton
            ref={confirmRef}
            variant={tone === "green" ? "primary" : "secondary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </ActionButton>
          {cancelLabel ? (
            <ActionButton variant="secondary" onClick={onCancel}>
              {cancelLabel}
            </ActionButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
