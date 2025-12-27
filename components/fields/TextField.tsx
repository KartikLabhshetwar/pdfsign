"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TextFieldProps {
  onSave: (text: string) => void;
  onCancel: () => void;
  initialValue?: string;
}

export function TextField({ onSave, onCancel, initialValue = "" }: TextFieldProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Enter Text</h2>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter text here..."
          className="mb-4"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(value)} disabled={!value.trim()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
