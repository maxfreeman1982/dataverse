'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import {
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { GET_BANK_SUMMARY, GET_BANK_PENDING_DEPOSITS, GET_BANK_PENDING_WITHDRAWALS } from '@/graphql/oj-admin';

export default function OjBankDashboard() {
  const { data: summaryData, loading } = useQuery(GET_BANK_SUMMARY);
  const { data: depositsData } = useQuery(GET_BANK_PENDING_DEPOSITS);
  const { data: withdrawalsData } = useQuery(GET_BANK_PENDING_WITHDRAWALS);

  const summary = summaryData?.bankSummary;
  const pendingDeposits = depositsData?.bankPendingDeposits?.slice(0, 5) || [];
  const pendingWithdrawals = withdrawalsData?.bankPendingWithdrawals?.slice(0, 5) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interface Banque</h1>
        <p className="text-gray-500">Validation des transactions et gestion du séquestre</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dépôts en attente</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.pendingDeposits || 0)}</p>
              <p className="text-xs text-gray-500">{summary?.pendingDepositsCount || 0} transaction(s)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Retraits en attente</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(summary?.pendingWithdrawals || 0)}</p>
              <p className="text-xs text-gray-500">{summary?.pendingWithdrawalsCount || 0} transaction(s)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Traités aujourd'hui</p>
              <p className="text-xl font-bold text-gray-900">{summary?.totalProcessedToday || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Flux du jour</p>
              <p className="text-xl font-bold text-green-600">
                +{formatCurrency((summary?.todayDeposits || 0) - (summary?.todayWithdrawals || 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/oj/bank/deposits"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowDownLeft className="w-6 h-6 text-green-600" />
              <div>
                <span className="font-medium text-gray-900">Valider les dépôts</span>
                {summary?.pendingDepositsCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {summary.pendingDepositsCount}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>

        <Link
          href="/oj/bank/withdrawals"
          className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="w-6 h-6 text-red-600" />
              <div>
                <span className="font-medium text-gray-900">Valider les retraits</span>
                {summary?.pendingWithdrawalsCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {summary.pendingWithdrawalsCount}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deposits */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Dépôts en attente</h2>
            <Link
              href="/oj/bank/deposits"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingDeposits.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun dépôt en attente
              </div>
            ) : (
              pendingDeposits.map((tx: any) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.reference}</p>
                      <p className="text-xs text-gray-500">{tx.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+{formatCurrency(tx.amount)}</p>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      En attente
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Retraits en attente</h2>
            <Link
              href="/oj/bank/withdrawals"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingWithdrawals.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucun retrait en attente
              </div>
            ) : (
              pendingWithdrawals.map((tx: any) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.reference}</p>
                      <p className="text-xs text-gray-500">{tx.wallet?.bankAccountIban?.slice(0, 15)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(tx.amount)}</p>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      En attente
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
