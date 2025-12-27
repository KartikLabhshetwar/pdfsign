"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { resizeImage } from "@/lib/utils/signatureUtils";

interface SignatureUploadProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export function SignatureUpload({ onSave, onCancel }: SignatureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataURL = event.target?.result as string;
        try {
          const resized = await resizeImage(dataURL, 600, 200);
          setPreview(resized);
        } catch (err) {
          setError("Failed to process image");
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleSave = useCallback(() => {
    if (preview) {
      onSave(preview);
    }
  }, [preview, onSave]);

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-border rounded-lg bg-muted/30 p-8 flex items-center justify-center min-h-48">
        {preview ? (
          <img
            src={preview}
            alt="Signature preview"
            className="max-w-full max-h-48 object-contain"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <Upload className="size-12 mx-auto mb-2 opacity-50" />
            <p>No image selected</p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          Choose Image
        </Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!preview}>
          Save Signature
        </Button>
      </div>
    </div>
  );
}
