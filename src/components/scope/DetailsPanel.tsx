import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PaymentMethodSelect } from "./PaymentMethodSelect";
import {
  STATUS_LABEL,
  type DemoTransactionStatus,
  type PaymentMethodValue,
} from "./types";

interface DetailsPanelProps {
  paymentMethod: PaymentMethodValue | "";
  onPaymentMethodChange: (value: PaymentMethodValue | "") => void;
  paymentMethodInvalid?: boolean;
  status: DemoTransactionStatus;
}

function DetailRow({
  label,
  children,
  withSeparator,
}: {
  label: string;
  children: ReactNode;
  withSeparator?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-[10px]",
        withSeparator && "border-t border-card-border",
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
  status,
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
        <span
          className={cn(
            "text-sm font-medium",
            status === "pending"
              ? "text-status-amber"
              : status === "withdrawn"
                ? "text-escrow-green"
                : "text-status-grey",
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </DetailRow>
    </div>
  );
}
