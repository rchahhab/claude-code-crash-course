# Authentication Standards

These rules apply to everything related to authentication in this project.

## The Rule

**This app uses [Clerk](https://clerk.com) for authentication. Clerk is the only auth system.**

Do not add or hand-roll any other auth: no NextAuth/Auth.js, no custom sessions, cookies, JWTs, password handling, or user tables for credentials. The `@clerk/nextjs` package is already installed.

## How auth is wired up

- **`src/proxy.ts`** runs `clerkMiddleware()` on every request. Next.js 16 uses `proxy.ts` instead of `middleware.ts`. Do not create a `middleware.ts`.
- **`src/app/layout.tsx`** wraps the app in `<ClerkProvider>`. The header uses `<Show when="signed-in">` / `<Show when="signed-out">`, `SignInButton`, `SignUpButton`, and `UserButton`.
- **`src/app/sign-in/[[...sign-in]]/page.tsx`** and **`src/app/sign-up/[[...sign-up]]/page.tsx`** render Clerk's `<SignIn />` and `<SignUp />`.
- Clerk keys and URLs are configured in `.env.local` (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`). Never commit them or hard-code them in source.

Use Clerk's prebuilt components (`SignIn`, `SignUp`, `UserButton`, `SignInButton`, `SignUpButton`) for auth UI. They are Clerk components, not custom UI, so they do not conflict with `docs/ui.md`. Any other UI around them must still be shadcn/ui only.

## Reading the current user

- **On the server, always use `auth()` from `@clerk/nextjs/server`.** It is async, so `await` it:

  ```ts
  import { auth } from "@clerk/nextjs/server";

  const { userId } = await auth();
  ```

- Use `currentUser()` from `@clerk/nextjs/server` only when you need profile fields (name, email, image). Prefer `auth()` when the id is enough.
- The Clerk `userId` is the only user identifier in this app. It is what we store in `userId` columns (see `src/db/schema.ts`).
- **Never take a user id from the URL, search params, form fields, or any other client-supplied input.** It comes from `auth()` on the server and nowhere else.
- In Client Components, use Clerk's hooks (`useUser`, `useAuth`) only for display or UI state, such as showing a name. Never use them to decide what data a user may access.

## Protecting pages

- Every page that shows user data must check auth itself, in the Server Component:

  ```tsx
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  ```

- Do not rely on the proxy matcher, or on hiding UI, as the only protection. `clerkMiddleware()` alone does not block anyone. Always check `userId` where the data is read.
- Pass the `userId` to the `src/data/` helpers, which must filter by it (see `docs/data-fetching.md`). No authenticated user means redirect or return nothing, never an unscoped query.
- If a route group needs blanket protection, use `createRouteMatcher` with `auth.protect()` in `src/proxy.ts` **in addition to** the per-page check, not instead of it.

## Server Actions and mutations

- Call `await auth()` at the top of every Server Action and reject when `userId` is missing.
- Write the authenticated `userId` onto new records, and scope updates and deletes by both record id and `userId`, so a user can never modify another user's data.
- Validate all input from the client. The id of the acting user is never part of that input.

## Route handlers

`docs/data-fetching.md` forbids route handlers for reading data. If a route handler is ever needed for something else (for example a Clerk webhook), it must call `auth()` or verify the webhook signature before doing any work.

## Don't

- Don't store or log passwords, session tokens, or `CLERK_SECRET_KEY`.
- Don't build custom sign-in or sign-up forms unless explicitly requested. Use Clerk's components.
- Don't copy Clerk user data into our database as a source of truth. Store only the Clerk `userId` as the owner key.
- Don't import from `@clerk/nextjs/server` in Client Components.

## Before merging

- [ ] Auth uses Clerk only; no other auth library or custom session code
- [ ] User id comes from `await auth()` on the server, never from client input
- [ ] Every page and Server Action touching user data checks `userId` itself
- [ ] All queries and mutations are scoped to the authenticated `userId`
- [ ] No Clerk keys or secrets in source control
