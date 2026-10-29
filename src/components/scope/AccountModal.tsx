import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { ActionButton } from "./ActionButton";
import { cn } from "@/lib/utils";

interface AccountModalProps {
  open: boolean;
  email?: string | undefined;
  onClose: () => void;
}

interface TotpFactorView {
  id: string;
  friendlyName: string | null;
}

interface PendingEnrollment {
  factorId: string;
  challengeId: string;
  qrCode: string;
  secret: string;
}

export function AccountModal({ open, email, onClose }: AccountModalProps) {
  const [factors, setFactors] = useState<TotpFactorView[]>([]);
  const [loadingFactors, setLoadingFactors] = useState(false);
  const [enrollment, setEnrollment] = useState<PendingEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadFactors = async () => {
    setLoadingFactors(true);
    try {
      const { data, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        setError("We couldn't load your security settings. Please try again.");
        return;
      }
      setFactors(
        (data?.totp ?? [])
          .filter((factor) => factor.status === "verified")
          .map((factor) => ({
            id: factor.id,
            friendlyName: factor.friendly_name ?? null,
          })),
      );
    } finally {
      setLoadingFactors(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCode("");
    setEnrollment(null);
    void loadFactors();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  const startEnrollment = async () => {
    setError(null);
    setBusy(true);
    try {
      // Remove any abandoned unverified factor so a fresh one can enroll.
      const { data: existing } = await supabase.auth.mfa.listFactors();
      for (const factor of existing?.totp ?? []) {
        if (factor.status !== "verified") {
          try {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          } catch {
            // Best effort cleanup only.
          }
        }
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Scope",
      });
      if (enrollError || !data?.totp) {
        setError(
          enrollError
            ? `Could not start enrollment: ${enrollError.message}`
            : "Could not start enrollment. Please try again.",
        );
        return;
      }
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: data.id });
      if (challengeError || !challenge) {
        setError("Could not start the verification. Please try again.");
        return;
      }
      setEnrollment({
        factorId: data.id,
        challengeId: challenge.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const verifyEnrollment = async (event: FormEvent) => {
    event.preventDefault();
    if (!enrollment) return;
    const cleaned = code.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleaned)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollment.factorId,
        challengeId: enrollment.challengeId,
        code: cleaned,
      });
      if (verifyError) {
        setError(
          /expired/i.test(verifyError.message)
            ? "That code has expired. Cancel and start enrollment again."
            : "That code didn't match. Check your authenticator app and try again.",
        );
        return;
      }
      setEnrollment(null);
      setCode("");
      await loadFactors();
      toast.success("Two-factor authentication is now on for your account.");
    } finally {
      setBusy(false);
    }
  };

  const cancelEnrollment = () => {
    setEnrollment(null);
    setCode("");
    setError(null);
  };

  const disableFactor = async (factorId: string) => {
    setError(null);
    setBusy(true);
    try {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId,
      });
      if (unenrollError) {
        setError(
          "Could not turn off two-factor authentication. Please try again.",
        );
        return;
      }
      await loadFactors();
      toast.success("Two-factor authentication is now off.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2D3C]/40 p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="w-full max-w-[360px] rounded-[18px] border border-card-border bg-white p-6 shadow-card"
      >
        <span
          className="block text-center text-2xl font-bold italic lowercase leading-none tracking-[-1px] text-scope-red"
          aria-hidden="true"
        >
          scope
        </span>

        <h2
          id="account-modal-title"
          className="mt-3 text-center text-lg font-bold text-value-dark"
        >
          Account &amp; Security
        </h2>

        {email ? (
          <p className="mt-1 text-center text-sm text-helper-gray">{email}</p>
        ) : null}

        {enrollment ? (
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={verifyEnrollment}
            noValidate
          >
            <p className="text-center text-sm leading-[19px] text-helper-gray">
              Scan this QR code with Google Authenticator, Authy, or Microsoft
              Authenticator, then enter the 6-digit code it shows.
            </p>
            <img
              src={enrollment.qrCode}
              alt="Two-factor authentication QR code"
              className="mx-auto h-[180px] w-[180px] rounded-[11px] border border-card-border bg-white p-2"
            />
            <div>
              <p className="mb-1 text-xs text-label-muted">
                Can't scan? Enter this key manually:
              </p>
              <code className="block break-all rounded-[11px] border border-select-border bg-panel-bg px-[10px] py-2 font-mono text-xs text-value-dark">
                {enrollment.secret}
              </code>
            </div>
            <div>
              <label htmlFor="account-2fa-code" className="mb-1 block text-sm text-label-muted">
                Verification Code
              </label>
              <input
                id="account-2fa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/[^\d\s]/g, ""))
                }
                aria-invalid={Boolean(error) || undefined}
                className={cn(
                  "h-[45px] w-full rounded-[11px] border border-select-border bg-white px-[10px] text-center text-lg tracking-[6px] text-value-dark placeholder:text-subtitle-gray",
                  "focus:border-escrow-green focus:outline-none focus-visible:ring-2 focus-visible:ring-escrow-green/40",
                  error && "border-cancel-red",
                )}
              />
            </div>

            {error ? (
              <p className="text-xs leading-[17px] text-cancel-red" role="alert">
                {error}
              </p>
            ) : null}

            <ActionButton type="submit" variant="primary" disabled={busy}>
              {busy ? "Verifying…" : "Verify & Turn On"}
            </ActionButton>
            <ActionButton variant="secondary" onClick={cancelEnrollment} disabled={busy}>
              Cancel
            </ActionButton>
          </form>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-[13px] border border-card-border bg-panel-bg p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-value-dark">
                  Two-Factor Authentication
                </span>
                {!loadingFactors ? (
                  factors.length > 0 ? (
                    <span className="text-xs font-bold text-escrow-green">On</span>
                  ) : (
                    <span className="text-xs font-bold text-status-grey">Off</span>
                  )
                ) : null}
              </div>
              <p className="mt-1.5 text-xs leading-[17px] text-helper-gray">
                {factors.length > 0
                  ? "Your account requires a 6-digit authenticator code at sign-in."
                  : "Add an extra layer of security. At sign-in you'll be asked for a 6-digit code from your authenticator app."}
              </p>

              {loadingFactors ? (
                <p className="mt-2 text-xs text-helper-gray" role="status">
                  Checking your settings…
                </p>
              ) : null}

              {factors.length > 0 ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  {factors.map((factor) => (
                    <div
                      key={factor.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-value-dark">
                        {factor.friendlyName || "Authenticator app"}
                      </span>
                      <button
                        type="button"
                        onClick={() => void disableFactor(factor.id)}
                        disabled={busy}
                        className="rounded font-bold text-cancel-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cancel-red/40 disabled:opacity-60"
                      >
                        Turn Off
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {factors.length === 0 && !loadingFactors ? (
              <ActionButton
                variant="primary"
                onClick={() => void startEnrollment()}
                disabled={busy}
              >
                {busy ? "Please wait…" : "Enable Two-Factor Authentication"}
              </ActionButton>
            ) : null}

            {error ? (
              <p className="text-xs leading-[17px] text-cancel-red" role="alert">
                {error}
              </p>
            ) : null}

            <ActionButton variant="secondary" onClick={onClose} disabled={busy}>
              Close
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}
