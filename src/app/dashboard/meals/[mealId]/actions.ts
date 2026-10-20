"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  addFoodItemToMeal,
  removeFoodItemFromMeal,
  updateMeal,
} from "@/data/meals";

const updateMealSchema = z.object({
  mealId: z.number().int().positive(),
  name: z.string().trim().min(1, "Name is required").max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time"),
});

export async function updateMealAction(input: z.infer<typeof updateMealSchema>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = updateMealSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Day boundaries are UTC across the app (see src/data/meals.ts)
  const { mealId, name, date, time } = parsed.data;
  const eatenAt = new Date(`${date}T${time}:00.000Z`);
  if (Number.isNaN(eatenAt.getTime())) {
    return { success: false, error: "Invalid date" };
  }

  const meal = await updateMeal(userId, mealId, { name, eatenAt });
  if (!meal) return { success: false, error: "Meal not found" };

  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${date}`);
}

const addFoodItemSchema = z.object({
  mealId: z.number().int().positive(),
  foodItemId: z.number().int().positive(),
  quantity: z
    .number("Quantity is required")
    .positive("Quantity must be greater than 0")
    .max(99999.99, "Quantity is too large")
    .multipleOf(0.01, "Use at most 2 decimal places"),
});

export async function addFoodItemAction(
  input: z.infer<typeof addFoodItemSchema>,
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = addFoodItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { mealId, foodItemId, quantity } = parsed.data;
  try {
    const row = await addFoodItemToMeal(userId, mealId, foodItemId, quantity);
    if (!row) return { success: false, error: "Meal or food not found" };
  } catch {
    // Unique (mealId, foodItemId) violation is the expected failure
    return { success: false, error: "This food is already in the meal" };
  }

  revalidatePath(`/dashboard/meals/${mealId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

const removeFoodItemSchema = z.object({
  mealId: z.number().int().positive(),
  mealFoodItemId: z.number().int().positive(),
});

export async function removeFoodItemAction(
  input: z.infer<typeof removeFoodItemSchema>,
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const parsed = removeFoodItemSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const { mealId, mealFoodItemId } = parsed.data;
  const removed = await removeFoodItemFromMeal(userId, mealId, mealFoodItemId);
  if (!removed) return { success: false, error: "Meal not found" };

  revalidatePath(`/dashboard/meals/${mealId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
