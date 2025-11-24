'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Users, Mail, TrendingUp, Calendar, Search, Download } from 'lucide-react';
import { GET_SPV_PROJECT_INVESTORS } from '@/graphql/oj-spv';

export default function SpvInvestorsPage() {
  const projectId = 'project-1'; // TODO: Get from auth/context
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, loading } = useQuery(GET_SPV_PROJECT_INVESTORS, {
    variables: { projectId, page, limit },
  });

  const investorsData = data?.spvProjectInvestors;
  const investments = investorsData?.investments || [];
  const total = investorsData?.total || 0;
  const totalPages = investorsData?.totalPages || 1;

  const filteredInvestments = investments.filter((inv: any) =>
    `${inv.investor.firstName} ${inv.investor.lastName} ${inv.investor.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

  const getInvestorTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      INDIVIDUAL: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Particulier' },
      PROFESSIONAL: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Professionnel' },
      INSTITUTIONAL: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Institutionnel' },
    };
    return badges[type] || badges.INDIVIDUAL;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum: number, inv: any) => sum + inv.currentValue, 0);
  const totalReturn = totalCurrentValue - totalInvested;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investisseurs</h1>
          <p className="text-gray-500">{total} investisseur(s) dans ce projet</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Download className="w-5 h-5" />
          Exporter CSV
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total investi</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
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
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCurrentValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rendement généré</p>
              <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(totalReturn)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un investisseur..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
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
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant investi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur actuelle
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun investisseur trouvé
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((inv: any) => {
                  const typeBadge = getInvestorTypeBadge(inv.investor.investorType);
                  const returnAmount = inv.currentValue - inv.amount;
                  const returnPercent = ((returnAmount / inv.amount) * 100).toFixed(2);

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {inv.investor.firstName} {inv.investor.lastName}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              {inv.investor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {inv.tokensAmount.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(inv.currentValue)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div>
                          <p
                            className={`font-semibold ${
                              returnAmount >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {returnAmount >= 0 ? '+' : ''}
                            {formatCurrency(returnAmount)}
                          </p>
                          <p
                            className={`text-xs ${
                              returnAmount >= 0 ? 'text-emerald-500' : 'text-red-500'
                            }`}
                          >
                            {returnAmount >= 0 ? '+' : ''}
                            {returnPercent}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inv.investmentDate)}
                        </div>
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
