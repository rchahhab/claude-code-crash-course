import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMealById } from "@/data/meals";
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

  const meal = await getMealById(userId, mealId);
  if (!meal) notFound();

  const eatenAt = meal.eatenAt.toISOString();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
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
    </main>
  );
}
