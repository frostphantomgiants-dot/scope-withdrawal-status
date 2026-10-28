export const PAYMENT_METHODS = [
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "mobile-money", label: "Mobile Money" },
  { value: "electronic-wallet", label: "Electronic Wallet" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

export type DemoTransactionStatus = "pending" | "cancelled";

export const STATUS_LABEL: Record<DemoTransactionStatus, string> = {
  pending: "Pending",
  cancelled: "Cancelled",
};
