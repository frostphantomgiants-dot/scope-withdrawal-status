import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

// Pathless layout guarding everything under it (client-only, since the
// session lives in browser storage). Unauthenticated visitors are sent back
// to the Scope page with the sign-in modal open.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/", search: { signin: "admin" } });
    }
  },
  component: () => <Outlet />,
});
