'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { GET_ADMIN_FINANCIAL_REPORT } from '@/graphql/oj-admin';

export default function OjAdminReportsPage() {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('financial');

  const { data, loading } = useQuery(GET_ADMIN_FINANCIAL_REPORT, {
    variables: { period },
  });

  const report = data?.adminFinancialReport;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500">Analyse financière et statistiques</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
          <Download className="w-5 h-5" />
          Exporter PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="financial">Rapport financier</option>
              <option value="investors">Rapport investisseurs</option>
              <option value="projects">Rapport projets</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm ${
                (report?.depositsGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(report?.depositsGrowth || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatPercent(report?.depositsGrowth || 0)}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatCurrency(report?.totalDeposits || 0)}
          </p>
          <p className="text-sm text-gray-500">Dépôts totaux</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm ${
                (report?.withdrawalsGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(report?.withdrawalsGrowth || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatPercent(report?.withdrawalsGrowth || 0)}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatCurrency(report?.totalWithdrawals || 0)}
          </p>
          <p className="text-sm text-gray-500">Retraits totaux</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm ${
                (report?.investorsGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(report?.investorsGrowth || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatPercent(report?.investorsGrowth || 0)}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {report?.newInvestors || 0}
          </p>
          <p className="text-sm text-gray-500">Nouveaux investisseurs</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm ${
                (report?.investmentsGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {(report?.investmentsGrowth || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatPercent(report?.investmentsGrowth || 0)}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatCurrency(report?.totalInvestments || 0)}
          </p>
          <p className="text-sm text-gray-500">Investissements totaux</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution des transactions
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique des transactions</p>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition par projet
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-2" />
              <p>Graphique de répartition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Statistiques détaillées
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Métrique
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Période actuelle
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Période précédente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Variation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Volume de dépôts
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatCurrency(report?.totalDeposits || 0)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {formatCurrency(report?.previousDeposits || 0)}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span
                    className={
                      (report?.depositsGrowth || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercent(report?.depositsGrowth || 0)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Volume de retraits
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatCurrency(report?.totalWithdrawals || 0)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {formatCurrency(report?.previousWithdrawals || 0)}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span
                    className={
                      (report?.withdrawalsGrowth || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercent(report?.withdrawalsGrowth || 0)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Nouveaux investisseurs
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {report?.newInvestors || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {report?.previousNewInvestors || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span
                    className={
                      (report?.investorsGrowth || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercent(report?.investorsGrowth || 0)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  Volume d'investissements
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatCurrency(report?.totalInvestments || 0)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {formatCurrency(report?.previousInvestments || 0)}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span
                    className={
                      (report?.investmentsGrowth || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercent(report?.investmentsGrowth || 0)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  KYC validés
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {report?.kycValidated || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {report?.previousKycValidated || 0}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <span
                    className={
                      (report?.kycGrowth || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatPercent(report?.kycGrowth || 0)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
