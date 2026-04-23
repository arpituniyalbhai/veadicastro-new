import { jsPDF } from "jspdf";
import { saveInvoiceRecord } from "@/lib/firebase";

const TAX_RATE = 0.18;
const SUPPORT_EMAIL = "support@veadicastro.in";
const SUPPORT_PHONE = "+91 94117 61184";
const WEBSITE_NAME = "Veadicastro";

export type InvoiceInput = {
  fullName: string;
  email: string;
  planName: string;
  totalAmount: number;
  paymentId: string;
  billingAddress?: string | null;
};

export const calculateBreakdown = (totalAmount: number) => {
  const baseAmount = Number((totalAmount / (1 + TAX_RATE)).toFixed(2));
  const taxAmount = Number((totalAmount - baseAmount).toFixed(2));
  return { baseAmount, taxAmount };
};

export async function generateInvoice(input: InvoiceInput) {
  const { fullName, email, planName, totalAmount, paymentId } = input;
  const { baseAmount, taxAmount } = calculateBreakdown(totalAmount);
  const invoiceNumber = `INV-${Date.now()}`;
  const purchaseDate = new Date();

  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(WEBSITE_NAME, 20, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoiceNumber}`, 20, 30);
  doc.text(`Date: ${purchaseDate.toLocaleDateString()} ${purchaseDate.toLocaleTimeString()}`, 20, 36);
  doc.text(`Payment ID: ${paymentId}`, 20, 42);

  doc.text("Billed To:", 20, 55);
  doc.text(fullName, 20, 61);
  doc.text(email, 20, 67);

  doc.text("Plan Details:", 120, 55);
  doc.text(`Plan: ${planName}`, 120, 61);
  doc.text(`Support: ${SUPPORT_EMAIL}`, 120, 67);

  doc.line(20, 75, 190, 75);
  doc.text("Description", 20, 83);
  doc.text("Amount (₹)", 160, 83);
  doc.line(20, 86, 190, 86);

  doc.text(`Base Amount`, 20, 94);
  doc.text(baseAmount.toFixed(2), 160, 94, { align: "right" });
  doc.text(`Tax (18%)`, 20, 102);
  doc.text(taxAmount.toFixed(2), 160, 102, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.text("Total", 20, 112);
  doc.text(totalAmount.toFixed(2), 160, 112, { align: "right" });
  doc.setFont("helvetica", "normal");

  doc.line(20, 118, 190, 118);
  doc.text(`Thank you for choosing ${WEBSITE_NAME}!`, 20, 128);
  doc.text(`Support: ${SUPPORT_EMAIL} | ${SUPPORT_PHONE}`, 20, 134);

  const pdfDataUrl = doc.output("dataurlstring");
  const blob = doc.output("blob");
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${invoiceNumber}.pdf`;
  link.click();
  URL.revokeObjectURL(objectUrl);

  await saveInvoiceRecord({
    invoiceNumber,
    fullName,
    email,
    planName,
    baseAmount,
    taxAmount,
    totalAmount,
    paymentId,
    purchaseDate: purchaseDate.toISOString(),
    pdfDataUrl,
  });

  return { invoiceNumber, pdfDataUrl };
}

