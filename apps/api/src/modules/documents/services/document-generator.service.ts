import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export interface InvestmentCertificateData {
  investorName: string;
  projectName: string;
  amount: number;
  currency: string;
  investmentDate: Date;
  certificateNumber: string;
  expectedReturn: number;
  duration: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  investorName: string;
  investorEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    siret: string;
  };
}

export interface ContractData {
  contractNumber: string;
  contractDate: Date;
  investorName: string;
  projectName: string;
  amount: number;
  duration: string;
  returnRate: number;
  terms: string[];
}

@Injectable()
export class DocumentGeneratorService {
  private readonly logger = new Logger(DocumentGeneratorService.name);
  private readonly outputDir = path.join(process.cwd(), 'generated-documents');

  constructor() {
    this.ensureOutputDirectory();
  }

  private async ensureOutputDirectory(): Promise<void> {
    try {
      await mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create output directory:', error);
    }
  }

  /**
   * Generate Investment Certificate PDF
   */
  async generateInvestmentCertificate(
    data: InvestmentCertificateData,
  ): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `certificate-${data.certificateNumber}.pdf`;
    const filepath = path.join(this.outputDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#0066CC')
      .text('CERTIFICAT D\'INVESTISSEMENT', { align: 'center' });

    doc.moveDown(2);

    // Certificate border/decoration
    doc
      .strokeColor('#0066CC')
      .lineWidth(2)
      .rect(50, 120, doc.page.width - 100, doc.page.height - 240)
      .stroke();

    doc.moveDown(1);

    // Body text
    doc
      .fontSize(14)
      .fillColor('#333333')
      .font('Helvetica')
      .text(
        `Ce certificat atteste que ${data.investorName} a effectué un investissement de:`,
        { align: 'center' },
      );

    doc.moveDown(1);

    // Amount (highlighted)
    doc
      .fontSize(32)
      .font('Helvetica-Bold')
      .fillColor('#00CC66')
      .text(`${data.currency} ${data.amount.toLocaleString('fr-FR')}`, {
        align: 'center',
      });

    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor('#333333')
      .font('Helvetica')
      .text(`dans le projet: ${data.projectName}`, { align: 'center' });

    doc.moveDown(2);

    // Details
    const detailsY = doc.y;
    doc
      .fontSize(12)
      .text(`Numéro de certificat: ${data.certificateNumber}`, 100, detailsY)
      .text(
        `Date d'investissement: ${data.investmentDate.toLocaleDateString('fr-FR')}`,
        100,
      )
      .text(`Rendement attendu: ${data.expectedReturn}%`, 100)
      .text(`Durée: ${data.duration}`, 100);

    // Footer
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(
        'OJ Investment Platform - Investissement responsable et transparent',
        50,
        doc.page.height - 100,
        { align: 'center' },
      );

    doc
      .fontSize(8)
      .text(
        `Document généré le ${new Date().toLocaleDateString('fr-FR')}`,
        50,
        doc.page.height - 80,
        { align: 'center' },
      );

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  /**
   * Generate Invoice PDF
   */
  async generateInvoice(data: InvoiceData): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `invoice-${data.invoiceNumber}.pdf`;
    const filepath = path.join(this.outputDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Company header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#0066CC')
      .text(data.companyInfo.name, 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text(data.companyInfo.address, 50)
      .text(data.companyInfo.phone, 50)
      .text(data.companyInfo.email, 50)
      .text(`SIRET: ${data.companyInfo.siret}`, 50);

    // Invoice title
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#0066CC')
      .text('FACTURE', 400, 50);

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#333333')
      .text(`N° ${data.invoiceNumber}`, 400, 85)
      .text(
        `Date: ${data.invoiceDate.toLocaleDateString('fr-FR')}`,
        400,
        100,
      )
      .text(
        `Échéance: ${data.dueDate.toLocaleDateString('fr-FR')}`,
        400,
        115,
      );

    doc.moveDown(3);

    // Client info
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Facturé à:', 50, 180);

    doc
      .font('Helvetica')
      .text(data.investorName, 50, 195)
      .text(data.investorEmail, 50, 210);

    // Table header
    const tableTop = 260;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#0066CC')
      .text('Description', 50, tableTop)
      .text('Qté', 320, tableTop, { width: 50, align: 'center' })
      .text('Prix unitaire', 380, tableTop, { width: 80, align: 'right' })
      .text('Total', 470, tableTop, { width: 80, align: 'right' });

    // Draw line
    doc
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Table rows
    let yPosition = tableTop + 25;
    doc.fillColor('#333333').font('Helvetica');

    data.items.forEach((item) => {
      doc
        .text(item.description, 50, yPosition, { width: 260 })
        .text(item.quantity.toString(), 320, yPosition, {
          width: 50,
          align: 'center',
        })
        .text(`€${item.unitPrice.toFixed(2)}`, 380, yPosition, {
          width: 80,
          align: 'right',
        })
        .text(`€${item.total.toFixed(2)}`, 470, yPosition, {
          width: 80,
          align: 'right',
        });
      yPosition += 30;
    });

    // Totals
    yPosition += 20;
    doc
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .moveTo(350, yPosition)
      .lineTo(550, yPosition)
      .stroke();

    yPosition += 15;

    doc
      .fontSize(11)
      .text('Sous-total:', 350, yPosition)
      .text(`€${data.subtotal.toFixed(2)}`, 470, yPosition, {
        width: 80,
        align: 'right',
      });

    yPosition += 20;
    doc
      .text('TVA:', 350, yPosition)
      .text(`€${data.tax.toFixed(2)}`, 470, yPosition, {
        width: 80,
        align: 'right',
      });

    yPosition += 25;
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#00CC66')
      .text('TOTAL:', 350, yPosition)
      .text(`€${data.total.toFixed(2)}`, 470, yPosition, {
        width: 80,
        align: 'right',
      });

    // Footer
    doc
      .fontSize(9)
      .fillColor('#666666')
      .font('Helvetica')
      .text(
        'Merci pour votre confiance. Paiement par virement bancaire.',
        50,
        doc.page.height - 100,
        { align: 'center' },
      );

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  /**
   * Generate Investment Contract PDF
   */
  async generateContract(data: ContractData): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `contract-${data.contractNumber}.pdf`;
    const filepath = path.join(this.outputDir, filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Title
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#0066CC')
      .text('CONTRAT D\'INVESTISSEMENT', { align: 'center' });

    doc.moveDown(2);

    // Contract details
    doc
      .fontSize(12)
      .fillColor('#333333')
      .font('Helvetica')
      .text(`Contrat N°: ${data.contractNumber}`)
      .text(
        `Date: ${data.contractDate.toLocaleDateString('fr-FR')}`,
      )
      .moveDown();

    // Parties
    doc
      .font('Helvetica-Bold')
      .text('ENTRE:')
      .font('Helvetica')
      .text('OJ Investment Platform, ci-après dénommée "la Plateforme"')
      .moveDown()
      .font('Helvetica-Bold')
      .text('ET:')
      .font('Helvetica')
      .text(`${data.investorName}, ci-après dénommé "l'Investisseur"`)
      .moveDown(2);

    // Article 1
    doc
      .font('Helvetica-Bold')
      .text('Article 1 - Objet du contrat')
      .font('Helvetica')
      .text(
        `L'Investisseur s'engage à investir la somme de €${data.amount.toLocaleString('fr-FR')} dans le projet "${data.projectName}".`,
      )
      .moveDown();

    // Article 2
    doc
      .font('Helvetica-Bold')
      .text('Article 2 - Durée et rendement')
      .font('Helvetica')
      .text(`Durée de l'investissement: ${data.duration}`)
      .text(`Taux de rendement attendu: ${data.returnRate}%`)
      .moveDown();

    // Terms
    doc
      .font('Helvetica-Bold')
      .text('Article 3 - Conditions générales')
      .font('Helvetica');

    data.terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`);
    });

    doc.moveDown(2);

    // Signatures
    const signaturesY = doc.page.height - 200;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Fait en deux exemplaires', 50, signaturesY, {
        align: 'center',
      })
      .text(
        `À Paris, le ${data.contractDate.toLocaleDateString('fr-FR')}`,
        50,
        signaturesY + 20,
        { align: 'center' },
      );

    doc.moveDown(2);

    // Signature boxes
    doc
      .fontSize(11)
      .text('La Plateforme', 100, signaturesY + 60)
      .text('L\'Investisseur', 350, signaturesY + 60);

    doc
      .strokeColor('#CCCCCC')
      .lineWidth(1)
      .moveTo(80, signaturesY + 110)
      .lineTo(220, signaturesY + 110)
      .stroke()
      .moveTo(330, signaturesY + 110)
      .lineTo(470, signaturesY + 110)
      .stroke();

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  /**
   * Delete a generated document
   */
  async deleteDocument(filepath: string): Promise<void> {
    try {
      await promisify(fs.unlink)(filepath);
      this.logger.log(`Document deleted: ${filepath}`);
    } catch (error) {
      this.logger.error(`Failed to delete document: ${filepath}`, error);
      throw new Error('Failed to delete document');
    }
  }
}
