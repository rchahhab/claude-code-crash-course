"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addFoodItemAction, removeFoodItemAction } from "./actions";

type FoodOption = { value: string; label: string };

type LoggedItem = {
  id: number;
  name: string;
  quantity: number;
  calories: number;
};

export function FoodItems({
  mealId,
  foods,
  items,
}: {
  mealId: number;
  foods: FoodOption[];
  items: LoggedItem[];
}) {
  const [food, setFood] = useState<FoodOption | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = items.reduce((sum, item) => sum + item.calories, 0);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!food) {
      setError("Select a food");
      return;
    }
    startTransition(async () => {
      const result = await addFoodItemAction({
        mealId,
        foodItemId: Number(food.value),
        quantity: quantity.trim() === "" ? NaN : Number(quantity),
      });
      if (result.success) {
        setFood(null);
        setQuantity("1");
      } else {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  function handleRemove(mealFoodItemId: number) {
    setError(null);
    startTransition(async () => {
      const result = await removeFoodItemAction({ mealId, mealFoodItemId });
      if (!result.success) setError(result.error ?? "Something went wrong");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No food items logged yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Food</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Calories</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {Math.round(item.calories)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${item.name}`}
                    disabled={pending}
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">{Math.round(total)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      )}

      <form
        onSubmit={handleAdd}
        className="grid gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="food">Food</Label>
          <Combobox
            items={foods}
            value={food}
            onValueChange={setFood}
            itemToStringLabel={(item: FoodOption) => item.label}
            isItemEqualToValue={(a: FoodOption, b: FoodOption) =>
              a.value === b.value
            }
          >
            <ComboboxInput id="food" placeholder="Search foods..." />
            <ComboboxContent>
              <ComboboxEmpty>No foods found.</ComboboxEmpty>
              <ComboboxList>
                {(item: FoodOption) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Adding..." : "Add"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
