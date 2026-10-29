import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { ScopeWordmark } from "@/components/scope/ScopeWordmark";
import {
  STATUS_LABEL,
  type DemoTransactionStatus,
} from "@/components/scope/types";
import { getAdminOverview } from "@/server/admin.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Scope — Founder Admin" },
      {
        name: "description",
        content:
          "Founder-only admin view of registered Scope accounts, verification status, and simulated escrow transactions.",
      },
      { property: "og:title", content: "Scope — Founder Admin" },
      {
        property: "og:description",
        content:
          "Founder-only admin view of registered Scope accounts, verification status, and simulated escrow transactions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type BadgeTone = "green" | "amber" | "grey" | "red";

const BADGE_TONES: Record<BadgeTone, string> = {
  green: "bg-escrow-green/10 text-escrow-green",
  amber: "bg-status-amber/10 text-status-amber",
  grey: "bg-status-grey/10 text-status-grey",
  red: "bg-cancel-red/10 text-cancel-red",
};

function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold",
        BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<DemoTransactionStatus, BadgeTone> = {
  pending: "amber",
  withdrawn: "green",
  cancelled: "grey",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminPage() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
  });

  const forbidden = Boolean(
    error && /forbidden/i.test(error instanceof Error ? error.message : String(error)),
  );

  return (
    <main className="min-h-screen bg-page-bg px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-[960px]">
        <div className="rounded-[18px] border border-card-border bg-white p-6 shadow-card sm:rounded-[20px] sm:p-8">
          <ScopeWordmark className="mb-[21px]" />

          <h1 className="text-2xl font-bold uppercase text-escrow-green sm:text-[28px]">
            Founder Admin
          </h1>
          <p className="mt-2 text-sm text-subtitle-gray">
            Registered accounts, verification status, and simulated escrow
            transactions.
          </p>

          {isLoading ? (
            <p className="mt-8 text-sm text-helper-gray" role="status">
              Loading accounts…
            </p>
          ) : null}

          {error && !isLoading ? (
            <div className="mt-6 rounded-[13px] border border-card-border bg-panel-bg p-4">
              <p className="text-sm font-bold text-value-dark">
                {forbidden
                  ? "You don't have access to this page."
                  : "Something went wrong loading the admin data."}
              </p>
              {!forbidden ? (
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-2 rounded text-sm font-bold text-scope-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-red/40"
                >
                  Try again
                </button>
              ) : null}
            </div>
          ) : null}

          {data && !isLoading && !error ? (
            <>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-[13px] border border-card-border bg-panel-bg p-3">
                  <p className="text-xs text-label-muted">Accounts</p>
                  <p className="mt-1 text-xl font-bold text-value-dark">
                    {data.users.length}
                  </p>
                </div>
                <div className="rounded-[13px] border border-card-border bg-panel-bg p-3">
                  <p className="text-xs text-label-muted">Email Verified</p>
                  <p className="mt-1 text-xl font-bold text-value-dark">
                    {data.users.filter((user) => user.emailVerified).length}
                  </p>
                </div>
                <div className="rounded-[13px] border border-card-border bg-panel-bg p-3">
                  <p className="text-xs text-label-muted">2FA Enabled</p>
                  <p className="mt-1 text-xl font-bold text-value-dark">
                    {data.users.filter((user) => user.mfaEnabled).length}
                  </p>
                </div>
              </div>

              {data.users.length === 0 ? (
                <p className="mt-6 text-sm text-helper-gray">
                  No accounts have registered yet.
                </p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-card-border text-left text-xs uppercase tracking-wide text-label-muted">
                        <th className="py-2 pr-3 font-bold">Account</th>
                        <th className="py-2 pr-3 font-bold">Joined</th>
                        <th className="py-2 pr-3 font-bold">Email</th>
                        <th className="py-2 pr-3 font-bold">2FA</th>
                        <th className="py-2 pr-3 font-bold">Status</th>
                        <th className="py-2 pr-3 font-bold">Payment Method</th>
                        <th className="py-2 font-bold">Last Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.map((user) => {
                        const status =
                          (user.transaction?.status as DemoTransactionStatus) ??
                          null;
                        return (
                          <tr
                            key={user.id}
                            className="border-b border-card-border/70 align-top last:border-b-0"
                          >
                            <td className="py-3 pr-3">
                              <p className="font-semibold text-value-dark">
                                {user.email ?? "Unknown"}
                              </p>
                              {user.displayName ? (
                                <p className="text-xs text-helper-gray">
                                  {user.displayName}
                                </p>
                              ) : null}
                            </td>
                            <td className="py-3 pr-3 text-xs text-helper-gray">
                              {formatDate(user.joinedAt)}
                            </td>
                            <td className="py-3 pr-3">
                              <Badge tone={user.emailVerified ? "green" : "red"}>
                                {user.emailVerified ? "Verified" : "Unverified"}
                              </Badge>
                            </td>
                            <td className="py-3 pr-3">
                              <Badge tone={user.mfaEnabled ? "green" : "grey"}>
                                {user.mfaEnabled ? "On" : "Off"}
                              </Badge>
                            </td>
                            <td className="py-3 pr-3">
                              {status ? (
                                <Badge tone={STATUS_TONES[status]}>
                                  {STATUS_LABEL[status] ?? status}
                                </Badge>
                              ) : (
                                <span className="text-xs text-helper-gray">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-3 text-xs text-value-dark">
                              {user.transaction?.paymentMethod ?? "—"}
                            </td>
                            <td className="py-3 text-xs text-helper-gray">
                              {formatDate(user.transaction?.updatedAt ?? null)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}

          <Link
            to="/"
            className="mt-8 inline-block rounded text-sm font-bold text-scope-red underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-red/40"
          >
            ← Back to Scope
          </Link>
        </div>
      </div>
    </main>
  );
}
