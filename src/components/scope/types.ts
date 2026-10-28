export const PAYMENT_METHODS = [
  { value: "access-money-wallet", label: "Access Money Wallet" },
  { value: "airtel", label: "Airtel" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "binance-pay", label: "Binance Pay" },
  { value: "ecobank-mobilemoney", label: "Ecobank MobileMoney" },
  { value: "ecocash", label: "Ecocash" },
  { value: "ethiotelecom-telebirr", label: "Ethiotelecom Telebirr" },
  { value: "ewallet-services-tanzania", label: "eWallet Services Tanzania" },
  { value: "flutterwave", label: "Flutterwave" },
  { value: "fnb-ewallet", label: "FNB eWallet" },
  { value: "innbucks", label: "Innbucks" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "m-birr", label: "M-Birr" },
  { value: "mascom-myzaka", label: "Mascom MyZaka" },
  { value: "moov-money", label: "Moov Money" },
  { value: "m-pesa-tanzania", label: "M-Pesa Tanzania" },
  { value: "mtn-momo", label: "MTN Mobile Money (Momo)" },
  { value: "mukuru", label: "Mukuru" },
  { value: "nequi", label: "Nequi" },
  { value: "orange-money", label: "Orange Money" },
  { value: "paypal", label: "PayPal" },
  { value: "payoneer", label: "Payoneer" },
  { value: "safaricom-m-pesa", label: "Safaricom M-Pesa" },
  { value: "skrill", label: "Skrill" },
  { value: "wise", label: "Wise" },
  { value: "neteller", label: "Neteller" },
  { value: "perfect-money", label: "Perfect Money" },
  { value: "crypto-usdt", label: "Crypto (USDT)" },
  { value: "upi", label: "Unified Payments interface (UPI)" },
  { value: "vodacom-m-pesa", label: "Vodacom M-Pesa" },
  { value: "wave", label: "Wave" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

export type DemoTransactionStatus = "pending" | "cancelled";

export const STATUS_LABEL: Record<DemoTransactionStatus, string> = {
  pending: "Pending",
  cancelled: "Cancelled",
};
