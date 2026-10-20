import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMealsForDate } from "@/data/meals";
import { isValidDate, todayUtc } from "@/lib/meals";
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
        <div className="flex items-center gap-2">
          <DatePicker date={date} />
          <Button render={<Link href="/dashboard/meals/new" />} nativeButton={false}>
            New meal
          </Button>
        </div>
      </div>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground">
            No meals logged for {date}.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {meals.map((meal) => {
            const calories = meal.mealFoodItems.reduce(
              (sum, mfi) =>
                sum + Number(mfi.foodItem?.calories ?? 0) * Number(mfi.quantity),
              0,
            );
            return (
              <Card key={meal.id}>
                <CardHeader>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/dashboard/meals/${meal.id}`} />}
                      nativeButton={false}
                    >
                      Edit
                    </Button>
                  </CardAction>
                  <CardTitle>{meal.name ?? "Untitled meal"}</CardTitle>
                  <CardDescription>
                    {meal.eatenAt.toISOString().slice(11, 16)} UTC ·{" "}
                    {Math.round(calories)} kcal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-muted-foreground">
                    {meal.mealFoodItems.map((mfi) => (
                      <li key={mfi.id}>
                        {mfi.foodItem?.name} × {Number(mfi.quantity)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
