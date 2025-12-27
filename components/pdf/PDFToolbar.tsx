"use client";

import { Button } from "@/components/ui/button";
import { Pen, Type, Calendar, Download, Trash2 } from "lucide-react";
import type { FieldType } from "@/lib/utils/fieldManager";

interface PDFToolbarProps {
  activeTool: FieldType | null;
  onToolSelect: (tool: FieldType | null) => void;
  onDownload: () => void;
  onClearAll: () => void;
  fieldCount: number;
  isProcessing: boolean;
}

export function PDFToolbar({
  activeTool,
  onToolSelect,
  onDownload,
  onClearAll,
  fieldCount,
  isProcessing,
}: PDFToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-4 border-b bg-background">
      <div className="flex items-center gap-2">
        <Button
          variant={activeTool === "signature" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            onToolSelect(activeTool === "signature" ? null : "signature")
          }
        >
          <Pen className="size-4" />
          Signature
        </Button>
        <Button
          variant={activeTool === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => onToolSelect(activeTool === "text" ? null : "text")}
        >
          <Type className="size-4" />
          Text
        </Button>
        <Button
          variant={activeTool === "date" ? "default" : "outline"}
          size="sm"
          onClick={() => onToolSelect(activeTool === "date" ? null : "date")}
        >
          <Calendar className="size-4" />
          Date
        </Button>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {fieldCount} field{fieldCount !== 1 ? "s" : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          disabled={fieldCount === 0}
        >
          <Trash2 className="size-4" />
          Clear All
        </Button>
        <Button
          onClick={onDownload}
          disabled={fieldCount === 0 || isProcessing}
        >
          <Download className="size-4" />
          {isProcessing ? "Processing..." : "Download PDF"}
        </Button>
      </div>
    </div>
  );
}
