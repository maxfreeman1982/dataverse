/**
 * Export analysis or report to PDF
 * This is a placeholder - you'll need to install a PDF library like jsPDF or react-pdf
 */

export async function exportAnalysisToPDF(analysis: any, match: any) {
  // TODO: Implement PDF export with jsPDF or similar
  // For now, we'll create a simple HTML print version

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>FootMind Engine - Analyse ${match.homeTeam.name} vs ${match.awayTeam.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #1e293b;
        }
        h1 {
          color: #0ea5e9;
          border-bottom: 3px solid #0ea5e9;
          padding-bottom: 10px;
        }
        h2 {
          color: #3b82f6;
          margin-top: 30px;
          border-bottom: 1px solid #cbd5e1;
          padding-bottom: 5px;
        }
        h3 {
          color: #64748b;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .score {
          font-size: 48px;
          font-weight: bold;
          margin: 20px 0;
        }
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .risk {
          background: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 15px;
          margin: 10px 0;
        }
        .opportunity {
          background: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 10px 0;
        }
        .pattern {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 10px 0;
        }
        .stat {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f1f5f9;
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>⚽ FootMind Engine - Analyse IA</h1>
        <p>${match.competition || ''} · ${new Date(match.date).toLocaleDateString('fr-FR')}</p>
        <div class="score">
          ${match.homeTeam.name} ${match.homeScore ?? '-'} : ${match.awayScore ?? '-'} ${match.awayTeam.name}
        </div>
        <p>Type: ${analysis.analysisType} · ${new Date(analysis.createdAt).toLocaleString('fr-FR')}</p>
      </div>

      <div class="section">
        <h2>📋 Résumé Exécutif</h2>
        <p>${analysis.summary || 'Aucun résumé disponible'}</p>
      </div>

      ${
        analysis.risks && analysis.risks.length > 0
          ? `
      <div class="section">
        <h2>⚠️ Risques Identifiés (${analysis.risks.length})</h2>
        ${analysis.risks
          .map(
            (risk: any) => `
          <div class="risk">
            <h3>${risk.type} (Sévérité: ${risk.severity}%)</h3>
            <p>${risk.description}</p>
          </div>
        `,
          )
          .join('')}
      </div>
      `
          : ''
      }

      ${
        analysis.opportunities && analysis.opportunities.length > 0
          ? `
      <div class="section">
        <h2>🎯 Opportunités Tactiques (${analysis.opportunities.length})</h2>
        ${analysis.opportunities
          .map(
            (opp: any) => `
          <div class="opportunity">
            <h3>${opp.type} (Potentiel: ${opp.potential}%)</h3>
            <p>${opp.description}</p>
            ${opp.suggestedAction ? `<p><strong>Action:</strong> ${opp.suggestedAction}</p>` : ''}
          </div>
        `,
          )
          .join('')}
      </div>
      `
          : ''
      }

      ${
        analysis.patterns && analysis.patterns.length > 0
          ? `
      <div class="section">
        <h2>📊 Patterns Détectés (${analysis.patterns.length})</h2>
        ${analysis.patterns
          .map(
            (pattern: any) => `
          <div class="pattern">
            <h3>${pattern.name} (${pattern.type})</h3>
            <p>${pattern.description}</p>
            <div class="stat">
              <span>Efficacité:</span>
              <strong>${pattern.effectiveness}%</strong>
            </div>
            <div class="stat">
              <span>Fréquence:</span>
              <strong>${pattern.frequency}</strong>
            </div>
            <div class="stat">
              <span>Taux de réussite:</span>
              <strong>${pattern.successRate}%</strong>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
      `
          : ''
      }

      ${
        analysis.recommendations
          ? `
      <div class="section">
        <h2>💡 Recommandations Coaching</h2>
        <p style="white-space: pre-wrap;">${analysis.recommendations}</p>
      </div>
      `
          : ''
      }

      <div class="footer">
        <p>Généré par FootMind Engine - ${new Date().toLocaleString('fr-FR')}</p>
        <p>Analyse IA avancée pour le football moderne</p>
      </div>

      <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Imprimer / Sauvegarder PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-left: 10px;">
          Fermer
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportMatchToPDF(match: any) {
  // Similar to exportAnalysisToPDF but for match details
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Match Report - ${match.homeTeam.name} vs ${match.awayTeam.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #1e293b;
        }
        h1 { color: #0ea5e9; text-align: center; }
        .score {
          font-size: 48px;
          font-weight: bold;
          text-align: center;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <h1>⚽ Match Report</h1>
      <div class="score">
        ${match.homeTeam.name} ${match.homeScore ?? '-'} : ${match.awayScore ?? '-'} ${match.awayTeam.name}
      </div>
      <p style="text-align: center;">${new Date(match.date).toLocaleString('fr-FR')}</p>

      <button onclick="window.print()" style="position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer;">
        Imprimer PDF
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
