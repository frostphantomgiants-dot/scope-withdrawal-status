import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PAYMENT_METHODS } from "@/components/scope/types";

export interface AdminTransactionView {
  status: string;
  paymentMethod: string | null;
  updatedAt: string | null;
}

export interface AdminUserRow {
  id: string;
  email: string | null;
  displayName: string | null;
  joinedAt: string | null;
  lastSignInAt: string | null;
  emailVerified: boolean;
  mfaEnabled: boolean;
  transaction: AdminTransactionView | null;
}

const PAYMENT_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.value, method.label]),
);

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Verify the caller really holds the admin role server-side; the route
    // gate only proves they are signed in.
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) {
      throw new Error("Could not verify admin access.");
    }
    if (!isAdmin) {
      throw new Error("Forbidden: admin access is required for this page.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const [usersResult, profilesResult, transactionsResult] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from("profiles").select("id, display_name, created_at"),
      supabase
        .from("escrow_transactions")
        .select("user_id, status, payment_method, updated_at"),
    ]);

    if (usersResult.error) {
      throw new Error("Could not load registered accounts.");
    }

    const displayNames = new Map<string, string | null>();
    for (const profile of profilesResult.data ?? []) {
      displayNames.set(profile.id, profile.display_name ?? null);
    }

    // One simulated transaction per account; keep the most recently updated.
    const latestByUser = new Map<
      string,
      { status: string; payment_method: string | null; updated_at: string | null }
    >();
    for (const tx of transactionsResult.data ?? []) {
      const current = latestByUser.get(tx.user_id);
      if (
        !current ||
        (tx.updated_at && current.updated_at && tx.updated_at > current.updated_at)
      ) {
        latestByUser.set(tx.user_id, tx);
      }
    }

    const users = usersResult.data.users;
    const rows: AdminUserRow[] = await Promise.all(
      users.map(async (user) => {
        const { data: factorData } = await supabaseAdmin.auth.mfa.listFactors({
          userId: user.id,
        });
        const mfaEnabled = Boolean(
          factorData?.factors?.some((factor) => factor.status === "verified"),
        );
        const tx = latestByUser.get(user.id);
        return {
          id: user.id,
          email: user.email ?? null,
          displayName: displayNames.get(user.id) ?? null,
          joinedAt: user.created_at ?? null,
          lastSignInAt: user.last_sign_in_at ?? null,
          emailVerified: Boolean(user.email_confirmed_at),
          mfaEnabled,
          transaction: tx
            ? {
                status: tx.status,
                paymentMethod: tx.payment_method
                  ? (PAYMENT_LABELS[tx.payment_method] ?? tx.payment_method)
                  : null,
                updatedAt: tx.updated_at ?? null,
              }
            : null,
        };
      }),
    );

    rows.sort((a, b) => (a.joinedAt ?? "").localeCompare(b.joinedAt ?? ""));

    return { users: rows };
  });
