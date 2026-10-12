"use client";

import { useRouter } from "next/navigation";

export function DatePicker({ date }: { date: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      value={date}
      onChange={(e) => {
        // Cleared input yields ""; keep the current date instead of navigating
        if (e.target.value) router.push(`/dashboard?date=${e.target.value}`);
      }}
      className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label="Select date"
    />
  );
}
