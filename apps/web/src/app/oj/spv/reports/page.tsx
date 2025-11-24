'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { GET_SPV_FINANCIAL_REPORT } from '@/graphql/oj-spv';

export default function SpvReportsPage() {
  const projectId = 'project-1';
  const [period, setPeriod] = useState('month');

  const { data, loading } = useQuery(GET_SPV_FINANCIAL_REPORT, {
    variables: { projectId, period },
  });

  const report = data?.spvFinancialReport;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports financiers</h1>
          <p className="text-gray-500">Analyse détaillée de la performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Download className="w-5 h-5" />
          Exporter PDF
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          {report && (
            <span className="ml-4 text-sm text-gray-500">
              Du {formatDate(report.startDate)} au {formatDate(report.endDate)}
            </span>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-blue-600" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {formatCurrency(report.totalInvestments)}
              </p>
              <p className="text-sm text-gray-500">Investissements reçus</p>
              <p className="text-xs text-gray-400 mt-1">
                {report.investmentCount} transaction(s)
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {formatCurrency(report.totalDistributed)}
              </p>
              <p className="text-sm text-gray-500">Distributions effectuées</p>
              <p className="text-xs text-gray-400 mt-1">
                {report.distributionCount} distribution(s)
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">
                {formatCurrency(report.currentEscrow)}
              </p>
              <p className="text-sm text-gray-500">Solde séquestre</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{report.roi}%</p>
              <p className="text-sm text-gray-500">ROI attendu</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Investment Trend Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Évolution des investissements
              </h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Graphique d'évolution</p>
                  <p className="text-xs mt-1">Intégration Chart.js recommandée</p>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Répartition des fonds
              </h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-400">
                  <PieChart className="w-12 h-12 mx-auto mb-2" />
                  <p>Graphique de répartition</p>
                  <p className="text-xs mt-1">Intégration Recharts recommandée</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats Table */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Statistiques détaillées</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Métrique
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Valeur
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Évolution
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Valeur du projet
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(report.projectValue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-emerald-600">
                      +{report.roi}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Investissements moyens
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(
                        report.investmentCount > 0
                          ? report.totalInvestments / report.investmentCount
                          : 0
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">-</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Distribution moyenne
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {formatCurrency(
                        report.distributionCount > 0
                          ? report.totalDistributed / report.distributionCount
                          : 0
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">-</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Taux d'utilisation séquestre
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">
                      {report.projectValue > 0
                        ? ((report.currentEscrow / report.projectValue) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
