'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { PieChart, TrendingUp, Wallet, Calendar, ExternalLink } from 'lucide-react';
import { GET_MY_INVESTMENTS, GET_INVESTMENT_SUMMARY, GET_PORTFOLIO } from '@/graphql/oj';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  MATURED: { label: 'Arrivé à terme', color: 'bg-purple-100 text-purple-700' },
  WITHDRAWN: { label: 'Retiré', color: 'bg-gray-100 text-gray-700' },
};

export default function OjPortfolioPage() {
  const { data: investmentsData, loading: investmentsLoading } = useQuery(GET_MY_INVESTMENTS);
  const { data: summaryData } = useQuery(GET_INVESTMENT_SUMMARY);
  const { data: portfolioData } = useQuery(GET_PORTFOLIO);

  const investments = investmentsData?.myInvestments || [];
  const summary = summaryData?.investmentSummary;
  const portfolio = portfolioData?.portfolio || [];

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

  if (investmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-600" />
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
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valeur actuelle</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(summary?.currentValue || 0)}
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
              <p className="text-sm text-gray-500">Rendements reçus</p>
              <p className="text-xl font-bold text-green-600">
                +{formatCurrency(summary?.totalReturns || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Investissements actifs</p>
              <p className="text-xl font-bold text-gray-900">
                {summary?.activeInvestments || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Allocation */}
      {portfolio.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition du portefeuille</h2>
          <div className="space-y-4">
            {portfolio.map((item: any) => (
              <div key={item.projectId} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{item.projectName}</span>
                    <span className="text-sm text-gray-500">{item.allocation.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.allocation}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(item.investedAmount)}</p>
                  <p className="text-xs text-emerald-600">+{item.returnRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mes investissements</h2>
        </div>

        {investments.length === 0 ? (
          <div className="p-12 text-center">
            <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun investissement</h3>
            <p className="text-gray-500 mt-1">Commencez à investir dans nos projets</p>
            <Link
              href="/oj/projects"
              className="inline-block mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              Voir les projets
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {investments.map((investment: any) => (
              <div key={investment.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {investment.project?.imageUrl ? (
                        <img
                          src={investment.project.imageUrl}
                          alt={investment.project.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <PieChart className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/oj/projects/${investment.projectId}`}
                        className="font-semibold text-gray-900 hover:text-emerald-600"
                      >
                        {investment.project?.name || 'Projet'}
                      </Link>
                      <p className="text-sm text-gray-500">{investment.project?.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusLabels[investment.status]?.color || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {statusLabels[investment.status]?.label || investment.status}
                        </span>
                        {investment.tokenId && (
                          <span className="text-xs text-gray-400">Token: {investment.tokenId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">Investi</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(investment.amount)}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">Valeur actuelle</p>
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(investment.currentValue)}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">Rendements</p>
                      <p className="font-semibold text-green-600">
                        +{formatCurrency(investment.accruedReturns + investment.paidReturns)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Investi le {formatDate(investment.investmentDate)}</span>
                  </div>
                  {investment.maturityDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Échéance: {formatDate(investment.maturityDate)}</span>
                    </div>
                  )}
                  {investment.blockchainTxHash && (
                    <a
                      href={`https://etherscan.io/tx/${investment.blockchainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Voir sur blockchain</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
