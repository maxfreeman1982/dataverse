'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Users,
  Search,
  Filter,
  Eye,
  Shield,
  Wallet,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GET_ADMIN_ALL_INVESTORS } from '@/graphql/oj-admin';
import Link from 'next/link';

export default function OjAdminInvestorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, loading } = useQuery(GET_ADMIN_ALL_INVESTORS, {
    variables: { page, limit },
  });

  const investors = data?.adminAllInvestors?.investors || [];
  const total = data?.adminAllInvestors?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const filteredInvestors = investors.filter((investor: any) => {
    const matchesSearch =
      investor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || investor.kycStatus === statusFilter;

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
    });
  };

  const getKycBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      VERIFIED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Vérifié' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté' },
      NOT_STARTED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Non démarré' },
    };
    return badges[status] || badges.NOT_STARTED;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investisseurs</h1>
        <p className="text-gray-500">{total} investisseur(s) inscrits</p>
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
              placeholder="Rechercher un investisseur..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="ALL">Tous les statuts KYC</option>
              <option value="VERIFIED">Vérifié</option>
              <option value="PENDING">En attente</option>
              <option value="REJECTED">Rejeté</option>
              <option value="NOT_STARTED">Non démarré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investors Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut KYC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investissements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun investisseur trouvé
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((investor: any) => {
                  const kycBadge = getKycBadge(investor.kycStatus);
                  return (
                    <tr key={investor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {investor.firstName} {investor.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{investor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${kycBadge.bg} ${kycBadge.text}`}
                        >
                          <Shield className="w-3 h-3" />
                          {kycBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {formatCurrency(investor.wallet?.balance || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span>{investor.investmentsCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(investor.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/oj/admin/investors/${investor.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Link>
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
