import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMealsForDate, isValidDate, todayUtc } from "@/lib/meals";
import { DatePicker } from "./date-picker";

function resolveDate(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && isValidDate(value) ? value : todayUtc();
}

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const date = resolveDate((await searchParams).date);
  const meals = await getMealsForDate(userId, date);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatePicker date={date} />
      </div>

      {meals.length === 0 ? (
        <p className="text-muted-foreground">No meals logged for {date}.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {meals.map((meal) => {
            const calories = meal.mealFoodItems.reduce(
              (sum, mfi) => sum + Number(mfi.foodItem?.calories ?? 0) * Number(mfi.quantity),
              0,
            );
            return (
              <li key={meal.id} className="rounded-lg border p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-medium">{meal.name ?? "Untitled meal"}</h2>
                  <span className="text-sm text-muted-foreground">
                    {meal.eatenAt.toISOString().slice(11, 16)} UTC ·{" "}
                    {Math.round(calories)} kcal
                  </span>
                </div>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {meal.mealFoodItems.map((mfi) => (
                    <li key={mfi.id}>
                      {mfi.foodItem?.name} × {Number(mfi.quantity)}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
