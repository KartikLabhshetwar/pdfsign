"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File | null;
  pdfBytes: Uint8Array | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  onPageLoad?: (width: number, height: number) => void;
  children?: React.ReactNode;
}

export function PDFViewer({
  file,
  pdfBytes,
  currentPage,
  onPageChange,
  scale,
  onScaleChange,
  onPageLoad,
  children,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);

  const pdfUrl = useMemo(() => {
    if (!pdfBytes) return null;
    
    const arrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [pdfBytes]);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setError(error.message);
    setLoading(false);
  };

  const handlePageLoadSuccess = (page: { getViewport: (options: { scale: number }) => { width: number; height: number } }) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageWidth(viewport.width);
    
    if (onPageLoad) {
      onPageLoad(viewport.width, viewport.height);
    }
  };

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

  if (!file || !pdfBytes) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No PDF loaded</p>
      </div>
    );
  }

  const scaledWidth = pageWidth * scale;

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
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/20 p-4 flex items-start justify-center relative"
      >
        {error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <p>Error loading PDF: {error}</p>
          </div>
        ) : pdfUrl ? (
          <div
            className="relative shadow-lg"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <p>Loading PDF...</p>
                </div>
              }
              className="react-pdf__Document"
            >
              <Page
                pageNumber={currentPage}
                width={scaledWidth}
                onLoadSuccess={handlePageLoadSuccess}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="react-pdf__Page"
              />
            </Document>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}