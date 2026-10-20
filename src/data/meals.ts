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

export async function getMealById(userId: string, mealId: number) {
  return db.query.meals.findFirst({
    where: { id: mealId, userId },
  });
}

export async function updateMeal(
  userId: string,
  mealId: number,
  values: { name: string; eatenAt: Date },
) {
  const [meal] = await db
    .update(meals)
    .set(values)
    .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
    .returning();
  return meal;
}

// Day boundaries are UTC
export async function getMealsForDate(userId: string, date: string) {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return db.query.meals.findMany({
    where: { userId, eatenAt: { gte: start, lt: end } },
    with: { mealFoodItems: { with: { foodItem: true } } },
    orderBy: { eatenAt: "asc" },
  });
}
