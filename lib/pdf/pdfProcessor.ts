import { PDFDocument, rgb } from "pdf-lib";
import type { Field } from "@/lib/utils/fieldManager";
import { dataURLToBlob } from "@/lib/utils/signatureUtils";

export async function processPDF(
  pdfBytes: Uint8Array,
  fields: Field[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  for (const field of fields) {
    const page = pages[field.page - 1];
    if (!page) continue;

    const { width: pageWidth, height: pageHeight } = page.getSize();

    if (field.type === "signature" && field.value) {
      try {
        const imageBlob = dataURLToBlob(field.value);
        const imageBytes = await imageBlob.arrayBuffer();
        let image;

        if (field.value.startsWith("data:image/png")) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const imageDims = image.scale(1);
        const fieldWidth = field.width;
        const fieldHeight = field.height;

        const scaleX = fieldWidth / imageDims.width;
        const scaleY = fieldHeight / imageDims.height;
        const scale = Math.min(scaleX, scaleY);

        const imgWidth = imageDims.width * scale;
        const imgHeight = imageDims.height * scale;

        const x = field.x;
        const y = pageHeight - field.y - imgHeight;

        page.drawImage(image, {
          x,
          y,
          width: imgWidth,
          height: imgHeight,
        });
      } catch (error) {
        console.error("Error embedding signature:", error);
      }
    } else if (field.type === "text" && field.value) {
      const fontSize = Math.min(field.height * 0.6, 12);
      page.drawText(field.value, {
        x: field.x,
        y: pageHeight - field.y - fontSize,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    } else if (field.type === "date" && field.value) {
      const fontSize = Math.min(field.height * 0.6, 12);
      page.drawText(field.value, {
        x: field.x,
        y: pageHeight - field.y - fontSize,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
}
