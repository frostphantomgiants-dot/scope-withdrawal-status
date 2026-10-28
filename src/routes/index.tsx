import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScopeWordmark } from "@/components/scope/ScopeWordmark";
import { StatusBanner } from "@/components/scope/StatusBanner";
import { DetailsPanel } from "@/components/scope/DetailsPanel";
import { ActionButton } from "@/components/scope/ActionButton";
import { DemoModal } from "@/components/scope/DemoModal";
import {
  STATUS_LABEL,
  type DemoTransactionStatus,
  type PaymentMethodValue,
} from "@/components/scope/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scope — Withdrawal Status" },
      {
        name: "description",
        content:
          "Scope demo: view an escrowed withdrawal's pending status and try simulated actions.",
      },
      { property: "og:title", content: "Scope — Withdrawal Status" },
      {
        property: "og:description",
        content:
          "Scope demo: view an escrowed withdrawal's pending status and try simulated actions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type ModalState = "closed" | "withdraw" | "cancel" | "withdrawn-demo";

function Index() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | "">(
    "",
  );
  const [status, setStatus] = useState<DemoTransactionStatus>("pending");
  const [showValidationError, setShowValidationError] = useState(false);
  const [modal, setModal] = useState<ModalState>("closed");

  const anyModalOpen = modal !== "closed";

  const handleWithdrawClick = () => {
    if (!paymentMethod) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);
    setModal("withdraw");
  };

  const confirmWithdraw = () => {
    setModal("withdrawn-demo");
  };

  const confirmCancel = () => {
    setStatus("cancelled");
    setModal("closed");
  };

  const closeModal = () => {
    setModal("closed");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-page-bg p-6">
      <div className="w-full max-w-[410px] rounded-[18px] border border-card-border bg-white p-6 shadow-card sm:rounded-[20px] sm:p-8">
        <ScopeWordmark className="mb-[21px]" />

        <StatusBanner status={status} />

        <h1 className="mt-6 text-center text-2xl font-bold uppercase text-escrow-green sm:text-[28px]">
          Escrowed Amount
        </h1>
        <p className="mt-2 text-center text-sm font-normal text-subtitle-gray">
          Pending Amount
        </p>

        <div className="mt-[25px] mb-6">
          <DetailsPanel
            paymentMethod={paymentMethod}
            onPaymentMethodChange={(value) => {
              setPaymentMethod(value);
              if (value) setShowValidationError(false);
            }}
            paymentMethodInvalid={showValidationError && !paymentMethod}
            status={status}
          />
          {showValidationError && !paymentMethod ? (
            <p
              id="payment-method-error"
              className="mt-2 text-xs text-cancel-red"
              role="alert"
            >
              Please select a payment method first.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <ActionButton
            variant="primary"
            onClick={handleWithdrawClick}
            disabled={anyModalOpen || status === "cancelled"}
          >
            Withdraw Payment
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={() => setModal("cancel")}
            disabled={anyModalOpen || status === "cancelled"}
          >
            Cancel Transaction Now
          </ActionButton>
        </div>

        <p className="mt-[17px] text-center text-xs leading-[19px] text-helper-gray">
          Processing may take a few minutes depending on network availability.
        </p>
      </div>

      <DemoModal
        open={modal === "withdraw"}
        title="Withdraw Payment"
        tone="green"
        confirmLabel="Confirm Demo Withdrawal"
        cancelLabel="Go Back"
        onConfirm={confirmWithdraw}
        onCancel={closeModal}
        description="This is a demonstration interface. No real withdrawal will be initiated and no funds or accounts are affected."
      />

      <DemoModal
        open={modal === "cancel"}
        title="Cancel Transaction"
        tone="red"
        confirmLabel="Confirm Demo Cancellation"
        cancelLabel="Keep Pending"
        onConfirm={confirmCancel}
        onCancel={closeModal}
        description="This is a simulated demonstration. Confirming only changes the demo status shown on this page — no real transaction or external account is affected."
      />

      <DemoModal
        open={modal === "withdrawn-demo"}
        title="Demo Notice"
        tone="green"
        confirmLabel="Close"
        onConfirm={closeModal}
        onCancel={closeModal}
        description="This is a demonstration. No real withdrawal has been initiated, no payment has been processed, and no funds or accounts are affected."
      />
    </main>
  );
}
