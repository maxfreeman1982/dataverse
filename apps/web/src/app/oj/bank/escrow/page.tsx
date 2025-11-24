'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Vault,
  Lock,
  Unlock,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FolderKanban,
  Users,
  TrendingUp,
} from 'lucide-react';
import { GET_BANK_ESCROW_ACCOUNTS, BANK_RELEASE_ESCROW } from '@/graphql/oj-admin';

export default function OjBankEscrowPage() {
  const [selectedEscrow, setSelectedEscrow] = useState<any>(null);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseAmount, setReleaseAmount] = useState('');
  const [releaseReason, setReleaseReason] = useState('');

  const { data, loading, refetch } = useQuery(GET_BANK_ESCROW_ACCOUNTS);

  const [releaseEscrow, { loading: releasing }] = useMutation(BANK_RELEASE_ESCROW, {
    onCompleted: () => {
      setShowReleaseModal(false);
      setReleaseAmount('');
      setReleaseReason('');
      setSelectedEscrow(null);
      refetch();
    },
  });

  const escrowAccounts = data?.bankEscrowAccounts || [];

  const handleRelease = () => {
    if (selectedEscrow && releaseAmount && releaseReason) {
      releaseEscrow({
        variables: {
          escrowId: selectedEscrow.id,
          amount: parseFloat(releaseAmount),
          reason: releaseReason,
        },
      });
    }
  };

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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      ACTIVE: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Lock, label: 'Actif' },
      RELEASED: { bg: 'bg-green-100', text: 'text-green-700', icon: Unlock, label: 'Libéré' },
      PARTIAL: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle, label: 'Partiel' },
    };
    return badges[status] || badges.ACTIVE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Calculate totals
  const totalEscrow = escrowAccounts.reduce((acc: number, e: any) => acc + (e.balance || 0), 0);
  const activeCount = escrowAccounts.filter((e: any) => e.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion du séquestre</h1>
        <p className="text-gray-500">
          {escrowAccounts.length} compte(s) séquestre - {formatCurrency(totalEscrow)} au total
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Vault className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total en séquestre</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalEscrow)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Comptes actifs</p>
              <p className="text-xl font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Projets associés</p>
              <p className="text-xl font-bold text-gray-900">{escrowAccounts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {escrowAccounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Vault className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun compte séquestre</h3>
          <p className="text-gray-500 mt-1">Les comptes séquestre apparaîtront ici</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Escrow List */}
          <div className="space-y-4">
            {escrowAccounts.map((escrow: any) => {
              const statusBadge = getStatusBadge(escrow.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={escrow.id}
                  className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                    selectedEscrow?.id === escrow.id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEscrow(escrow)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Vault className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{escrow.project?.name}</p>
                        <p className="text-sm text-gray-500">{escrow.project?.spvName}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Solde séquestre</p>
                      <p className="font-bold text-blue-600">{formatCurrency(escrow.balance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Objectif</p>
                      <p className="font-medium">{formatCurrency(escrow.targetAmount || 0)}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((escrow.balance || 0) / (escrow.targetAmount || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Escrow Detail */}
          {selectedEscrow ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails du séquestre
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Projet</p>
                  <p className="font-medium text-lg">{selectedEscrow.project?.name}</p>
                  <p className="text-sm text-gray-500">{selectedEscrow.project?.spvName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Solde actuel</p>
                    <p className="font-bold text-xl text-blue-600">
                      {formatCurrency(selectedEscrow.balance || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant cible</p>
                    <p className="font-bold text-xl">
                      {formatCurrency(selectedEscrow.targetAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Déjà libéré</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(selectedEscrow.releasedAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Investisseurs</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{selectedEscrow.investorsCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">{formatDate(selectedEscrow.createdAt)}</p>
                </div>

                {/* Release History */}
                {selectedEscrow.releases?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Historique des libérations</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedEscrow.releases.map((release: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                        >
                          <div>
                            <p className="font-medium text-green-600">
                              {formatCurrency(release.amount)}
                            </p>
                            <p className="text-xs text-gray-500">{release.reason}</p>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(release.date)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowReleaseModal(true)}
                    disabled={selectedEscrow.balance <= 0}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-5 h-5" />
                    Libérer des fonds
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Sélectionnez un compte séquestre pour voir les détails
              </p>
            </div>
          )}
        </div>
      )}

      {/* Release Modal */}
      {showReleaseModal && selectedEscrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Libérer des fonds</h2>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Solde disponible: <strong>{formatCurrency(selectedEscrow.balance)}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant à libérer (EUR)
                </label>
                <input
                  type="number"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value)}
                  max={selectedEscrow.balance}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison de la libération
                </label>
                <textarea
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Milestone atteint, paiement prestataire..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReleaseModal(false);
                  setReleaseAmount('');
                  setReleaseReason('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRelease}
                disabled={
                  releasing ||
                  !releaseAmount ||
                  !releaseReason ||
                  parseFloat(releaseAmount) > selectedEscrow.balance
                }
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {releasing && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
