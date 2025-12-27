"use client";

import { useEffect, useRef, useState } from "react";
import type { Field } from "@/lib/utils/fieldManager";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FieldOverlayProps {
  fields: Field[];
  pageWidth: number;
  pageHeight: number;
  scale: number;
  onFieldClick: (field: Field) => void;
  onFieldDelete: (fieldId: string) => void;
  selectedFieldId?: string;
}

export function FieldOverlay({
  fields,
  pageWidth,
  pageHeight,
  scale,
  onFieldClick,
  onFieldDelete,
  selectedFieldId,
}: FieldOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      const canvasElement = containerRef.current?.querySelector(
        ".react-pdf__Page__canvas"
      ) as HTMLCanvasElement;
      if (!canvasElement || !containerRef.current) return;

      const rect = canvasElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setDimensions({
        width: rect.width,
        height: rect.height,
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
      });
    };

    updateDimensions();
    const interval = setInterval(updateDimensions, 100);
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, [scale]);

  if (!dimensions || fields.length === 0) return null;

  const widthRatio = dimensions.width / pageWidth;
  const heightRatio = dimensions.height / pageHeight;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div
        className="absolute pointer-events-none"
        style={{
          left: dimensions.left,
          top: dimensions.top,
          width: dimensions.width,
          height: dimensions.height,
        }}
      >
        {fields.map((field) => {
          const isSelected = field.id === selectedFieldId;
          return (
            <div
              key={field.id}
              className="absolute pointer-events-auto border-2 border-dashed border-primary bg-primary/10 cursor-pointer group"
              style={{
                left: field.x * widthRatio,
                top: field.y * heightRatio,
                width: field.width * widthRatio,
                height: field.height * heightRatio,
                borderColor: isSelected
                  ? "hsl(var(--primary))"
                  : "hsl(var(--primary) / 0.5)",
                backgroundColor: isSelected
                  ? "hsl(var(--primary) / 0.2)"
                  : "hsl(var(--primary) / 0.1)",
              }}
              onClick={() => onFieldClick(field)}
            >
              <div className="absolute -top-6 left-0 text-xs text-primary bg-background px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {field.type}
              </div>
              {field.value && (
                <div className="p-1 text-xs overflow-hidden h-full">
                  {field.type === "signature" ? (
                    <img
                      src={field.value}
                      alt="Signature"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-foreground text-[10px]">
                      {field.value}
                    </span>
                  )}
                </div>
              )}
              {isSelected && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 size-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFieldDelete(field.id);
                  }}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}