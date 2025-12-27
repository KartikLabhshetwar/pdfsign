import { PDFDocument } from "pdf-lib";

export async function getPDFPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  return pdfDoc.getPageCount();
}

export async function getPDFPageDimensions(
  pdfBytes: Uint8Array,
  pageNumber: number
): Promise<{ width: number; height: number }> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[pageNumber - 1];
  if (!page) {
    throw new Error(`Page ${pageNumber} not found`);
  }
  return page.getSize();
}
