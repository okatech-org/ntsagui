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
  }).format(amount) + ' XAF';
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
  let y = 15;

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
    const logoHeight = 12;
    const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
    pdf.addImage(logoImg, 'PNG', margin, y, logoWidth, logoHeight);
  }

  // Company name and tagline
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text(COMPANY_INFO.name, margin + 35, y + 5);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.textGray);
  pdf.text(COMPANY_INFO.tagline, margin + 35, y + 10);

  // Company info (right side)
  const rightX = pageWidth - margin;
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.textGray);
  pdf.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.city} - ${COMPANY_INFO.country}`, rightX, y + 3, { align: 'right' });
  pdf.text(`${COMPANY_INFO.phone} • ${COMPANY_INFO.email}`, rightX, y + 7, { align: 'right' });
  pdf.text(`RCCM: ${COMPANY_INFO.rccm} • NIF: ${COMPANY_INFO.nif}`, rightX, y + 11, { align: 'right' });

  // Blue line under header
  y += 16;
  pdf.setDrawColor(COLORS.primaryBlue);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);

  // === DOCUMENT TITLE ===
  y += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text(getDocumentTitle(document.type), pageWidth / 2, y, { align: 'center' });

  // === PAID WATERMARK ===
  if (document.client_confirmed_payment) {
    pdf.saveGraphicsState();
    pdf.setFontSize(80);
    pdf.setTextColor('#22c55e');
    // @ts-ignore - GState exists in jsPDF
    if (pdf.GState) {
      // @ts-ignore
      pdf.setGState(new pdf.GState({ opacity: 0.15 }));
    }
    
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    pdf.text('PAYÉ', centerX, centerY, {
      align: 'center',
      angle: 35
    });
    pdf.restoreGraphicsState();
  }

  // === INFO BOXES ===
  y += 10;
  const boxWidth = (pageWidth - margin * 2 - 10) / 2;
  const boxHeight = 35;

  // Details box (left)
  pdf.setFillColor(COLORS.lightGray);
  pdf.setDrawColor(COLORS.borderGray);
  pdf.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text('DÉTAILS', margin + 5, y + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  
  const detailsLeftX = margin + 5;
  const detailsRightX = margin + boxWidth - 5;
  let detailY = y + 13;

  pdf.setTextColor(COLORS.textGray);
  pdf.text(`N° ${document.type === 'facture' ? 'Facture' : document.type === 'devis' ? 'Devis' : 'Document'}:`, detailsLeftX, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.textDark);
  pdf.text(document.number, detailsRightX, detailY, { align: 'right' });

  detailY += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Émis le:', detailsLeftX, detailY);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(formatDate(document.date), detailsRightX, detailY, { align: 'right' });

  detailY += 6;
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Échéance:', detailsLeftX, detailY);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.red);
  pdf.text(document.payment_due_date ? formatDate(document.payment_due_date) : 'Non spécifiée', detailsRightX, detailY, { align: 'right' });

  // Client box (right)
  const clientBoxX = margin + boxWidth + 10;
  pdf.setFillColor(COLORS.lightGray);
  pdf.setDrawColor(COLORS.borderGray);
  pdf.roundedRect(clientBoxX, y, boxWidth, boxHeight, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.primaryBlue);
  pdf.text('FACTURER À', clientBoxX + 5, y + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  let clientY = y + 13;

  if (client) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(COLORS.textDark);
    const clientName = client.name + (client.company ? ` (${client.company})` : '');
    pdf.text(clientName, clientBoxX + 5, clientY);
    clientY += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    
    if (client.rccm) {
      pdf.text(`RCCM: ${client.rccm}`, clientBoxX + 5, clientY);
      clientY += 4;
    }
    if (client.nif) {
      pdf.text(`NIF: ${client.nif}`, clientBoxX + 5, clientY);
      clientY += 4;
    }
    if (client.contact_name) {
      pdf.text(`Contact: ${client.contact_name}`, clientBoxX + 5, clientY);
      clientY += 4;
    }
    const addressParts = [client.address, client.city, client.country].filter(Boolean);
    if (addressParts.length > 0) {
      pdf.text(addressParts.join(', '), clientBoxX + 5, clientY);
      clientY += 4;
    }
    const contactParts = [client.email, client.phone].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.text(contactParts.join(' / '), clientBoxX + 5, clientY);
    }
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.textDark);
    pdf.text(document.client_name, clientBoxX + 5, clientY);
  }

  y += boxHeight + 8;

  // === NOTES ===
  if (document.notes) {
    pdf.setFillColor(COLORS.yellow);
    pdf.setDrawColor(COLORS.orange);
    pdf.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, 'FD');
    pdf.setDrawColor(COLORS.orange);
    pdf.setLineWidth(0.8);
    pdf.line(margin, y, margin, y + 10);
    
    pdf.setFontSize(8);
    pdf.setTextColor('#92400e');
    pdf.text(document.notes, margin + 5, y + 6);
    y += 14;
  }

  // === ITEMS TABLE ===
  const colWidths = {
    desc: 75,
    qty: 15,
    unit: 20,
    price: 30,
    amount: 30
  };
  const tableWidth = pageWidth - margin * 2;
  const rowHeight = 8;

  // Table header
  pdf.setFillColor(COLORS.primaryBlue);
  pdf.rect(margin, y, tableWidth, rowHeight, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.white);
  
  let colX = margin + 3;
  pdf.text('Description', colX, y + 5.5);
  colX += colWidths.desc;
  pdf.text('Qté', colX + colWidths.qty / 2, y + 5.5, { align: 'center' });
  colX += colWidths.qty;
  pdf.text('Unité', colX + colWidths.unit / 2, y + 5.5, { align: 'center' });
  colX += colWidths.unit;
  pdf.text('Prix unit.', colX + colWidths.price - 3, y + 5.5, { align: 'right' });
  colX += colWidths.price;
  pdf.text('Montant', colX + colWidths.amount - 3, y + 5.5, { align: 'right' });

  y += rowHeight;

  // Table rows
  const items = Array.isArray(document.items) ? document.items : [];
  items.forEach((item, index) => {
    const itemRowHeight = item.description && item.productName ? 12 : 8;
    
    // Alternating row background
    if (index % 2 === 1) {
      pdf.setFillColor(COLORS.lightGray);
      pdf.rect(margin, y, tableWidth, itemRowHeight, 'F');
    }
    
    // Row border
    pdf.setDrawColor(COLORS.borderGray);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y + itemRowHeight, margin + tableWidth, y + itemRowHeight);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.textDark);
    
    colX = margin + 3;
    pdf.text(item.productName || item.description || '', colX, y + 5);
    
    if (item.description && item.productName) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(COLORS.textGray);
      const descLines = pdf.splitTextToSize(item.description, colWidths.desc - 5);
      pdf.text(descLines[0] || '', colX, y + 9);
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(COLORS.textDark);
    
    colX += colWidths.desc;
    pdf.text(String(item.quantity), colX + colWidths.qty / 2, y + 5, { align: 'center' });
    
    colX += colWidths.qty;
    pdf.text(item.unit || 'unité', colX + colWidths.unit / 2, y + 5, { align: 'center' });
    
    colX += colWidths.unit;
    pdf.text(formatCurrency(item.unitPrice || item.price || 0), colX + colWidths.price - 3, y + 5, { align: 'right' });
    
    colX += colWidths.price;
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatCurrency((item.quantity || 0) * (item.unitPrice || item.price || 0)), colX + colWidths.amount - 3, y + 5, { align: 'right' });

    y += itemRowHeight;
  });

  y += 10;

  // === STAMP AND TOTALS ===
  const subtotal = Number(document.subtotal) || 0;
  const total = Number(document.total) || 0;
  const taxAmount = total - subtotal;
  const isTaxExempt = taxAmount === 0;

  // Stamp (left)
  if (stampImg) {
    const stampHeight = 30;
    const stampWidth = (stampImg.width / stampImg.height) * stampHeight;
    pdf.addImage(stampImg, 'PNG', margin, y, stampWidth, stampHeight);
  }

  // Totals box (right)
  const totalsBoxWidth = 60;
  const totalsBoxX = pageWidth - margin - totalsBoxWidth;
  const totalsBoxY = y;

  pdf.setFillColor(COLORS.lightGray);
  pdf.setDrawColor(COLORS.primaryBlue);
  pdf.roundedRect(totalsBoxX, totalsBoxY, totalsBoxWidth, 25, 2, 2, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Sous-total HT:', totalsBoxX + 3, totalsBoxY + 6);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(formatCurrency(subtotal), totalsBoxX + totalsBoxWidth - 3, totalsBoxY + 6, { align: 'right' });

  pdf.setDrawColor(COLORS.borderGray);
  pdf.line(totalsBoxX, totalsBoxY + 8.5, totalsBoxX + totalsBoxWidth, totalsBoxY + 8.5);

  pdf.setTextColor(COLORS.textGray);
  pdf.text(`TVA (${isTaxExempt ? 'Exonéré' : '18%'}):`, totalsBoxX + 3, totalsBoxY + 14);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(formatCurrency(taxAmount), totalsBoxX + totalsBoxWidth - 3, totalsBoxY + 14, { align: 'right' });

  // Total row with blue background
  pdf.setFillColor(COLORS.primaryBlue);
  pdf.rect(totalsBoxX, totalsBoxY + 17, totalsBoxWidth, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(COLORS.white);
  pdf.text(`TOTAL ${isTaxExempt ? '' : 'TTC'}:`, totalsBoxX + 3, totalsBoxY + 22);
  pdf.text(formatCurrency(total), totalsBoxX + totalsBoxWidth - 3, totalsBoxY + 22, { align: 'right' });

  y += 35;

  // === PAYMENT INFO ===
  pdf.setFillColor(COLORS.lightBlue);
  pdf.setDrawColor(COLORS.lightBlueBorder);
  pdf.roundedRect(margin, y, pageWidth - margin * 2, 12, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.textDark);
  pdf.text(`Montant à régler: ${formatCurrency(total)} avant le ${document.payment_due_date ? formatDate(document.payment_due_date) : 'Non spécifiée'}`, margin + 5, y + 5);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.textGray);
  pdf.text('Paiement à réception de facture. Pénalités de retard: 1,5%/mois.', margin + 5, y + 10);

  // === FOOTER ===
  const footerY = pageHeight - 20;
  pdf.setDrawColor(COLORS.borderGray);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 10, footerY, pageWidth - margin - 10, footerY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(COLORS.footerGray);
  
  pdf.text(`${COMPANY_INFO.name} • ${COMPANY_INFO.legalForm}`, pageWidth / 2, footerY + 5, { align: 'center' });
  pdf.text(`RCCM: ${COMPANY_INFO.rccm} • NIF: ${COMPANY_INFO.nif} • ANPI: ${COMPANY_INFO.anpi}`, pageWidth / 2, footerY + 9, { align: 'center' });
  pdf.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.city} - ${COMPANY_INFO.country} • ${COMPANY_INFO.website}`, pageWidth / 2, footerY + 13, { align: 'center' });

  // Save
  pdf.save(`${getDocumentTitle(document.type)}-${document.number}.pdf`);
};
