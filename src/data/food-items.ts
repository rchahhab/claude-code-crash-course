import db from "@/db";

// Shared foods (userId null) plus the user's own custom foods
export async function getAvailableFoodItems(userId: string) {
  return db.query.foodItems.findMany({
    where: { OR: [{ userId: { isNull: true } }, { userId }] },
    orderBy: { name: "asc" },
  });
}

export async function getFoodItemForUser(userId: string, foodItemId: number) {
  return db.query.foodItems.findFirst({
    where: {
      id: foodItemId,
      OR: [{ userId: { isNull: true } }, { userId }],
    },
  });
}
