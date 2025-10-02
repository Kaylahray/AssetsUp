import { Injectable, NotFoundException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as Papa from 'papaparse';
import { Readable } from 'stream';

@Injectable()
export class ReportingService {
  private async getReportData(jurisdiction: string): Promise<any[]> {
    const mockData = {
      USA: [
        { id: 'TX-123', amount: 5000, currency: 'USD', status: 'approved' },
        { id: 'NY-456', amount: 12000, currency: 'USD', status: 'pending' },
      ],
      EU: [
        { id: 'DE-789', amount: 8000, currency: 'EUR', status: 'approved' },
        { id: 'FR-101', amount: 7500, currency: 'EUR', status: 'declined' },
      ],
    };

    const data = mockData[jurisdiction.toUpperCase()];
    if (!data) {
      throw new NotFoundException(
        `No data found for jurisdiction: ${jurisdiction}`,
      );
    }
    return data;
  }

  async generateReport(
    jurisdiction: string,
    format: 'csv' | 'pdf',
  ): Promise<Readable> {
    const data = await this.getReportData(jurisdiction);

    if (format === 'csv') {
      return this.generateCsv(data);
    } else {
      return this.generatePdf(data, jurisdiction);
    }
  }

  private generateCsv(data: any[]): Readable {
    const csvString = Papa.unparse(data);
    const stream = new Readable();
    stream.push(csvString);
    stream.push(null);
    return stream;
  }

  private generatePdf(data: any[], jurisdiction: string): Readable {
    const doc = new PDFDocument({ margin: 50 });

    doc.fontSize(20).text(`Regulatory Report: ${jurisdiction.toUpperCase()}`, {
      align: 'center',
    });
    doc.moveDown();

    const tableTop = 150;
    const itemX = 50;
    const amountX = 250;
    const currencyX = 350;
    const statusX = 450;

    doc
      .fontSize(12)
      .text('Transaction ID', itemX, tableTop)
      .text('Amount', amountX, tableTop)
      .text('Currency', currencyX, tableTop)
      .text('Status', statusX, tableTop);

    let i = 0;
    for (const item of data) {
      const y = tableTop + 25 + i * 25;
      doc
        .fontSize(10)
        .text(item.id, itemX, y)
        .text(item.amount.toString(), amountX, y)
        .text(item.currency, currencyX, y)
        .text(item.status, statusX, y);
      i++;
    }

    doc.end();
    return doc;
  }
}
