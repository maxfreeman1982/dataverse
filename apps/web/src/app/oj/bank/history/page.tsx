'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { GET_BANK_TRANSACTION_HISTORY } from '@/graphql/oj-admin';

export default function OjBankHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, loading } = useQuery(GET_BANK_TRANSACTION_HISTORY, {
    variables: { page, limit, type: typeFilter !== 'ALL' ? typeFilter : undefined },
  });

  const transactions = data?.bankTransactionHistory?.transactions || [];
  const total = data?.bankTransactionHistory?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const filteredTransactions = transactions.filter((tx: any) => {
    const matchesSearch =
      tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.wallet?.investor?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Complété' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejeté' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Annulé' },
    };
    return badges[status] || badges.PENDING;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'DEPOSIT') {
      return { icon: ArrowDownLeft, color: 'text-green-600', bg: 'bg-green-100' };
    }
    return { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100' };
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique des transactions</h1>
        <p className="text-gray-500">{total} transaction(s) au total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par référence ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les types</option>
              <option value="DEPOSIT">Dépôts</option>
              <option value="WITHDRAWAL">Retraits</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="COMPLETED">Complété</option>
              <option value="PENDING">En attente</option>
              <option value="REJECTED">Rejeté</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investisseur
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validé par
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>Aucune transaction trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx: any) => {
                  const typeStyle = getTypeIcon(tx.type);
                  const statusBadge = getStatusBadge(tx.status);
                  const StatusIcon = statusBadge.icon;
                  const TypeIcon = typeStyle.icon;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeStyle.bg}`}>
                          <TypeIcon className={`w-4 h-4 ${typeStyle.color}`} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-gray-900">{tx.reference}</p>
                        {tx.bankReference && (
                          <p className="text-xs text-gray-500">Réf: {tx.bankReference}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {tx.wallet?.investor?.firstName} {tx.wallet?.investor?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{tx.wallet?.investor?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900'
                          }`}
                        >
                          {tx.type === 'DEPOSIT' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(tx.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {tx.validatedBy || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Page {page} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
