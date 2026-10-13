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
