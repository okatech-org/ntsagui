import { useRef } from "react";
import logoNtsagui from "@/assets/logo-ntsagui.png";
import tamponNtsagui from "@/assets/tampon-ntsagui.png";
import { QRCodeSVG } from "qrcode.react";

interface InvoiceItem {
  productId?: string;
  productName?: string;
  description: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  unit?: string;
}

interface InvoicePreviewProps {
  document: {
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
  };
  client?: {
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
  } | null;
  showQRCode?: boolean;
}

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

const formatCurrency = (amount: number, currency = 'XAF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const getDocumentTitle = (type: string) => {
  switch (type) {
    case 'facture': return 'FACTURE';
    case 'devis': return 'DEVIS';
    case 'bon_commande': return 'BON DE COMMANDE';
    default: return 'DOCUMENT';
  }
};

const getDocumentLabel = (type: string) => {
  switch (type) {
    case 'facture': return 'Facture';
    case 'devis': return 'Devis';
    case 'bon_commande': return 'Bon de commande';
    default: return 'Document';
  }
};

export function InvoicePreview({ document: doc, client, showQRCode = true }: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const items = Array.isArray(doc.items) ? doc.items : [];
  const subtotal = Number(doc.subtotal) || 0;
  const total = Number(doc.total) || 0;
  const taxAmount = total - subtotal;
  const isTaxExempt = taxAmount === 0;

  const formattedIssueDate = formatDate(doc.date);
  const formattedDueDate = doc.payment_due_date 
    ? formatDate(doc.payment_due_date)
    : 'Non spécifiée';

  const publicUrl = doc.public_token ? `${window.location.origin}/invoice/${doc.public_token}` : null;

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-lg overflow-auto">
      <div
        ref={previewRef}
        className="mx-auto shadow-xl"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '12mm 15mm 10mm 15mm',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '9pt',
          lineHeight: '1.3',
          boxSizing: 'border-box',
          transform: 'scale(0.55)',
          transformOrigin: 'top center',
          position: 'relative',
          backgroundColor: '#ffffff',
          color: '#111827'
        }}
      >
        {/* PAID Watermark */}
        {doc.client_confirmed_payment && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-35deg)',
            fontSize: '120px',
            fontWeight: 'bold',
            color: 'rgba(34, 197, 94, 0.15)',
            textTransform: 'uppercase',
            letterSpacing: '20px',
            pointerEvents: 'none',
            zIndex: 1,
            whiteSpace: 'nowrap'
          }}>
            PAYÉ
          </div>
        )}

        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', borderBottom: '2px solid #1e40af', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logoNtsagui} alt="NTSAGUI Digital" style={{ height: '35px', width: 'auto' }} />
            <div>
              <h2 style={{ fontSize: '14pt', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>{COMPANY_INFO.name}</h2>
              <p style={{ fontSize: '7pt', color: '#64748b', margin: 0 }}>{COMPANY_INFO.tagline}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '7pt', color: '#64748b', lineHeight: '1.4' }}>
            <p style={{ margin: 0 }}>{COMPANY_INFO.address}, {COMPANY_INFO.city} - {COMPANY_INFO.country}</p>
            <p style={{ margin: 0 }}>{COMPANY_INFO.phone} • {COMPANY_INFO.email}</p>
            <p style={{ margin: 0 }}>RCCM: {COMPANY_INFO.rccm} • NIF: {COMPANY_INFO.nif}</p>
          </div>
        </div>

        {/* Document Title */}
        <div style={{ textAlign: 'center', margin: '10px 0 15px 0' }}>
          <h1 style={{ fontSize: '18pt', fontWeight: 'bold', color: '#1e40af', margin: 0, letterSpacing: '1px' }}>{getDocumentTitle(doc.type)}</h1>
        </div>

        {/* Invoice Info and Client */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Détails</h3>
            <div style={{ fontSize: '8pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span style={{ color: '#64748b' }}>N° {getDocumentLabel(doc.type)}:</span>
                <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{doc.number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span style={{ color: '#64748b' }}>Émis le:</span>
                <span style={{ color: '#1e293b' }}>{formattedIssueDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span style={{ color: '#64748b' }}>Échéance:</span>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{formattedDueDate}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '8pt', fontWeight: 'bold', color: '#1e40af', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Facturer à</h3>
            {client ? (
              <div style={{ fontSize: '8pt', lineHeight: '1.6' }}>
                <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0, fontSize: '9pt' }}>
                  {client.name}{client.company && ` (${client.company})`}
                </p>
                {client.rccm && <p style={{ color: '#1e293b', margin: '3px 0 0 0', fontSize: '7pt' }}>RCCM: {client.rccm}</p>}
                {client.nif && <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>NIF: {client.nif}</p>}
                {client.contact_name && (
                  <>
                    <p style={{ color: '#1e293b', margin: '6px 0 0 0', fontSize: '7pt' }}>Contact:</p>
                    <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>{client.contact_name}</p>
                  </>
                )}
                {(client.address || client.city || client.country) && (
                  <p style={{ color: '#1e293b', margin: '4px 0 0 0', fontSize: '7pt' }}>
                    {[client.address, client.city, client.country].filter(Boolean).join(', ')}
                  </p>
                )}
                <p style={{ color: '#1e293b', margin: '1px 0 0 0', fontSize: '7pt' }}>
                  {[client.email, client.phone].filter(Boolean).join(' / ')}
                </p>
              </div>
            ) : (
              <p style={{ fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{doc.client_name}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {doc.notes && (
          <div style={{ backgroundColor: '#fef3c7', padding: '6px 10px', borderRadius: '4px', marginBottom: '12px', borderLeft: '3px solid #f59e0b' }}>
            <p style={{ fontSize: '8pt', color: '#92400e', margin: 0 }}>{doc.notes}</p>
          </div>
        )}

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
              <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '8pt', fontWeight: '600' }}>Description</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '8pt', fontWeight: '600', width: '45px' }}>Qté</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '8pt', fontWeight: '600', width: '55px' }}>Unité</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '8pt', fontWeight: '600', width: '85px' }}>Prix unit.</th>
              <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '8pt', fontWeight: '600', width: '85px' }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const unitPrice = item.unitPrice || item.price || 0;
              const quantity = item.quantity || 0;
              const itemTotal = quantity * unitPrice;
              
              return (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '8px 6px', color: '#1e293b', fontSize: '8pt' }}>
                    <p style={{ fontWeight: '600', margin: 0 }}>{item.productName || item.description}</p>
                    {item.description && item.productName && (
                      <p style={{ color: '#64748b', fontSize: '7pt', margin: '2px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{item.description}</p>
                    )}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', fontSize: '8pt' }}>{quantity}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: '#1e293b', textTransform: 'capitalize', fontSize: '8pt' }}>{item.unit || 'unité'}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontSize: '8pt' }}>{formatCurrency(unitPrice)}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', color: '#1e293b', fontWeight: '600', fontSize: '8pt' }}>{formatCurrency(itemTotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals and Stamp */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'transparent' }}>
            <img src={tamponNtsagui} alt="Tampon" style={{ height: '90px', width: 'auto', mixBlendMode: 'multiply' }} />
          </div>

          {showQRCode && publicUrl && (
            <div style={{ textAlign: 'center', padding: '6px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <QRCodeSVG value={publicUrl} size={65} level="M" />
              <p style={{ fontSize: '6pt', color: '#64748b', margin: '3px 0 0 0' }}>Scanner pour confirmer</p>
            </div>
          )}

          <div style={{ width: '200px', backgroundColor: '#f8fafc', border: '1px solid #1e40af', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
                <span style={{ color: '#64748b' }}>Sous-total HT:</span>
                <span style={{ color: '#1e293b' }}>{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <div style={{ padding: '6px 10px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt' }}>
                <span style={{ color: '#64748b' }}>TVA ({isTaxExempt ? 'Exonéré' : '18%'}):</span>
                <span style={{ color: '#1e293b' }}>{formatCurrency(taxAmount)}</span>
              </div>
            </div>
            <div style={{ padding: '8px 10px', backgroundColor: '#1e40af' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>TOTAL {isTaxExempt ? '' : 'TTC'}:</span>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ marginTop: '15px', padding: '8px 10px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
          <p style={{ fontSize: '8pt', color: '#1e293b', margin: 0 }}>
            <strong>Montant à régler:</strong> {formatCurrency(total)} avant le {formattedDueDate}
          </p>
          <p style={{ fontSize: '7pt', color: '#64748b', margin: '4px 0 0 0' }}>
            Paiement à réception de facture. Pénalités de retard: 1,5%/mois.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute',
          bottom: '15mm',
          left: '20mm',
          right: '20mm',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '10px',
          textAlign: 'center',
          fontSize: '7pt',
          color: '#94a3b8'
        }}>
          <p style={{ margin: '2px 0' }}>{COMPANY_INFO.name} • {COMPANY_INFO.legalForm}</p>
          <p style={{ margin: '2px 0' }}>RCCM: {COMPANY_INFO.rccm} • NIF: {COMPANY_INFO.nif} • ANPI: {COMPANY_INFO.anpi}</p>
          <p style={{ margin: '2px 0' }}>{COMPANY_INFO.address}, {COMPANY_INFO.city} - {COMPANY_INFO.country} • {COMPANY_INFO.website}</p>
        </div>
      </div>
    </div>
  );
}

export { formatCurrency, formatDate, getDocumentTitle, COMPANY_INFO };
