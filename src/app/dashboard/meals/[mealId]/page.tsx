import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAvailableFoodItems } from "@/data/food-items";
import { getMealWithFoodItems } from "@/data/meals";
import { FoodItems } from "./food-items";
import { MealForm } from "./meal-form";

export default async function EditMealPage({
  params,
}: PageProps<"/dashboard/meals/[mealId]">) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { mealId: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const mealId = Number(rawId);
  if (!Number.isSafeInteger(mealId) || mealId > 2147483647) notFound();

  const [meal, availableFoods] = await Promise.all([
    getMealWithFoodItems(userId, mealId),
    getAvailableFoodItems(userId),
  ]);
  if (!meal) notFound();

  const eatenAt = meal.eatenAt.toISOString();

  const foods = availableFoods.map((f) => ({
    value: String(f.id),
    label: `${f.name} (${Math.round(Number(f.calories))} kcal)`,
  }));
  const items = meal.mealFoodItems.flatMap((mfi) =>
    mfi.foodItem
      ? [
          {
            id: mfi.id,
            name: mfi.foodItem.name,
            quantity: Number(mfi.quantity),
            calories: Number(mfi.foodItem.calories) * Number(mfi.quantity),
          },
        ]
      : [],
  );

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit meal</CardTitle>
          <CardDescription>Update the details of this meal.</CardDescription>
        </CardHeader>
        <CardContent>
          <MealForm
            mealId={meal.id}
            defaultName={meal.name ?? ""}
            defaultDate={eatenAt.slice(0, 10)}
            defaultTime={eatenAt.slice(11, 16)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Food items</CardTitle>
          <CardDescription>Log what you ate in this meal.</CardDescription>
        </CardHeader>
        <CardContent>
          <FoodItems mealId={meal.id} foods={foods} items={items} />
        </CardContent>
      </Card>
    </main>
  );
}
