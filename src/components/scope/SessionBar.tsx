import { Link } from "@tanstack/react-router";

interface SessionBarProps {
  email?: string | undefined;
  isAdmin?: boolean;
  onOpenAccount: () => void;
  onSignOut: () => void;
}

export function SessionBar({
  email,
  isAdmin = false,
  onOpenAccount,
  onSignOut,
}: SessionBarProps) {
  if (!email) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
      <span className="text-xs text-helper-gray" role="status">
        Signed in as{" "}
        <span className="font-bold text-value-dark">{email}</span>
      </span>
      <span className="text-xs text-helper-gray" aria-hidden="true">
        ·
      </span>
      <button
        type="button"
        onClick={onOpenAccount}
        className="rounded text-xs font-bold text-scope-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-red/40"
      >
        Account
      </button>
      {isAdmin ? (
        <>
          <span className="text-xs text-helper-gray" aria-hidden="true">
            ·
          </span>
          <Link
            to="/admin"
            className="rounded text-xs font-bold text-scope-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-red/40"
          >
            Admin
          </Link>
        </>
      ) : null}
      <span className="text-xs text-helper-gray" aria-hidden="true">
        ·
      </span>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded text-xs font-bold text-scope-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-red/40"
      >
        Sign Out
      </button>
    </div>
  );
}
