"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createMeal } from "@/data/meals";

const createMealSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time"),
});

export async function createMealAction(input: z.infer<typeof createMealSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = createMealSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Day boundaries are UTC across the app (see src/data/meals.ts)
  const { name, date, time } = parsed.data;
  const eatenAt = new Date(`${date}T${time}:00.000Z`);
  if (Number.isNaN(eatenAt.getTime())) {
    return { success: false, error: "Invalid date" };
  }

  await createMeal(userId, { name, eatenAt });
  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${date}`);
}
