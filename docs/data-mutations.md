# Data Mutations Standards

These rules apply to every data mutation (insert, update, delete) in this project.

## 1. Mutations go through Server Actions only

**All data mutations must be performed via Server Actions.**

- Do not mutate data from route handlers (`route.ts`, no `src/app/api/**`), Client Components, or Server Components during render.
- Do not write to the database from a Client Component. A Client Component calls a Server Action imported from an `actions.ts` file.

## 2. Server Actions live in co-located `actions.ts` files

- Put Server Actions in a file named **`actions.ts`**, in the same route directory as the UI that uses them. For example, `src/app/dashboard/actions.ts` serves `src/app/dashboard/page.tsx`.
- Start the file with the `"use server"` directive. Every export is then a Server Action.
- Do not inline `"use server"` functions in page or component files, and do not collect actions in a shared global file. If two routes need the same mutation, each has its own `actions.ts` that calls the same `src/data/` helper.
- A Client Component cannot define a Server Action. It imports one from the co-located `actions.ts`.

## 3. Database writes go through `src/data/` helpers

- All database writes live in helper functions inside `src/data/` (import alias: `@/data/...`), grouped by domain, for example `src/data/meals.ts`. This is the same directory as the read helpers in `docs/data-fetching.md`.
- A Server Action never touches the database inline. It validates input, authenticates, calls a helper, and revalidates.
- Helpers wrap **Drizzle ORM** calls (`db.insert`, `db.update`, `db.delete`). **DO NOT USE RAW SQL**, including `sql` template strings for whole statements and `db.execute()` with hand-written SQL.
- Helpers contain no auth, no request handling, and no cache revalidation. They take plain typed arguments, including the `userId`.

## 4. Typed parameters and validation

- Server Action parameters must be typed. Do **not** use the `FormData` type for parameters. Parse a form into a typed object in the client code and pass that object to the action.
- **All Server Actions must validate their arguments using Zod.** Server Actions are reachable by direct POST requests, so treat all arguments as untrusted. Define a Zod schema, parse the arguments with it at the top of the action, and only use the parsed result. Install Zod with `npm install zod` if it isn't present yet.
- Return a plain serializable result for expected failures (for example `{ success: false, error: "..." }`) instead of throwing, so the UI can show the message.

## 5. Authentication and ownership

Follow `docs/auth.md`. In addition:

- Call `await auth()` first in every Server Action, and stop when there is no `userId`.
- The `userId` comes from `auth()` only. It is never a parameter of the action.
- Pass the `userId` to the helper. Inserts write it onto the new row.
- Updates and deletes filter by **both** the record id and the `userId`, so a user cannot modify a record they don't own, even by guessing its id.

## 6. After a mutation

- Call `revalidatePath(...)` (or `refresh()`) from `next/cache` in the Server Action so the UI shows the new data.
- Call `redirect(...)` last, because it throws and nothing after it runs.

## Example

```ts
// src/data/meals.ts
import { and, eq } from "drizzle-orm";
import db from "@/db";
import { meals } from "@/db/schema";

export async function createMeal(
  userId: string,
  values: { name: string; eatenAt: Date },
) {
  const [meal] = await db
    .insert(meals)
    .values({ userId, ...values })
    .returning();
  return meal;
}

export async function deleteMeal(userId: string, mealId: number) {
  await db
    .delete(meals)
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
}
```

```ts
// src/app/dashboard/actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createMeal } from "@/data/meals";

const createMealSchema = z.object({
  name: z.string().min(1).max(100),
  eatenAt: z.coerce.date(),
});

export async function createMealAction(input: z.infer<typeof createMealSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = createMealSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  await createMeal(userId, parsed.data);
  revalidatePath("/dashboard");
  return { success: true };
}
```

Check the actual column and table names in `src/db/schema.ts` when writing a real helper.

## Before merging

- [ ] Every mutation is a Server Action in a co-located `actions.ts` with `"use server"`
- [ ] No mutations in route handlers, Client Components, or inline in page files
- [ ] All writes live in `src/data/` helpers using Drizzle ORM; no raw SQL
- [ ] Action parameters are typed (no `FormData`) and validated with Zod
- [ ] `await auth()` is checked first; `userId` is never accepted from the client
- [ ] Updates and deletes are scoped by record id and `userId`
- [ ] The cache is revalidated, and `redirect` (if any) comes last
