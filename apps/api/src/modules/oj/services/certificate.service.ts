import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { Investment } from '../entities/investment.entity';
import { Investor } from '../entities/investor.entity';
import { Project } from '../entities/project.entity';

export interface CertificateData {
  certificateNumber: string;
  investorName: string;
  investorId: string;
  projectName: string;
  projectSeriesCode: string;
  spvName: string;
  investmentAmount: number;
  investmentDate: Date;
  maturityDate: Date;
  expectedReturn: number;
  tokenId?: string;
  blockchainTxHash?: string;
}

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(Investor)
    private investorRepository: Repository<Investor>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async generateInvestmentCertificate(investmentId: string): Promise<Buffer> {
    const investment = await this.investmentRepository.findOneOrFail({
      where: { id: investmentId },
      relations: ['project', 'investor'],
    });

    const certificateData: CertificateData = {
      certificateNumber: `OJ-CERT-${investment.id.slice(0, 8).toUpperCase()}`,
      investorName: `${investment.investor.firstName} ${investment.investor.lastName}`,
      investorId: investment.investor.id,
      projectName: investment.project.name,
      projectSeriesCode: investment.project.seriesCode,
      spvName: investment.project.spvName,
      investmentAmount: Number(investment.amount),
      investmentDate: investment.investmentDate,
      maturityDate: investment.maturityDate!,
      expectedReturn: Number(investment.project.expectedReturn),
      tokenId: investment.tokenId,
      blockchainTxHash: investment.blockchainTxHash,
    };

    return this.generatePDF(certificateData);
  }

  private generatePDF(data: CertificateData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background gradient effect (simulated with rectangles)
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fill('#f0fdf4');

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .stroke('#059669');

      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .stroke('#10b981');

      // Header
      doc.fontSize(32)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text('CERTIFICAT D\'INVESTISSEMENT', 0, 80, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(18)
        .fillColor('#065f46')
        .font('Helvetica')
        .text('OJ Investment Platform', 0, 120, {
          align: 'center',
          width: doc.page.width,
        });

      // Certificate number
      doc.fontSize(12)
        .fillColor('#6b7280')
        .text(`N° ${data.certificateNumber}`, 0, 150, {
          align: 'center',
          width: doc.page.width,
        });

      // Decorative line
      doc.moveTo(150, 175)
        .lineTo(doc.page.width - 150, 175)
        .lineWidth(2)
        .stroke('#10b981');

      // Main content
      const startY = 200;
      const leftCol = 100;
      const rightCol = doc.page.width / 2 + 50;

      doc.fontSize(11)
        .fillColor('#374151')
        .font('Helvetica');

      // Certificate text
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#1f2937')
        .text('Ce certificat atteste que', 0, startY, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(20)
        .fillColor('#059669')
        .text(data.investorName, 0, startY + 30, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(14)
        .fillColor('#1f2937')
        .font('Helvetica')
        .text('a réalisé un investissement dans le projet', 0, startY + 65, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(18)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text(`"${data.projectName}"`, 0, startY + 90, {
          align: 'center',
          width: doc.page.width,
        });

      doc.fontSize(12)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text(`Série: ${data.projectSeriesCode} | SPV: ${data.spvName}`, 0, startY + 115, {
          align: 'center',
          width: doc.page.width,
        });

      // Investment details box
      const boxY = startY + 150;
      doc.rect(150, boxY, doc.page.width - 300, 100)
        .lineWidth(1)
        .stroke('#d1d5db');

      doc.rect(151, boxY + 1, doc.page.width - 302, 98)
        .fill('#ffffff');

      // Details
      doc.fontSize(11)
        .fillColor('#374151')
        .font('Helvetica');

      const detailsY = boxY + 15;

      doc.text('Montant investi:', 180, detailsY);
      doc.font('Helvetica-Bold')
        .fillColor('#059669')
        .text(this.formatCurrency(data.investmentAmount), 320, detailsY);

      doc.font('Helvetica')
        .fillColor('#374151')
        .text('Rendement attendu:', 180, detailsY + 20);
      doc.font('Helvetica-Bold')
        .fillColor('#059669')
        .text(`${data.expectedReturn}% annuel`, 320, detailsY + 20);

      doc.font('Helvetica')
        .fillColor('#374151')
        .text('Date d\'investissement:', 450, detailsY);
      doc.text(this.formatDate(data.investmentDate), 590, detailsY);

      doc.text('Date d\'échéance:', 450, detailsY + 20);
      doc.text(this.formatDate(data.maturityDate), 590, detailsY + 20);

      if (data.tokenId) {
        doc.font('Helvetica')
          .fillColor('#6b7280')
          .fontSize(9)
          .text(`Token ID: ${data.tokenId}`, 180, detailsY + 55);
      }

      if (data.blockchainTxHash) {
        doc.text(`Blockchain TX: ${data.blockchainTxHash.slice(0, 20)}...`, 180, detailsY + 70);
      }

      // Footer
      const footerY = doc.page.height - 120;

      doc.moveTo(150, footerY)
        .lineTo(doc.page.width - 150, footerY)
        .lineWidth(1)
        .stroke('#e5e7eb');

      doc.fontSize(10)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text(
          'Ce certificat est généré électroniquement et ne nécessite pas de signature manuscrite.',
          0,
          footerY + 15,
          { align: 'center', width: doc.page.width },
        );

      doc.text(
        `Émis le ${this.formatDate(new Date())} par OJ Investment Platform`,
        0,
          footerY + 35,
        { align: 'center', width: doc.page.width },
      );

      // QR Code placeholder (would need actual QR generation library)
      doc.rect(doc.page.width - 140, footerY - 80, 80, 80)
        .lineWidth(1)
        .stroke('#d1d5db');

      doc.fontSize(8)
        .fillColor('#9ca3af')
        .text('Scanner pour vérifier', doc.page.width - 145, footerY + 5, {
          width: 90,
          align: 'center',
        });

      doc.end();
    });
  }

  async generatePortfolioReport(investorId: string): Promise<Buffer> {
    const investor = await this.investorRepository.findOneOrFail({
      where: { id: investorId },
    });

    const investments = await this.investmentRepository.find({
      where: { investorId },
      relations: ['project'],
    });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24)
        .fillColor('#059669')
        .font('Helvetica-Bold')
        .text('Rapport de Portefeuille', { align: 'center' });

      doc.fontSize(12)
        .fillColor('#6b7280')
        .font('Helvetica')
        .text(`Généré le ${this.formatDate(new Date())}`, { align: 'center' });

      doc.moveDown(2);

      // Investor info
      doc.fontSize(14)
        .fillColor('#1f2937')
        .font('Helvetica-Bold')
        .text('Informations Investisseur');

      doc.fontSize(11)
        .font('Helvetica')
        .text(`Nom: ${investor.firstName} ${investor.lastName}`);
      doc.text(`Email: ${investor.email}`);
      doc.text(`Type: ${investor.investorType}`);

      doc.moveDown(2);

      // Summary
      const totalInvested = investments.reduce((sum, i) => sum + Number(i.amount), 0);
      const totalValue = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
      const totalReturns = investments.reduce((sum, i) => sum + Number(i.accruedReturns) + Number(i.paidReturns), 0);

      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Résumé du Portefeuille');

      doc.fontSize(11)
        .font('Helvetica');

      doc.text(`Total investi: ${this.formatCurrency(totalInvested)}`);
      doc.text(`Valeur actuelle: ${this.formatCurrency(totalValue)}`);
      doc.text(`Rendements totaux: ${this.formatCurrency(totalReturns)}`);
      doc.text(`Nombre d'investissements: ${investments.length}`);

      doc.moveDown(2);

      // Investments table
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text('Détail des Investissements');

      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      const tableLeft = 50;

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#374151');

      doc.text('Projet', tableLeft, tableTop, { width: 150 });
      doc.text('Montant', tableLeft + 150, tableTop, { width: 80 });
      doc.text('Valeur', tableLeft + 230, tableTop, { width: 80 });
      doc.text('Rendement', tableLeft + 310, tableTop, { width: 80 });
      doc.text('Statut', tableLeft + 390, tableTop, { width: 80 });

      doc.moveTo(tableLeft, tableTop + 15)
        .lineTo(tableLeft + 470, tableTop + 15)
        .stroke('#e5e7eb');

      // Table rows
      let rowY = tableTop + 25;
      doc.font('Helvetica')
        .fontSize(9);

      for (const inv of investments) {
        if (rowY > doc.page.height - 100) {
          doc.addPage();
          rowY = 50;
        }

        doc.fillColor('#1f2937')
          .text(inv.project.name.slice(0, 25), tableLeft, rowY, { width: 150 });
        doc.text(this.formatCurrency(Number(inv.amount)), tableLeft + 150, rowY, { width: 80 });
        doc.text(this.formatCurrency(Number(inv.currentValue)), tableLeft + 230, rowY, { width: 80 });
        doc.fillColor('#059669')
          .text(`+${this.formatCurrency(Number(inv.accruedReturns))}`, tableLeft + 310, rowY, { width: 80 });
        doc.fillColor('#6b7280')
          .text(inv.status, tableLeft + 390, rowY, { width: 80 });

        rowY += 20;
      }

      // Footer
      doc.fontSize(8)
        .fillColor('#9ca3af')
        .text(
          'Ce document est fourni à titre informatif uniquement.',
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 },
        );

      doc.end();
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
