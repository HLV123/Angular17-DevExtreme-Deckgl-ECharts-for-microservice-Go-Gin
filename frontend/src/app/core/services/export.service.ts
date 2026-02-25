import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({ providedIn: 'root' })
export class ExportService {

  async exportExcel(data: any[], columns: { header: string; key: string; width?: number }[], filename: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Urban Air Quality System';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Data');

    sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 18 }));

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };
    headerRow.alignment = { horizontal: 'center' };

    data.forEach(item => {
      const row: any = {};
      columns.forEach(c => row[c.key] = item[c.key] ?? '');
      sheet.addRow(row);
    });

    // Auto-filter
    sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}.xlsx`);
  }

  exportCsv(data: any[], columns: { header: string; key: string }[], filename: string): void {
    const header = columns.map(c => c.header).join(',');
    const rows = data.map(item => columns.map(c => {
      const val = item[c.key] ?? '';
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
    }).join(','));
    const csv = [header, ...rows].join('\n');
    saveAs(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`);
  }

  async exportPdf(title: string, content: string): Promise<void> {
    // Use browser print as PDF fallback - works everywhere
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b}h1{color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:10px}
      table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #cbd5e1;padding:8px 12px;text-align:left;font-size:12px}
      th{background:#f1f5f9;font-weight:bold}.footer{margin-top:30px;color:#64748b;font-size:11px;text-align:center}</style></head>
      <body><h1>${title}</h1><p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>${content}
      <div class="footer">Urban Air Quality Monitoring System - Hệ thống Giám sát Chất lượng Không khí</div></body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }
}
