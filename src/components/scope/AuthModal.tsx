import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { ActionButton } from "./ActionButton";
import { VisibilityToggle } from "./VisibilityToggle";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type Stage = "form" | "mfa" | "check-email";

interface AuthModalProps {
  open: boolean;
  /** Which action triggered sign-in, for the contextual message. Null when opened without a pending action. */
  reason: "withdraw" | "cancel" | null;
  onClose: () => void;
  onAuthenticated: () => void;
}

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address.")
    .max(255, "Email address is too long."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(72, "Password is too long."),
});

const signupSchema = credentialsSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long."),
});

function mapAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email address, then sign in again.";
  }
  if (/already registered|already exists/i.test(message)) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (/rate limit|too many/i.test(message)) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message;
}

const REASON_TEXT: Record<NonNullable<AuthModalProps["reason"]>, string> = {
  withdraw: "Sign in to continue with your withdrawal.",
  cancel: "Sign in to continue cancelling this transaction.",
};

export function AuthModal({
  open,
  reason,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [stage, setStage] = useState<Stage>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaContext, setMfaContext] = useState<{
    factorId: string;
    challengeId: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaCode, setShowMfaCode] = useState(true);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const mfaFieldRef = useRef<HTMLInputElement>(null);

  const inputClass = (invalid: boolean) =>
    cn(
      "h-[45px] w-full rounded-[11px] border border-select-border bg-white px-[10px] text-sm text-value-dark placeholder:text-subtitle-gray",
      "focus:border-escrow-green focus:outline-none focus-visible:ring-2 focus-visible:ring-escrow-green/40",
      invalid && "border-cancel-red",
    );

  const startMfaChallenge = async () => {
    const { data: factors, error: factorsError } =
      await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.find((factor) => factor.status === "verified");
    if (factorsError || !totp) {
      setFormError(
        "Two-factor authentication is required for this account, but no authenticator app is enrolled.",
      );
      return;
    }
    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challengeError || !challenge) {
      setFormError(
        challengeError
          ? challengeError.message
          : "Could not start the two-factor challenge. Please try again.",
      );
      return;
    }
    setMfaContext({ factorId: totp.id, challengeId: challenge.id });
    setStage("mfa");
  };

  // Issue a fresh challenge on the same factor so an expired code doesn't
  // force the user out of the sign-in flow.
  const requestNewCode = async () => {
    if (!mfaContext) return;
    setFormError(null);
    setMfaCode("");
    setSubmitting(true);
    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: mfaContext.factorId });
      if (challengeError || !challenge) {
        setFormError(
          challengeError
            ? challengeError.message
            : "Could not request a new code. Please try again.",
        );
        return;
      }
      setMfaContext({
        factorId: mfaContext.factorId,
        challengeId: challenge.id,
      });
      mfaFieldRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setStage("form");
    setFormError(null);
    setFieldErrors({});
    setMfaCode("");
    setMfaContext(null);
    setShowPassword(false);
    setShowMfaCode(true);
    firstFieldRef.current?.focus();

    // If the visitor already holds a session that only needs the MFA step
    // (e.g. re-opening after a partial sign-in), skip straight to the code.
    const maybeResumeMfa = async () => {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data && data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
        await startMfaChallenge();
      }
    };
    void maybeResumeMfa();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setFormError(null);
    setFieldErrors({});
    setStage("form");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const schema = mode === "signup" ? signupSchema : credentialsSchema;
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email" && !errors.email) {
          errors.email = issue.message;
        }
        if (issue.path[0] === "password" && !errors.password) {
          errors.password = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) {
          setFormError(mapAuthError(error.message));
          return;
        }
        if (data.session) {
          onAuthenticated();
          return;
        }
        // Email confirmation is on: the account exists but is not signed in
        // until the confirmation link is clicked.
        setStage("check-email");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        setFormError(mapAuthError(error.message));
        return;
      }
      if (!data.session) {
        setFormError("Sign-in could not be completed. Please try again.");
        return;
      }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        await startMfaChallenge();
        return;
      }
      onAuthenticated();
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    if (!mfaContext) return;
    const code = mfaCode.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(code)) {
      setFormError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaContext.factorId,
        challengeId: mfaContext.challengeId,
        code,
      });
      if (error) {
        setFormError(error.message);
        return;
      }
      onAuthenticated();
    } finally {
      setSubmitting(false);
    }
  };

  const backFromMfa = () => {
    setStage("form");
    setFormError(null);
    setMfaCode("");
    setMfaContext(null);
  };

  useEffect(() => {
    if (stage === "mfa") mfaFieldRef.current?.focus();
  }, [stage]);

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
        aria-labelledby="auth-modal-title"
        className="w-full max-w-[360px] rounded-[18px] border border-card-border bg-white p-6 shadow-card"
      >
        <span
          className="block text-center text-2xl font-bold italic lowercase leading-none tracking-[-1px] text-scope-red"
          aria-hidden="true"
        >
          scope
        </span>

        <h2
          id="auth-modal-title"
          className="mt-3 text-center text-lg font-bold text-value-dark"
        >
          {stage === "mfa"
            ? "Two-Factor Authentication"
            : stage === "check-email"
              ? "Confirm Your Email"
              : mode === "signin"
                ? "Sign in to continue"
                : "Create your account"}
        </h2>

        {stage === "form" ? (
          <>
            {reason ? (
              <p className="mt-1.5 text-center text-sm text-helper-gray">
                {REASON_TEXT[reason]}
              </p>
            ) : null}

            <div
              role="tablist"
              aria-label="Authentication mode"
              className="mt-4 grid grid-cols-2 rounded-[11px] border border-select-border bg-panel-bg p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => switchMode("signin")}
                className={cn(
                  "h-[38px] rounded-[8px] text-sm font-bold transition-colors",
                  mode === "signin"
                    ? "bg-white text-value-dark shadow-sm"
                    : "text-label-muted hover:text-value-dark",
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => switchMode("signup")}
                className={cn(
                  "h-[38px] rounded-[8px] text-sm font-bold transition-colors",
                  mode === "signup"
                    ? "bg-white text-value-dark shadow-sm"
                    : "text-label-muted hover:text-value-dark",
                )}
              >
                Sign Up
              </button>
            </div>

            <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1 block text-sm text-label-muted"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  ref={firstFieldRef}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  className={inputClass(Boolean(fieldErrors.email))}
                />
                {fieldErrors.email ? (
                  <p className="mt-1 text-xs text-cancel-red" role="alert">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-1 block text-sm text-label-muted"
                >
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  className={inputClass(Boolean(fieldErrors.password))}
                />
                {fieldErrors.password ? (
                  <p className="mt-1 text-xs text-cancel-red" role="alert">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p className="text-xs leading-[17px] text-cancel-red" role="alert">
                  {formError}
                </p>
              ) : null}

              <ActionButton type="submit" variant="primary" disabled={submitting}>
                {submitting
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </ActionButton>
            </form>

            <p className="mt-3 text-center text-xs text-helper-gray">
              {mode === "signin" ? "New to Scope? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="rounded font-bold text-scope-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-red/40"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </>
        ) : null}

        {stage === "mfa" ? (
          <form className="mt-4 flex flex-col gap-3" onSubmit={handleVerify} noValidate>
            <p className="text-center text-sm leading-[19px] text-helper-gray">
              Enter the 6-digit code from your authenticator app.
            </p>
            <div>
              <label htmlFor="auth-mfa" className="sr-only">
                Authentication code
              </label>
              <input
                id="auth-mfa"
                ref={mfaFieldRef}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={mfaCode}
                onChange={(event) =>
                  setMfaCode(event.target.value.replace(/[^\d\s]/g, ""))
                }
                aria-invalid={Boolean(formError) || undefined}
                className={cn(inputClass(Boolean(formError)), "text-center text-lg tracking-[6px]")}
              />
            </div>

            {formError ? (
              <p className="text-xs leading-[17px] text-cancel-red" role="alert">
                {formError}
              </p>
            ) : null}

            <ActionButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Verifying…" : "Verify Code"}
            </ActionButton>
            <ActionButton
              type="button"
              variant="secondary"
              onClick={() => void requestNewCode()}
              disabled={submitting}
            >
              Request New Code
            </ActionButton>
            <ActionButton variant="secondary" onClick={backFromMfa}>
              Go Back
            </ActionButton>
          </form>
        ) : null}

        {stage === "check-email" ? (
          <>
            <p className="mt-3 text-center text-sm leading-[19px] text-helper-gray">
              We sent a confirmation link to{" "}
              <span className="font-bold text-value-dark">{email}</span>. Confirm
              your email, then come back and sign in.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <ActionButton variant="primary" onClick={onClose}>
                Close
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() => {
                  switchMode("signin");
                  setPassword("");
                }}
              >
                Back to Sign In
              </ActionButton>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
