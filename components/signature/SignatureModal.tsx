"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignatureDrawer } from "./SignatureDrawer";
import { SignatureUpload } from "./SignatureUpload";

interface SignatureModalProps {
  onSave: (signature: string) => void;
  onClose: () => void;
}

export function SignatureModal({ onSave, onClose }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create Signature</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="flex gap-2 mb-4 border-b">
          <Button
            variant={activeTab === "draw" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("draw")}
          >
            Draw
          </Button>
          <Button
            variant={activeTab === "upload" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("upload")}
          >
            Upload
          </Button>
        </div>
        {activeTab === "draw" ? (
          <SignatureDrawer onSave={onSave} onCancel={onClose} />
        ) : (
          <SignatureUpload onSave={onSave} onCancel={onClose} />
        )}
      </div>
    </div>
  );
}
