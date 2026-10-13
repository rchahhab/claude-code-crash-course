# Data Fetching Standards

These rules apply to all data fetching in this project.

## 1. Server Components only

**All data fetching must be done via Server Components.**

- Fetch data directly in `async` Server Components (pages and layouts) by calling the helper functions described below.
- **Under absolutely no circumstances create route handlers (`route.ts`) to fetch data.** No `src/app/api/**` endpoints for reading data.
- Do not fetch data from Client Components (no `useEffect` + `fetch`, no SWR/React Query against internal endpoints). If a Client Component needs data, fetch it in a Server Component and pass it down as props.

## 2. Database queries go through `/data` helpers

- All database queries live in helper functions inside the `src/data/` directory (import alias: `@/data/...`).
- Server Components call these helpers; they never query the database inline.
- Group helpers by domain, for example `src/data/meals.ts`.

## 3. Drizzle ORM only — no raw SQL

- Helper functions must use Drizzle ORM (query builder or relational `db.query`) to query the database.
- **DO NOT USE RAW SQL.** No `sql` template strings for whole queries, no `db.execute()` with hand-written SQL, no driver-level queries.

## 4. Users can only access their own data

A logged-in user must only be able to access their own data, never any other user's data.

- Every helper that reads user-owned data takes the user's id and filters by it (for example `where: { userId, ... }`).
- Get the user id from the authenticated session on the server (Clerk `auth()`), in the Server Component. Never accept a user id from the URL, search params, or any client-supplied input.
- If there is no authenticated user, redirect to sign-in or return nothing. Do not fall back to unscoped queries.
- When fetching a single record by id, also filter by the owner's `userId`, so guessing another user's record id returns nothing.

## Example

```ts
// src/data/meals.ts
import db from "@/db";

export async function getMealsForDate(userId: string, start: Date, end: Date) {
  return db.query.meals.findMany({
    where: { userId, eatenAt: { gte: start, lt: end } },
    orderBy: { eatenAt: "asc" },
  });
}
```

```tsx
// src/app/dashboard/page.tsx (Server Component)
import { auth } from "@clerk/nextjs/server";
import { getMealsForDate } from "@/data/meals";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) return null; // or redirect to sign-in

  const meals = await getMealsForDate(userId, start, end);
  // render with shadcn/ui components
}
```

## Before merging

- [ ] No route handlers used for fetching data
- [ ] All queries live in `src/data/` helpers
- [ ] No raw SQL; Drizzle ORM only
- [ ] Every user-data query is scoped to the authenticated user's id
