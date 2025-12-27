"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";

interface DateFieldProps {
  onSave: (date: string) => void;
  onCancel: () => void;
  initialValue?: string;
}

export function DateField({ onSave, onCancel, initialValue }: DateFieldProps) {
  const currentDateStr = format(new Date(), "yyyy-MM-dd");
  const [dateValue, setDateValue] = useState(
    initialValue
      ? (() => {
          try {
            const parsed = parse(initialValue, "MM/dd/yyyy", new Date());
            return format(parsed, "yyyy-MM-dd");
          } catch {
            return currentDateStr;
          }
        })()
      : currentDateStr
  );
  const [useCurrentDate, setUseCurrentDate] = useState(!initialValue);

  const handleSave = () => {
    const finalDate = useCurrentDate
      ? format(new Date(), "MM/dd/yyyy")
      : (() => {
          try {
            const parsed = parse(dateValue, "yyyy-MM-dd", new Date());
            return format(parsed, "MM/dd/yyyy");
          } catch {
            return format(new Date(), "MM/dd/yyyy");
          }
        })();
    onSave(finalDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Select Date</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useCurrent"
              checked={useCurrentDate}
              onChange={(e) => setUseCurrentDate(e.target.checked)}
              className="size-4"
            />
            <label htmlFor="useCurrent" className="text-sm">
              Use current date
            </label>
          </div>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => {
              setDateValue(e.target.value);
              setUseCurrentDate(false);
            }}
            disabled={useCurrentDate}
            className="mb-4"
          />
          {useCurrentDate && (
            <p className="text-sm text-muted-foreground">
              Current date: {format(new Date(), "MM/dd/yyyy")}
            </p>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
