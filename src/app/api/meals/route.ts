import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { getMealsForDate, isValidDate, todayUtc } from "@/lib/meals";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date") ?? todayUtc();
  if (!isValidDate(date)) {
    return Response.json(
      { error: "Invalid date, expected YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const meals = await getMealsForDate(userId, date);
  return Response.json({ date, meals });
}
