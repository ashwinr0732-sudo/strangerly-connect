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
- Premium is read only from the backend `premium_entitlements` table via `is_premium()`; only service-role code (e.g. a verified payment webhook) may write it — never grant Premium from the client.
- Chat media lives in the private `chat-media` bucket at `{session}/{sender}/{voice|image}/file`; access is enforced by storage policies + `open_view_once()`, and clients only use short-lived signed URLs.
