import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { todayUtc } from "@/lib/meals";
import { MealForm } from "./meal-form";

export default async function NewMealPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const now = new Date().toISOString();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>New meal</CardTitle>
          <CardDescription>Log a meal for your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <MealForm defaultDate={todayUtc()} defaultTime={now.slice(11, 16)} />
        </CardContent>
      </Card>
    </main>
  );
}
