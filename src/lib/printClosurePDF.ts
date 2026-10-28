import { ShiftClosure } from './types'
import { formatCLP, formatDate, formatTime } from './utils'

export function printClosurePDF(closure: ShiftClosure, orgName: string = 'ParkControl') {
  if (typeof window === 'undefined') return

  const printWindow = window.open('', '_blank', 'width=850,height=950')
  if (!printWindow) {
    alert('Por favor, permite las ventanas emergentes (pop-ups) en tu navegador para generar el PDF.')
    return
  }

  const dateStr = formatDate(closure.closed_at)
  const timeStr = formatTime(closure.closed_at)
  const folio = closure.id ? closure.id.slice(0, 8).toUpperCase() : 'N/A'

  // Extract payment breakdown from receipt_text if present
  const cashMatch = closure.receipt_text.match(/Efectivo:\s*([^\n\r]+)/i)
  const cardMatch = closure.receipt_text.match(/Tarjeta:\s*([^\n\r]+)/i)
  const transferMatch = closure.receipt_text.match(/Transferencia:\s*([^\n\r]+)/i)

  const cashStr = cashMatch ? cashMatch[1].trim() : 'N/A'
  const cardStr = cardMatch ? cardMatch[1].trim() : 'N/A'
  const transferStr = transferMatch ? transferMatch[1].trim() : 'N/A'

  // Check for audit incidents
  const hasAudits = closure.receipt_text.includes('REGISTROS DE AUDITORÍA') || closure.receipt_text.includes('ELIMINACIONES') || closure.receipt_text.includes('TARIFAS AJUSTADAS')

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Comprobante de Cierre de Caja - ${folio}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .doc-badge {
      text-align: right;
    }
    .doc-folio {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }
    .doc-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .report-title {
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 16px;
      text-align: center;
      background: #f1f5f9;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      background: #f8fafc;
    }
    .kpi-card.highlight {
      background: #fef3c7;
      border-color: #f59e0b;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      font-family: monospace;
    }
    .kpi-card.highlight .kpi-value {
      color: #b45309;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 10px;
      margin-top: 18px;
    }
    .table-container {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-container th, .table-container td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    .table-container th {
      background: #f1f5f9;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #334155;
    }
    .table-container td.amount {
      text-align: right;
      font-family: monospace;
      font-weight: 700;
    }
    .receipt-box {
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 12px;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
      color: #1e293b;
      margin-top: 14px;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 45px;
      padding-top: 10px;
    }
    .signature-line {
      border-top: 1px solid #475569;
      text-align: center;
      padding-top: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
    }
    .signature-role {
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
    }
    .footer {
      margin-top: 35px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-bar {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #0f172a;
      color: white;
      padding: 10px 20px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      cursor: pointer;
      font-weight: bold;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    @media print {
      body {
        padding: 0;
      }
      .print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">PARKCONTROL</div>
      <div class="brand-subtitle">${orgName} • Gestión de Estacionamiento</div>
    </div>
    <div class="doc-badge">
      <div class="doc-folio">ARQUEO #${folio}</div>
      <div class="doc-date">Fecha Cierre: ${dateStr} - ${timeStr}</div>
    </div>
  </div>

  <div class="report-title">
    Comprobante Oficial de Arqueo y Cierre de Caja
  </div>

  <div class="kpi-grid">
    <div class="kpi-card highlight">
      <div class="kpi-label">Total Recaudado</div>
      <div class="kpi-value">${formatCLP(closure.total_revenue)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Vehículos Procesados</div>
      <div class="kpi-value">${closure.total_vehicles}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Tarifa Promedio</div>
      <div class="kpi-value">${formatCLP(closure.avg_fee)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Mayor Cobro</div>
      <div class="kpi-value">${formatCLP(closure.max_fee)}</div>
    </div>
  </div>

  <div class="section-title">Desglose de Métodos de Pago</div>
  <table class="table-container">
    <thead>
      <tr>
        <th>Método de Pago</th>
        <th>Tipo</th>
        <th style="text-align: right;">Total Recaudado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>💵 Efectivo</strong></td>
        <td>Moneda física en caja</td>
        <td class="amount">${cashStr}</td>
      </tr>
      <tr>
        <td><strong>💳 Tarjeta</strong></td>
        <td>Débito / Crédito (POS)</td>
        <td class="amount">${cardStr}</td>
      </tr>
      <tr>
        <td><strong>📱 Transferencia</strong></td>
        <td>Transferencia bancaria directa</td>
        <td class="amount">${transferStr}</td>
      </tr>
      <tr style="background: #f8fafc; font-weight: 900;">
        <td colspan="2">TOTAL GENERAL ARQUEADO</td>
        <td class="amount" style="color: #b45309; font-size: 14px;">${formatCLP(closure.total_revenue)}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Detalle Registrado del Cierre</div>
  <div class="receipt-box">${closure.receipt_text}</div>

  <div class="signatures">
    <div>
      <div class="signature-line">
        Firma Cajero / Operador de Turno
      </div>
      <div class="signature-role" style="text-align: center;">Responsable de Caja</div>
    </div>
    <div>
      <div class="signature-line">
        Firma y Timbre Administración
      </div>
      <div class="signature-role" style="text-align: center;">Conforme y Auditado</div>
    </div>
  </div>

  <div class="footer">
    <div>Generado automáticamente por ParkControl SaaS</div>
    <div>Folio de Registro: ${closure.id}</div>
  </div>

  <button class="print-bar" onclick="window.print()">
    🖨️ Imprimir / Guardar como PDF
  </button>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
