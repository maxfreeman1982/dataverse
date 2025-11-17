'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
} from 'lucide-react';

/**
 * Import/Export Page
 * Handles CSV imports and JSON/Excel exports
 */
export default function ImportExportPage() {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle CSV file upload for tracking data
  const handleTrackingDataUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMatchId) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/football/matches/${selectedMatchId}/tracking/import`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({ error: 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle CSV file upload for match events
  const handleEventsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMatchId) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/football/matches/${selectedMatchId}/events/import`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({ error: 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  // Download analysis as JSON
  const handleAnalysisJSONDownload = async () => {
    if (!selectedAnalysisId) return;

    setIsDownloading(true);
    try {
      window.location.href = `/api/football/analyses/${selectedAnalysisId}/export/json`;
    } catch (error) {
      alert('Download failed');
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  // Download match statistics as Excel
  const handleMatchExcelDownload = async () => {
    if (!selectedMatchId) return;

    setIsDownloading(true);
    try {
      window.location.href = `/api/football/matches/${selectedMatchId}/export/excel`;
    } catch (error) {
      alert('Download failed');
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  // Download team statistics as Excel
  const handleTeamExcelDownload = async () => {
    if (!selectedTeamId) return;

    setIsDownloading(true);
    try {
      window.location.href = `/api/football/teams/${selectedTeamId}/export/excel`;
    } catch (error) {
      alert('Download failed');
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/football"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            📁 Import/Export
          </h1>
          <p className="text-slate-400 text-lg">
            Importez des données CSV et exportez vos analyses en JSON/Excel
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-blue-300 mb-1">Formats supportés :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Import : CSV (tracking data, match events)</li>
              <li>Export : JSON (analyses), Excel (statistiques match/équipe)</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Import CSV</h2>
                <p className="text-slate-400 text-sm">Charger des données de tracking ou d'événements</p>
              </div>
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  uploadResult.error
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {uploadResult.error ? (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                  <div className="text-sm">
                    {uploadResult.error ? (
                      <p className="text-red-300">{uploadResult.error}</p>
                    ) : (
                      <>
                        <p className="text-green-300 font-semibold mb-1">
                          ✅ {uploadResult.data?.imported || 0} lignes importées
                        </p>
                        {uploadResult.data?.errors && uploadResult.data.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-orange-300 font-semibold">
                              ⚠️ {uploadResult.data.errors.length} erreurs :
                            </p>
                            <ul className="list-disc list-inside text-slate-400 mt-1">
                              {uploadResult.data.errors.slice(0, 5).map((err: string, idx: number) => (
                                <li key={idx} className="text-xs">
                                  {err}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Match ID Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Match ID</label>
              <input
                type="text"
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
                placeholder="Entrez l'ID du match"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Tracking Data Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Tracking Data (CSV)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleTrackingDataUpload}
                  disabled={!selectedMatchId || isUploading}
                  className="hidden"
                  id="tracking-upload"
                />
                <label
                  htmlFor="tracking-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                    !selectedMatchId || isUploading
                      ? 'border-slate-600 bg-slate-700/50 cursor-not-allowed text-slate-500'
                      : 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Sélectionner un fichier CSV
                    </>
                  )}
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Format : timestamp,frame,period,ballX,ballY,ballSpeed,playerPositions
              </p>
            </div>

            {/* Events Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Match Events (CSV)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleEventsUpload}
                  disabled={!selectedMatchId || isUploading}
                  className="hidden"
                  id="events-upload"
                />
                <label
                  htmlFor="events-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                    !selectedMatchId || isUploading
                      ? 'border-slate-600 bg-slate-700/50 cursor-not-allowed text-slate-500'
                      : 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Sélectionner un fichier CSV
                    </>
                  )}
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Format : timestamp,minute,type,team,outcome,locationX,locationY
              </p>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Export</h2>
                <p className="text-slate-400 text-sm">Télécharger vos analyses et statistiques</p>
              </div>
            </div>

            {/* Analysis JSON Export */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <FileJson className="w-4 h-4 inline mr-2" />
                Analyse Tactique (JSON)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  placeholder="ID de l'analyse"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAnalysisJSONDownload}
                  disabled={!selectedAnalysisId || isDownloading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Match Excel Export */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                Statistiques Match (Excel)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  placeholder="ID du match"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleMatchExcelDownload}
                  disabled={!selectedMatchId || isDownloading}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Comprend : Infos match, statistiques, événements, analyses
              </p>
            </div>

            {/* Team Excel Export */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                Statistiques Équipe (Excel)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  placeholder="ID de l'équipe"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTeamExcelDownload}
                  disabled={!selectedTeamId || isDownloading}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Comprend : Infos équipe, liste joueurs avec statistiques
              </p>
            </div>
          </div>
        </div>

        {/* CSV Format Examples */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">📝 Formats CSV</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">Tracking Data</h4>
              <pre className="bg-slate-900 p-3 rounded text-xs overflow-x-auto">
                {`timestamp,frame,period,ballX,ballY,ballSpeed,playerPositions
0.0,0,first-half,0,0,0,"[{...}]"
0.1,1,first-half,1.2,0.5,5.2,"[{...}]"`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">Match Events</h4>
              <pre className="bg-slate-900 p-3 rounded text-xs overflow-x-auto">
                {`timestamp,minute,type,team,outcome,locationX,locationY
60.5,1,pass,home,success,10.5,-5.2
125.3,2,shot,home,goal,42.1,2.8`}
              </pre>
            </div>
          </div>
        </div>

        {/* API Documentation Link */}
        <div className="mt-8 text-center">
          <a
            href="/api/football/import-export/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            Documentation API REST
          </a>
        </div>
      </div>
    </div>
  );
}
