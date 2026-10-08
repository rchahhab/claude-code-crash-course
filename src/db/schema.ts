import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const foodItems = pgTable(
  "food_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    // Clerk user id; null = shared food, set = user's custom food
    userId: text("user_id"),
    name: varchar({ length: 255 }).notNull(),
    calories: numeric({ precision: 8, scale: 2 }).notNull(),
    carbs: numeric({ precision: 8, scale: 2 }).notNull().default("0"),
    fiber: numeric({ precision: 8, scale: 2 }),
    sugar: numeric({ precision: 8, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.userId), index().on(t.name)],
);

export const meals = pgTable(
  "meals",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: varchar({ length: 255 }),
    eatenAt: timestamp("eaten_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.userId, t.eatenAt)],
);

export const mealFoodItems = pgTable(
  "meal_food_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    mealId: integer("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    foodItemId: integer("food_item_id")
      .notNull()
      .references(() => foodItems.id, { onDelete: "restrict" }),
    quantity: numeric({ precision: 8, scale: 2 }).notNull().default("1"),
  },
  (t) => [unique().on(t.mealId, t.foodItemId), index().on(t.mealId)],
);

export const relations = defineRelations(
  { foodItems, meals, mealFoodItems },
  (r) => ({
    meals: {
      mealFoodItems: r.many.mealFoodItems({
        from: r.meals.id,
        to: r.mealFoodItems.mealId,
      }),
    },
    foodItems: {
      mealFoodItems: r.many.mealFoodItems({
        from: r.foodItems.id,
        to: r.mealFoodItems.foodItemId,
      }),
    },
    mealFoodItems: {
      meal: r.one.meals({
        from: r.mealFoodItems.mealId,
        to: r.meals.id,
      }),
      foodItem: r.one.foodItems({
        from: r.mealFoodItems.foodItemId,
        to: r.foodItems.id,
      }),
    },
  }),
);
