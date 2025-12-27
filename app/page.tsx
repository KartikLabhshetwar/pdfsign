"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@/components/pdf/PDFViewer").then((mod) => ({ default: mod.PDFViewer })),
  { ssr: false }
);
import { PDFToolbar } from "@/components/pdf/PDFToolbar";
import { FieldOverlay } from "@/components/pdf/FieldOverlay";
import { SignatureModal } from "@/components/signature/SignatureModal";
import { TextField } from "@/components/fields/TextField";
import { DateField } from "@/components/fields/DateField";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { Field, FieldType } from "@/lib/utils/fieldManager";
import {
  createField,
  updateFieldValue,
  getFieldsForPage,
  deleteField,
} from "@/lib/utils/fieldManager";
import { processPDF } from "@/lib/pdf/pdfProcessor";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [fields, setFields] = useState<Field[]>([]);
  const [activeTool, setActiveTool] = useState<FieldType | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showTextField, setShowTextField] = useState(false);
  const [showDateField, setShowDateField] = useState(false);
  const [pendingField, setPendingField] = useState<Field | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageDimensions, setPageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || file.type !== "application/pdf") {
        alert("Please select a valid PDF file");
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPdfBytes(bytes);
      setPdfFile(file);
      setCurrentPage(1);
      setFields([]);
      setActiveTool(null);
      setPageDimensions(null);
    },
    []
  );

  const handlePageLoad = useCallback((width: number, height: number) => {
    setPageDimensions({ width, height });
  }, []);

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!activeTool || !pdfBytes || !pageDimensions) return;

      const canvasElement = e.currentTarget.querySelector(
        ".react-pdf__Page__canvas"
      ) as HTMLCanvasElement;
      if (!canvasElement) return;

      const canvasRect = canvasElement.getBoundingClientRect();
      const clickX = e.clientX - canvasRect.left;
      const clickY = e.clientY - canvasRect.top;

      if (
        clickX < 0 ||
        clickY < 0 ||
        clickX > canvasRect.width ||
        clickY > canvasRect.height
      ) {
        return;
      }

      const pdfX = (clickX / canvasRect.width) * pageDimensions.width;
      const pdfY = (clickY / canvasRect.height) * pageDimensions.height;

      const field = createField(activeTool, currentPage, pdfX, pdfY);
      setPendingField(field);

      if (activeTool === "signature") {
        setShowSignatureModal(true);
      } else if (activeTool === "text") {
        setShowTextField(true);
      } else if (activeTool === "date") {
        setShowDateField(true);
      }
    },
    [activeTool, pdfBytes, pageDimensions, currentPage]
  );

  const handleSignatureSave = useCallback(
    (signature: string) => {
      if (pendingField) {
        const updatedField = updateFieldValue(pendingField, signature);
        setFields((prev) => [...prev, updatedField]);
        setPendingField(null);
        setShowSignatureModal(false);
        setActiveTool(null);
      }
    },
    [pendingField]
  );

  const handleTextSave = useCallback(
    (text: string) => {
      if (pendingField) {
        const updatedField = updateFieldValue(pendingField, text);
        setFields((prev) => [...prev, updatedField]);
        setPendingField(null);
        setShowTextField(false);
        setActiveTool(null);
      }
    },
    [pendingField]
  );

  const handleDateSave = useCallback(
    (date: string) => {
      if (pendingField) {
        const updatedField = updateFieldValue(pendingField, date);
        setFields((prev) => [...prev, updatedField]);
        setPendingField(null);
        setShowDateField(false);
        setActiveTool(null);
      }
    },
    [pendingField]
  );

  const handleFieldClick = useCallback((field: Field) => {
    setSelectedField(field);
  }, []);

  const handleFieldDelete = useCallback((fieldId: string) => {
    setFields((prev) => deleteField(prev, fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  }, [selectedField]);

  const handleDownload = useCallback(async () => {
    if (!pdfBytes || fields.length === 0) return;

    setIsProcessing(true);
    try {
      const processedBytes = await processPDF(pdfBytes, fields);
      const blob = new Blob([new Uint8Array(processedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed-${pdfFile?.name || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, fields, pdfFile]);

  const handleClearAll = useCallback(() => {
    if (confirm("Are you sure you want to clear all fields?")) {
      setFields([]);
      setSelectedField(null);
    }
  }, []);

  const currentPageFields = getFieldsForPage(fields, currentPage);

  if (!pdfFile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">PDF Signing Tool</h1>
          <p className="text-muted-foreground">
            Upload a PDF to start adding signatures, text, and dates
          </p>
          <div className="flex justify-center">
            <label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button asChild>
                <span>
                  <Upload className="size-4" />
                  Upload PDF
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <PDFToolbar
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        onDownload={handleDownload}
        onClearAll={handleClearAll}
        fieldCount={fields.length}
        isProcessing={isProcessing}
      />
      <div className="flex-1 overflow-hidden relative">
        <PDFViewer
          file={pdfFile}
          pdfBytes={pdfBytes}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            setPageDimensions(null);
          }}
          scale={scale}
          onScaleChange={setScale}
          onPageLoad={handlePageLoad}
        >
          {pageDimensions && (
            <FieldOverlay
              fields={currentPageFields}
              pageWidth={pageDimensions.width}
              pageHeight={pageDimensions.height}
              scale={scale}
              onFieldClick={handleFieldClick}
              onFieldDelete={handleFieldDelete}
              selectedFieldId={selectedField?.id}
            />
          )}
          {activeTool && (
            <div
              className="absolute inset-0 cursor-crosshair z-10"
              onClick={handlePageClick}
            />
          )}
        </PDFViewer>
      </div>
      {showSignatureModal && (
        <SignatureModal
          onSave={handleSignatureSave}
          onClose={() => {
            setShowSignatureModal(false);
            setPendingField(null);
            setActiveTool(null);
          }}
        />
      )}
      {showTextField && (
        <TextField
          onSave={handleTextSave}
          onCancel={() => {
            setShowTextField(false);
            setPendingField(null);
            setActiveTool(null);
          }}
        />
      )}
      {showDateField && (
        <DateField
          onSave={handleDateSave}
          onCancel={() => {
            setShowDateField(false);
            setPendingField(null);
            setActiveTool(null);
          }}
        />
      )}
    </div>
  );
}