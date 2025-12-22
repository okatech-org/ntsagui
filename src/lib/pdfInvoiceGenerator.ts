import jsPDF from "jspdf";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import tamponNtsagui from "@/assets/tampon-ntsagui.png";

const COMPANY_INFO = {
  name: "NTSAGUI Digital",
  tagline: "Intelligence Artificielle & Machine Learning",
  address: "Batterie IV - BP 638",
  city: "Libreville",
  country: "Gabon",
  phone: "+241 77 51 14 85",
  email: "contact@ntsagui.com",
  website: "www.ntsagui.com",
  legalForm: "SARL au Capital de 5 000 000 FCFA",
  rccm: "GA-LBV-01-2025-B12-01029",
  nif: "2025 0102 2429 R",
  anpi: "ANPI24208339150I1"
};

interface InvoiceItem {
  productId?: string;
  productName?: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  unit?: string;
}

interface ClientData {
  name: string;
  company?: string;
  rccm?: string;
  nif?: string;
  contact_name?: string;
  address?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
}

interface DocumentData {
  number: string;
  type: string;
  date: string;
  payment_due_date?: string;
  client_name: string;
  notes?: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  client_confirmed_payment?: boolean;
  public_token?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace(/\s/g, ' ') + ' FCFA';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const getDocumentTitle = (type: string): string => {
  switch (type) {
    case 'facture': return 'FACTURE';
    case 'devis': return 'DEVIS';
    case 'bon_commande': return 'BON DE COMMANDE';
    default: return 'DOCUMENT';
  }
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Color definitions
const COLORS = {
  primaryBlue: '#1e40af',
  textDark: '#1e293b',
  textGray: '#64748b',
  lightGray: '#f8fafc',
  borderGray: '#e2e8f0',
  red: '#dc2626',
  white: '#ffffff',
  yellow: '#fef3c7',
  orange: '#f59e0b',
  lightBlue: '#eff6ff',
  lightBlueBorder: '#bfdbfe',
  footerGray: '#94a3b8'
};

export const generateInvoicePDF = async (
  document: DocumentData,
  client: ClientData | null,
  publicUrl?: string
): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = 12;

  // Load images
  let logoImg: HTMLImageElement | null = null;
  let stampImg: HTMLImageElement | null = null;
  
  try {
    logoImg = await loadImage(logoNtsagui);
    stampImg = await loadImage(tamponNtsagui);
  } catch (e) {
    console.warn('Could not load images for PDF', e);
  }

  // === HEADER ===
  // Logo
  if (logoImg) {
    const logoHeight = 10;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    pdf.addImage(logoImg, 'PNG', margin, y, logoWidth, logoHeight);
  }

  // Company name and tagline (closer to logo)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text(COMPANY_INFO.name, margin + 7, y + 4);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.textGray);
  pdf.text(COMPANY_INFO.tagline, margin + 7, y + 8);

  // Company info (right side)
  const rightX = pageWidth - margin;
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.textGray);
  pdf.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.city} - ${COMPANY_INFO.country}`, rightX, y + 2, { align: 'right' });
  pdf.text(`${COMPANY_INFO.phone} • ${COMPANY_INFO.email}`, rightX, y + 6, { align: 'right' });
  pdf.text(`RCCM: ${COMPANY_INFO.rccm} • NIF: ${COMPANY_INFO.nif}`, rightX, y + 10, { align: 'right' });

  // Blue line under header
  y += 14;
  pdf.setDrawColor(COLORS.primaryBlue);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);

  // === DOCUMENT TITLE ===
  y += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text(getDocumentTitle(document.type), pageWidth / 2, y, { align: 'center' });

  // === PAID WATERMARK ===
  if (document.client_confirmed_payment) {
    pdf.saveGraphicsState();
    pdf.setFontSize(70);
    pdf.setTextColor('#22c55e');
    // @ts-ignore
    if (pdf.GState) {
      // @ts-ignore
      pdf.setGState(new pdf.GState({ opacity: 0.12 }));
    }
    pdf.text('PAYÉ', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 35 });
    pdf.restoreGraphicsState();
  }

  // === INFO BOXES ===
  y += 8;
  const boxWidth = (pageWidth - margin * 2 - 8) / 2;
  
  // Calculate client box height dynamically
  let clientInfoLines = 1;
  if (client) {
    if (client.rccm) clientInfoLines++;
    if (client.nif) clientInfoLines++;
    if (client.contact_name) clientInfoLines += 2;
    if (client.address || client.city || client.country) clientInfoLines++;
    if (client.email || client.phone) clientInfoLines++;
  }
  const boxHeight = Math.max(28, 14 + clientInfoLines * 4);

  // Details box (left)
  pdf.setFillColor(COLORS.lightGray);
  pdf.setDrawColor(COLORS.borderGray);
  pdf.roundedRect(margin, y, boxWidth, boxHeight, 1, 1, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text('DÉTAILS', margin + 4, y + 5);

  const detailsLeftX = margin + 4;
  const detailsRightX = margin + boxWidth - 4;
  let detailY = y + 12;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.textGray);
  pdf.text('N° Facture:', detailsLeftX, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.textDark);
  pdf.text(document.number, detailsRightX, detailY, { align: 'right' });

  detailY += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Émis le:', detailsLeftX, detailY);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(formatDate(document.date), detailsRightX, detailY, { align: 'right' });

  detailY += 5;
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Échéance:', detailsLeftX, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.red);
  pdf.text(document.payment_due_date ? formatDate(document.payment_due_date) : 'Non spécifiée', detailsRightX, detailY, { align: 'right' });

  // Client box (right)
  const clientBoxX = margin + boxWidth + 8;
  pdf.setFillColor(COLORS.lightGray);
  pdf.setDrawColor(COLORS.borderGray);
  pdf.roundedRect(clientBoxX, y, boxWidth, boxHeight, 1, 1, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text('FACTURER À', clientBoxX + 4, y + 5);

  let clientY = y + 12;

  if (client) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(COLORS.textDark);
    const clientName = client.name + (client.company ? ` (${client.company})` : '');
    pdf.text(clientName, clientBoxX + 4, clientY);
    clientY += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    
    if (client.rccm) {
      pdf.text(`RCCM: ${client.rccm}`, clientBoxX + 4, clientY);
      clientY += 4;
    }
    if (client.nif) {
      pdf.text(`NIF: ${client.nif}`, clientBoxX + 4, clientY);
      clientY += 4;
    }
    if (client.contact_name) {
      clientY += 1;
      pdf.text('Contact:', clientBoxX + 4, clientY);
      clientY += 4;
      pdf.text(client.contact_name, clientBoxX + 4, clientY);
      clientY += 4;
    }
    const addressParts = [client.address, client.city, client.country].filter(Boolean);
    if (addressParts.length > 0) {
      pdf.text(addressParts.join(', '), clientBoxX + 4, clientY);
      clientY += 4;
    }
    const contactParts = [client.email, client.phone].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.text(contactParts.join(' / '), clientBoxX + 4, clientY);
    }
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.textDark);
    pdf.text(document.client_name, clientBoxX + 4, clientY);
  }

  y += boxHeight + 6;

  // === NOTES ===
  if (document.notes) {
    pdf.setFillColor(COLORS.yellow);
    pdf.setDrawColor(COLORS.orange);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 8, 1, 1, 'FD');
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, margin, y + 8);
    
    pdf.setFontSize(7);
    pdf.setTextColor('#92400e');
    pdf.text(document.notes, margin + 4, y + 5);
    y += 12;
  }

  // === ITEMS TABLE ===
  const tableWidth = pageWidth - margin * 2;
  const colDesc = 95;
  const colQty = 15;
  const colUnit = 20;
  const colPrice = 25;
  const colAmount = tableWidth - colDesc - colQty - colUnit - colPrice;
  
  // Table header
  pdf.setFillColor(COLORS.primaryBlue);
  pdf.rect(margin, y, tableWidth, 7, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.white);
  
  let headerX = margin + 3;
  pdf.text('Description', headerX, y + 4.5);
  headerX += colDesc;
  pdf.text('Qté', headerX + colQty / 2, y + 4.5, { align: 'center' });
  headerX += colQty;
  pdf.text('Unité', headerX + colUnit / 2, y + 4.5, { align: 'center' });
  headerX += colUnit;
  pdf.text('Prix unit.', headerX + colPrice - 2, y + 4.5, { align: 'right' });
  headerX += colPrice;
  pdf.text('Montant', headerX + colAmount - 3, y + 4.5, { align: 'right' });

  y += 7;

  // Table rows
  const items = Array.isArray(document.items) ? document.items : [];
  
  items.forEach((item, index) => {
    const productName = item.productName || item.description || '';
    const description = item.productName && item.description ? item.description : '';
    
    // Calculate row height based on description
    let descLines: string[] = [];
    if (description) {
      descLines = pdf.splitTextToSize(description, colDesc - 6);
    }
    const rowHeight = description ? Math.max(12, 8 + descLines.length * 3.5) : 8;
    
    // Alternating row background
    if (index % 2 === 1) {
      pdf.setFillColor(COLORS.lightGray);
      pdf.rect(margin, y, tableWidth, rowHeight, 'F');
    }
    
    // Row border
    pdf.setDrawColor(COLORS.borderGray);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y + rowHeight, margin + tableWidth, y + rowHeight);

    // Product name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.textDark);
    pdf.text(productName, margin + 3, y + 5);
    
    // Description (multi-line)
    if (descLines.length > 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(COLORS.textGray);
      let descY = y + 9;
      descLines.forEach((line: string) => {
        pdf.text(line, margin + 3, descY);
        descY += 3.5;
      });
    }

    // Other columns - vertically centered
    const centerY = y + rowHeight / 2 + 1;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.textDark);
    
    let colX = margin + colDesc;
    pdf.text(String(item.quantity), colX + colQty / 2, centerY, { align: 'center' });
    
    colX += colQty;
    const unitText = (item.unit || 'Unité').charAt(0).toUpperCase() + (item.unit || 'Unité').slice(1);
    pdf.text(unitText, colX + colUnit / 2, centerY, { align: 'center' });
    
    colX += colUnit;
    pdf.text(formatCurrency(item.unitPrice || item.price || 0), colX + colPrice - 2, centerY, { align: 'right' });
    
    colX += colPrice;
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency((item.quantity || 0) * (item.unitPrice || item.price || 0)), colX + colAmount - 3, centerY, { align: 'right' });

    y += rowHeight;
  });

  y += 8;

  // === STAMP AND TOTALS ===
  const subtotal = Number(document.subtotal) || 0;
  const total = Number(document.total) || 0;
  const taxAmount = total - subtotal;
  const isTaxExempt = taxAmount === 0;

  // Stamp (left)
  if (stampImg) {
    const stampHeight = 25;
    const stampWidth = (stampImg.width / stampImg.height) * stampHeight;
    pdf.addImage(stampImg, 'PNG', margin, y, stampWidth, stampHeight);
  }

  // Totals box (right)
  const totalsBoxWidth = 55;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const totalsBoxY = y;

  pdf.setFillColor(COLORS.lightGray);
  pdf.setDrawColor(COLORS.primaryBlue);
  pdf.roundedRect(totalsBoxX, totalsBoxY, totalsBoxWidth, 22, 1, 1, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Sous-total HT:', totalsBoxX + 3, totalsBoxY + 5);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(formatCurrency(subtotal), totalsBoxX + totalsBoxWidth - 3, totalsBoxY + 5, { align: 'right' });

  pdf.setDrawColor(COLORS.borderGray);
  pdf.line(totalsBoxX, totalsBoxY + 7.5, totalsBoxX + totalsBoxWidth, totalsBoxY + 7.5);

  pdf.setTextColor(COLORS.textGray);
  pdf.text(`TVA (${isTaxExempt ? 'Exonéré' : '18%'}):`, totalsBoxX + 3, totalsBoxY + 12);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(formatCurrency(taxAmount), totalsBoxX + totalsBoxWidth - 3, totalsBoxY + 12, { align: 'right' });

  // Total row with blue background
  pdf.setFillColor(COLORS.primaryBlue);
  pdf.rect(totalsBoxX, totalsBoxY + 15, totalsBoxWidth, 7, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(COLORS.white);
  pdf.text(`TOTAL ${isTaxExempt ? '' : 'TTC'}:`, totalsBoxX + 3, totalsBoxY + 19.5);
  pdf.text(formatCurrency(total), totalsBoxX + totalsBoxWidth - 3, totalsBoxY + 19.5, { align: 'right' });

  y += 30;

  // === PAYMENT INFO ===
  pdf.setFillColor(COLORS.lightBlue);
  pdf.setDrawColor(COLORS.lightBlueBorder);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 10, 1, 1, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(`Montant à régler: ${formatCurrency(total)} avant le ${document.payment_due_date ? formatDate(document.payment_due_date) : 'Non spécifiée'}`, margin + 4, y + 4);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Paiement à réception de facture. Pénalités de retard: 1,5%/mois.', margin + 4, y + 8);

  // === FOOTER ===
  const footerY = pageHeight - 18;
  pdf.setDrawColor(COLORS.borderGray);
  pdf.setLineWidth(0.2);
  pdf.line(margin + 10, footerY, pageWidth - margin - 10, footerY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.footerGray);
  
  pdf.text(`${COMPANY_INFO.name} • ${COMPANY_INFO.legalForm}`, pageWidth / 2, footerY + 4, { align: 'center' });
  pdf.text(`RCCM: ${COMPANY_INFO.rccm} • NIF: ${COMPANY_INFO.nif} • ANPI: ${COMPANY_INFO.anpi}`, pageWidth / 2, footerY + 8, { align: 'center' });
  pdf.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.city} - ${COMPANY_INFO.country} • ${COMPANY_INFO.website}`, pageWidth / 2, footerY + 12, { align: 'center' });

  // Save
  pdf.save(`${getDocumentTitle(document.type)}-${document.number}.pdf`);
};
