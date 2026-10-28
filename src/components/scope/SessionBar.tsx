interface SessionBarProps {
  email?: string;
  onSignOut: () => void;
}

export function SessionBar({ email, onSignOut }: SessionBarProps) {
  if (!email) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <span className="text-xs text-helper-gray" role="status">
        Signed in as{" "}
        <span className="font-bold text-value-dark">{email}</span>
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
