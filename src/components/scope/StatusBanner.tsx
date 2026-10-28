import { cn } from "@/lib/utils";
import type { DemoTransactionStatus } from "./types";

const BANNER_TEXT: Record<DemoTransactionStatus, string> = {
  pending: "Withdrawal Pending",
  withdrawn: "Withdrawal Completed",
  cancelled: "Withdrawal Cancelled",
};

interface StatusBannerProps {
  status: DemoTransactionStatus;
}

export function StatusBanner({ status }: StatusBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex h-[50px] w-full items-center justify-center rounded-[11px] border px-4",
        "border-banner-border bg-banner-bg",
      )}
    >
      <span className="text-base font-bold text-banner-text">
        {BANNER_TEXT[status]}
      </span>
    </div>
  );
}
