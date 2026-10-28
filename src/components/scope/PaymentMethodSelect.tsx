import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentMethodValue } from "./types";

interface PaymentMethodSelectProps {
  value: PaymentMethodValue | "";
  onChange: (value: PaymentMethodValue | "") => void;
  invalid?: boolean | undefined;
  describedBy?: string | undefined;
}

export function PaymentMethodSelect({
  value,
  onChange,
  invalid,
  describedBy,
}: PaymentMethodSelectProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        id="payment-method"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === "" ? "" : (next as PaymentMethodValue));
        }}
        className={cn(
          "h-[45px] w-full cursor-pointer appearance-none rounded-[11px] border border-select-border bg-white pl-[10px] pr-8 text-sm text-value-dark",
          "focus:border-escrow-green focus:outline-none focus-visible:ring-2 focus-visible:ring-escrow-green/40",
          invalid && "border-cancel-red",
        )}
      >
        <option value="">Select a payment method</option>
        {PAYMENT_METHODS.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-value-dark"
        strokeWidth={2.5}
      />
    </div>
  );
}
