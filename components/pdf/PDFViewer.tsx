"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onPageLoad?: (width: number, height: number) => void;
  children?: React.ReactNode;
}

export function PDFViewer({
  file,
  currentPage,
  onPageChange,
  scale,
  onScaleChange,
  onPageLoad,
  children,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [file]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.2, 3));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.2, 0.5));
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No PDF loaded</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || loading}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {numPages || "..."}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-sm min-w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-muted/20 p-4 flex items-start justify-center relative">
        <div className="relative">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <p>Loading PDF...</p>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8 text-destructive">
                <p>Failed to load PDF</p>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
              onLoadSuccess={(page) => {
                const { width, height } = page;
                onPageLoad?.(width, height);
              }}
            />
          </Document>
          {children}
        </div>
      </div>
    </div>
  );
}
