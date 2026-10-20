import { and, eq } from "drizzle-orm";
import db from "@/db";
import { mealFoodItems, meals } from "@/db/schema";
import { getFoodItemForUser } from "@/data/food-items";

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

export async function getMealWithFoodItems(userId: string, mealId: number) {
  return db.query.meals.findFirst({
    where: { id: mealId, userId },
    with: { mealFoodItems: { with: { foodItem: true }, orderBy: { id: "asc" } } },
  });
}

// Returns null when the meal or food isn't visible to the user
export async function addFoodItemToMeal(
  userId: string,
  mealId: number,
  foodItemId: number,
  quantity: number,
) {
  const [meal, foodItem] = await Promise.all([
    getMealById(userId, mealId),
    getFoodItemForUser(userId, foodItemId),
  ]);
  if (!meal || !foodItem) return null;

  const [row] = await db
    .insert(mealFoodItems)
    .values({ mealId, foodItemId, quantity: quantity.toString() })
    .returning();
  return row;
}

// mealFoodItems has no userId column, so ownership is checked via the meal
export async function removeFoodItemFromMeal(
  userId: string,
  mealId: number,
  mealFoodItemId: number,
) {
  const meal = await getMealById(userId, mealId);
  if (!meal) return false;

  await db
    .delete(mealFoodItems)
    .where(
      and(eq(mealFoodItems.id, mealFoodItemId), eq(mealFoodItems.mealId, mealId)),
    );
  return true;
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
