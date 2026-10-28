import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PaymentMethodSelect } from "./PaymentMethodSelect";
import type { PaymentMethodValue } from "./types";

interface DetailsPanelProps {
  paymentMethod: PaymentMethodValue | "";
  onPaymentMethodChange: (value: PaymentMethodValue | "") => void;
  paymentMethodInvalid?: boolean;
}

function DetailRow({
  label,
  children,
  withSeparator,
  className,
}: {
  label: string;
  children: ReactNode;
  withSeparator?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-[10px]",
        withSeparator && "border-t border-card-border",
        className,
      )}
    >
      <span className="w-[82px] shrink-0 text-sm leading-snug text-label-muted">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-right">{children}</div>
    </div>
  );
}

export function DetailsPanel({
  paymentMethod,
  onPaymentMethodChange,
  paymentMethodInvalid,
}: DetailsPanelProps) {
  return (
    <div className="w-full rounded-[13px] border border-card-border bg-panel-bg p-3">
      <div className="flex items-center gap-3 py-[10px]">
        <label
          htmlFor="payment-method"
          className="w-[82px] shrink-0 text-sm leading-snug text-label-muted"
        >
          Payment Method
        </label>
        <PaymentMethodSelect
          value={paymentMethod}
          onChange={onPaymentMethodChange}
          invalid={paymentMethodInvalid}
          describedBy="payment-method-error"
        />
      </div>
      <DetailRow label="Amount" withSeparator>
        <span className="text-sm font-semibold text-value-dark">
          AS PROVIDED IN ESCROW
        </span>
      </DetailRow>
      <DetailRow label="Status" withSeparator>
        <span className="text-sm font-medium text-status-amber">Pending</span>
      </DetailRow>
    </div>
  );
}
