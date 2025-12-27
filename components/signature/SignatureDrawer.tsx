"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Undo2 } from "lucide-react";

interface SignatureDrawerProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export function SignatureDrawer({ onSave, onCancel }: SignatureDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;
      const y =
        "touches" in e
          ? e.touches[0].clientY - rect.top
          : e.clientY - rect.top;

      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    },
    []
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const x =
        "touches" in e
          ? e.touches[0].clientX - rect.left
          : e.clientX - rect.left;
      const y =
        "touches" in e
          ? e.touches[0].clientY - rect.top
          : e.clientY - rect.top;

      ctx.lineTo(x, y);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      setHasSignature(true);
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        setUndoStack((prev) => [...prev, canvas.toDataURL()]);
      }
    }
    setIsDrawing(false);
  }, [isDrawing]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setUndoStack((prev) => [...prev, canvas.toDataURL()]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = undoStack[undoStack.length - 1];
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setUndoStack((prev) => prev.slice(0, -1));
      setHasSignature(previousState !== canvas.toDataURL());
    };
    img.src = previousState;
  }, [undoStack]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    onSave(dataURL);
  }, [onSave]);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-border rounded-lg bg-muted/30">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-48 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={undoStack.length === 0}
        >
          <Undo2 className="size-4" />
          Undo
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          <Trash2 className="size-4" />
          Clear
        </Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!hasSignature}>
          Save Signature
        </Button>
      </div>
    </div>
  );
}
