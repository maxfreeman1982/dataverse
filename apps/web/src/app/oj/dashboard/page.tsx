'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  FolderKanban,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Building2,
  Percent,
} from 'lucide-react';
import { GET_ME, GET_INVESTMENT_SUMMARY, GET_ACTIVE_PROJECTS, GET_TRANSACTIONS } from '@/graphql/oj';

export default function OjDashboardPage() {
  const { data: meData, loading: meLoading } = useQuery(GET_ME);
  const { data: summaryData, loading: summaryLoading } = useQuery(GET_INVESTMENT_SUMMARY);
  const { data: projectsData, loading: projectsLoading } = useQuery(GET_ACTIVE_PROJECTS);
  const { data: transactionsData, loading: transactionsLoading } = useQuery(GET_TRANSACTIONS, {
    variables: { limit: 5 },
  });

  const investor = meData?.me;
  const summary = summaryData?.investmentSummary;
  const projects = projectsData?.activeOjProjects?.slice(0, 3) || [];
  const transactions = transactionsData?.transactionHistory?.slice(0, 5) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (meLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Bonjour, {investor?.firstName || 'Investisseur'} !
        </h1>
        <p className="text-emerald-100 mt-1">
          Bienvenue sur votre tableau de bord OJ Investment
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Solde disponible</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(investor?.wallet?.balance || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total investi</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(summary?.totalInvested || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rendements totaux</p>
              <p className="text-xl font-bold text-green-600">
                +{formatCurrency(summary?.totalReturns || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rendement moyen</p>
              <p className="text-xl font-bold text-gray-900">
                {(summary?.averageReturn || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Projets actifs</h2>
            <Link
              href="/oj/projects"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {projectsLoading ? (
              <div className="text-center py-4 text-gray-500">Chargement...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Aucun projet actif</div>
            ) : (
              projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/oj/projects/${project.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-emerald-600">{project.expectedReturn}%</p>
                    <p className="text-xs text-gray-500">{project.durationMonths} mois</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Transactions récentes</h2>
            <Link
              href="/oj/wallet"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {transactionsLoading ? (
              <div className="text-center py-4 text-gray-500">Chargement...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">Aucune transaction</div>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center gap-4 py-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT'
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT' ? (
                      <ArrowDownRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div
                    className={`font-medium ${
                      tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT'
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* KYC Alert */}
      {investor?.kycVerification?.status !== 'APPROVED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Vérification d'identité requise</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Pour investir, vous devez compléter la vérification KYC de votre compte.
              </p>
              <Link
                href="/oj/kyc"
                className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900 mt-2"
              >
                Compléter ma vérification <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
