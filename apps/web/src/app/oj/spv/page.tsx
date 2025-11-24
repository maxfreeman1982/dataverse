'use client';

import { useQuery } from '@apollo/client';
import {
  TrendingUp,
  Users,
  Target,
  Wallet,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { GET_SPV_DASHBOARD } from '@/graphql/oj-spv';

export default function SpvDashboardPage() {
  // TODO: Get projectId from auth/context
  const projectId = 'project-1';

  const { data, loading } = useQuery(GET_SPV_DASHBOARD, {
    variables: { projectId },
  });

  const dashboard = data?.spvDashboard;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Brouillon' },
      FUNDRAISING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Levée en cours' },
      FUNDED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Financé' },
      ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Actif' },
      COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Terminé' },
    };
    return badges[status] || badges.DRAFT;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun projet trouvé</p>
      </div>
    );
  }

  const statusBadge = getStatusBadge(dashboard.status);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboard.projectName}</h1>
            <p className="text-gray-500">{dashboard.spvName}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Date de début</p>
            <p className="font-medium">{formatDate(dashboard.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date de fin</p>
            <p className="font-medium">{formatDate(dashboard.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Durée</p>
            <p className="font-medium">{dashboard.duration} mois</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rendement attendu</p>
            <p className="font-medium text-emerald-600">{dashboard.expectedReturn}%</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {dashboard.fundingProgress.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Progression financement</p>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(dashboard.fundingProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatCurrency(dashboard.currentFunding)}
          </p>
          <p className="text-sm text-gray-500">
            Financé / {formatCurrency(dashboard.fundingGoal)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {dashboard.totalInvestors}
          </p>
          <p className="text-sm text-gray-500">Investisseurs</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatCurrency(dashboard.escrowBalance)}
          </p>
          <p className="text-sm text-gray-500">Solde séquestre</p>
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité du mois</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Investissements reçus</p>
                  <p className="text-sm text-gray-500">Ce mois</p>
                </div>
              </div>
              <p className="font-bold text-lg text-green-600">
                {formatCurrency(dashboard.monthlyInvestments)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-2">
            <a
              href="/oj/spv/milestones"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Mettre à jour un milestone</span>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="/oj/spv/documents"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Ajouter un document</span>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="/oj/spv/escrow"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Demander libération séquestre</span>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="/oj/spv/reports"
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-gray-700">Générer un rapport</span>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
