<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin data (`/admin`, `getAdminOverview`): roles live in `public.user_roles`, checked by the `public.has_role()` security-definer function. The admin overview server function re-verifies `has_role` server-side on every call — the `_authenticated` route gate only proves sign-in, never admin access.

