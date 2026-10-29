import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { ScopeWordmark } from "@/components/scope/ScopeWordmark";
import { StatusBanner } from "@/components/scope/StatusBanner";
import { DetailsPanel } from "@/components/scope/DetailsPanel";
import { ActionButton } from "@/components/scope/ActionButton";
import { DemoModal } from "@/components/scope/DemoModal";
import { AuthModal } from "@/components/scope/AuthModal";
import { AccountModal } from "@/components/scope/AccountModal";
import { SessionBar } from "@/components/scope/SessionBar";
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
  validateSearch: (search: Record<string, unknown>) => ({
    signin: typeof search["signin"] === "string" ? search["signin"] : undefined,
  }),
  component: Index,
});

type ModalState =
  | "closed"
  | "withdraw"
  | "cancel"
  | "auth"
  | "withdrawn-demo"
  | "account";
type PendingAction = "withdraw" | "cancel";

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | "">(
    "",
  );
  const [status, setStatus] = useState<DemoTransactionStatus>("pending");
  const [showValidationError, setShowValidationError] = useState(false);
  const [modal, setModal] = useState<ModalState>("closed");
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();
  const pendingActionRef = useRef<PendingAction | null>(null);
  const adminIntentRef = useRef(false);
  const paymentMethodRef = useRef(paymentMethod);
  paymentMethodRef.current = paymentMethod;

  const anyModalOpen = modal !== "closed";

  // Track the Supabase session (identity changes only).
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") {
        return;
      }
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Load the signed-in account's saved transaction, or create one on first
  // sign-in, so the status survives refreshes and devices.
  useEffect(() => {
    if (!user) {
      setStatus("pending");
      return;
    }
    let active = true;
    const loadTransaction = async () => {
      const { data, error } = await supabase
        .from("escrow_transactions")
        .select("status, payment_method")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active || error) {
        if (error) {
          toast.error("We couldn't load your saved transaction status.");
        }
        return;
      }
      if (data) {
        setStatus(data.status as DemoTransactionStatus);
        if (data.payment_method) {
          setPaymentMethod(data.payment_method as PaymentMethodValue);
        }
        return;
      }
      await supabase.from("escrow_transactions").insert({
        user_id: user.id,
        status: "pending",
        payment_method: paymentMethodRef.current || null,
      });
    };
    void loadTransaction();
    return () => {
      active = false;
    };
  }, [user]);

  // Load the signed-in account's role so the admin dashboard link reflects it.
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let active = true;
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (active) {
          setIsAdmin(Boolean(data?.some((row) => row.role === "admin")));
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  // The /admin route bounces unauthenticated visitors here with ?signin=admin:
  // open the sign-in modal and remember that finishing sign-in means /admin.
  const signinParam = Route.useSearch().signin;
  useEffect(() => {
    if (signinParam !== "admin") return;
    adminIntentRef.current = true;
    setModal("auth");
    void navigate({ to: "/", search: { signin: undefined }, replace: true });
  }, [signinParam, navigate]);

  const handleWithdrawClick = () => {
    if (!user) {
      pendingActionRef.current = "withdraw";
      setModal("auth");
      return;
    }
    if (!paymentMethod) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);
    setModal("withdraw");
  };

  const handleCancelClick = () => {
    if (!user) {
      pendingActionRef.current = "cancel";
      setModal("auth");
      return;
    }
    setModal("cancel");
  };

  const handleAuthenticated = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (adminIntentRef.current) {
      adminIntentRef.current = false;
      void (async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);
        setModal("closed");
        if (roles?.some((row) => row.role === "admin")) {
          await navigate({ to: "/admin" });
          return;
        }
        toast.error("This account doesn't have admin access.");
      })();
      return;
    }
    if (action === "withdraw") {
      if (!paymentMethod) {
        setShowValidationError(true);
        setModal("closed");
        return;
      }
      setShowValidationError(false);
      setModal("withdraw");
      return;
    }
    if (action === "cancel") {
      setModal("cancel");
      return;
    }
    setModal("closed");
  };

  const confirmWithdraw = async () => {
    setStatus("withdrawn");
    setModal("withdrawn-demo");
    if (user) {
      const { error } = await supabase
        .from("escrow_transactions")
        .update({
          status: "withdrawn",
          payment_method: paymentMethod || null,
        })
        .eq("user_id", user.id);
      if (error) {
        toast.error(
          "We couldn't save the withdrawal status. Please check your connection and try again.",
        );
      }
    }
  };

  const confirmCancel = async () => {
    setStatus("cancelled");
    setModal("closed");
    if (user) {
      const { error } = await supabase
        .from("escrow_transactions")
        .update({ status: "cancelled" })
        .eq("user_id", user.id);
      if (error) {
        toast.error(
          "We couldn't save the cancellation. Please check your connection and try again.",
        );
      }
    }
  };

  const handleSignOut = async () => {
    pendingActionRef.current = null;
    await supabase.auth.signOut();
    setStatus("pending");
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
            onClick={handleCancelClick}
            disabled={anyModalOpen || status === "cancelled"}
          >
            Cancel Transaction Now
          </ActionButton>
        </div>

        <p className="mt-[17px] text-center text-xs leading-[19px] text-helper-gray">
          Processing may take a few minutes depending on network availability.
        </p>

        <SessionBar
          email={user?.email ?? undefined}
          isAdmin={isAdmin}
          onOpenAccount={() => setModal("account")}
          onSignOut={handleSignOut}
        />
      </div>

      <AuthModal
        open={modal === "auth"}
        reason={modal === "auth" ? pendingActionRef.current : null}
        onClose={closeModal}
        onAuthenticated={handleAuthenticated}
      />

      <AccountModal
        open={modal === "account"}
        email={user?.email ?? undefined}
        onClose={closeModal}
      />

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
        description={
          user
            ? "This is a demonstration. The status has been saved to your Scope account — no real withdrawal has been initiated and no funds or accounts are affected."
            : "This is a demonstration. No real withdrawal has been initiated, no payment has been processed, and no funds or accounts are affected."
        }
      />
    </main>
  );
}
