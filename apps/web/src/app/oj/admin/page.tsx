'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import {
  Users,
  FolderKanban,
  TrendingUp,
  Clock,
  Shield,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { GET_ADMIN_DASHBOARD_STATS, GET_ADMIN_PENDING_KYC } from '@/graphql/oj-admin';

export default function OjAdminDashboard() {
  const { data: statsData, loading: statsLoading } = useQuery(GET_ADMIN_DASHBOARD_STATS);
  const { data: kycData } = useQuery(GET_ADMIN_PENDING_KYC);

  const stats = statsData?.adminDashboardStats;
  const pendingKyc = kycData?.adminPendingKyc?.slice(0, 5) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration OJ</h1>
          <p className="text-gray-500">Tableau de bord de gestion</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Investisseurs</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalInvestors || 0}</p>
              <p className="text-xs text-green-600">{stats?.verifiedInvestors || 0} vérifiés</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Projets actifs</p>
              <p className="text-xl font-bold text-gray-900">{stats?.activeProjects || 0}</p>
              <p className="text-xs text-gray-500">sur {stats?.totalProjects || 0} projets</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fonds levés</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.totalFundsRaised || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">KYC en attente</p>
              <p className="text-xl font-bold text-gray-900">{stats?.pendingKyc || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/oj/admin/investors"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-gray-900">Gérer les investisseurs</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>

        <Link
          href="/oj/admin/kyc"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-yellow-600" />
              <span className="font-medium text-gray-900">Valider les KYC</span>
            </div>
            {stats?.pendingKyc > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {stats.pendingKyc}
              </span>
            )}
          </div>
        </Link>

        <Link
          href="/oj/admin/projects"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderKanban className="w-6 h-6 text-emerald-600" />
              <span className="font-medium text-gray-900">Gérer les projets</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>
      </div>

      {/* Pending KYC Preview */}
      {pendingKyc.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">KYC en attente de validation</h2>
            <Link
              href="/oj/admin/kyc"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingKyc.map((kyc: any) => (
              <div key={kyc.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {kyc.investor?.firstName} {kyc.investor?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{kyc.investor?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {kyc.status}
                  </span>
                  <Link
                    href={`/oj/admin/kyc/${kyc.investorId}`}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Growth */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Croissance mensuelle</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold">
            {stats?.monthlyGrowth > 0 ? '+' : ''}
            {stats?.monthlyGrowth?.toFixed(1) || 0}%
          </span>
          <span className="text-emerald-100 mb-1">de nouveaux investisseurs</span>
        </div>
      </div>
    </div>
  );
}
