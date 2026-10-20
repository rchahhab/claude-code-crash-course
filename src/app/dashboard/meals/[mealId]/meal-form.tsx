"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateMealAction } from "./actions";

export function MealForm({
  mealId,
  defaultName,
  defaultDate,
  defaultTime,
}: {
  mealId: number;
  defaultName: string;
  defaultDate: string;
  defaultTime: string;
}) {
  const [name, setName] = useState(defaultName);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Parse as a local date so the calendar shows the same day as the string
  const [y, m, d] = date.split("-").map(Number);
  const selected = new Date(y, m - 1, d);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      // On success the action redirects, so a result only comes back on failure
      const result = await updateMealAction({ mealId, name, date, time });
      if (result && !result.success) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Breakfast"
          maxLength={255}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={<Button variant="outline" className="justify-start" />}
              aria-label="Select date"
            >
              <CalendarIcon />
              {format(selected, "PPP")}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selected}
                defaultMonth={selected}
                onSelect={(next) => {
                  // Clicking the selected day deselects it; keep the current date
                  if (!next) return;
                  setOpen(false);
                  setDate(format(next, "yyyy-MM-dd"));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="time">Time (UTC)</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
