import { Injectable } from '@nestjs/common';
import { Parser } from 'json2csv';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportGeneratorService {
  /**
   * Converts a JSON array to a CSV buffer.
   * @param data The array of data to convert.
   */
  async generateCsv(data: any[]): Promise<Buffer> {
    if (!data || data.length === 0) {
      return Buffer.from('');
    }
    const parser = new Parser();
    const csv = parser.parse(data);
    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Converts a JSON array to a PDF buffer.
   * @param title The title of the report.
   * @param data The array of data to convert.
   */
  async generatePdf(title: string, data: any[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // --- PDF Content ---
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();

      if (!data || data.length === 0) {
        doc.fontSize(12).text('No data available for the selected criteria.');
        doc.end();
        return;
      }

      // Table Header
      const headers = Object.keys(data[0]);
      const colWidth = (doc.page.width - 60) / headers.length;
      let currentY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, 30 + i * colWidth, currentY, { width: colWidth, align: 'left' });
      });
      doc.moveDown();
      
      // Table Rows
      doc.font('Helvetica');
      data.forEach(row => {
        currentY = doc.y;
        headers.forEach((header, i) => {
            doc.text(String(row[header]), 30 + i * colWidth, currentY, { width: colWidth, align: 'left' });
        });
        doc.moveDown();
      });
      // --- End of PDF Content ---

      doc.end();
    });
  }
}