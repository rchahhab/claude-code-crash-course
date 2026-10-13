"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ date }: { date: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Parse as a local date so the calendar shows the same day as the URL param
  const [y, m, d] = date.split("-").map(Number);
  const selected = new Date(y, m - 1, d);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" />}
        aria-label="Select date"
      >
        <CalendarIcon />
        {format(selected, "PPP")}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(next) => {
            // Clicking the selected day deselects it; keep the current date
            if (!next) return;
            setOpen(false);
            router.push(`/dashboard?date=${format(next, "yyyy-MM-dd")}`);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
