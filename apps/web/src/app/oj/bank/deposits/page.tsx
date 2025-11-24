'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowDownLeft, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { GET_BANK_PENDING_DEPOSITS, BANK_VALIDATE_DEPOSIT } from '@/graphql/oj-admin';

export default function OjBankDepositsPage() {
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [bankReference, setBankReference] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, loading, refetch } = useQuery(GET_BANK_PENDING_DEPOSITS);

  const [validateDeposit, { loading: validating }] = useMutation(BANK_VALIDATE_DEPOSIT, {
    onCompleted: () => {
      setSelectedTx(null);
      setBankReference('');
      setRejectReason('');
      setShowRejectModal(false);
      refetch();
    },
  });

  const pendingDeposits = data?.bankPendingDeposits || [];

  const handleApprove = () => {
    if (selectedTx) {
      validateDeposit({
        variables: {
          transactionId: selectedTx.id,
          approve: true,
          bankReference: bankReference || undefined,
        },
      });
    }
  };

  const handleReject = () => {
    if (selectedTx && rejectReason) {
      validateDeposit({
        variables: {
          transactionId: selectedTx.id,
          approve: false,
          reason: rejectReason,
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
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-2xl font-bold text-gray-900">Validation des dépôts</h1>
        <p className="text-gray-500">{pendingDeposits.length} dépôt(s) en attente de validation</p>
      </div>

      {pendingDeposits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ArrowDownLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun dépôt en attente</h3>
          <p className="text-gray-500 mt-1">Tous les dépôts ont été traités</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposits List */}
          <div className="space-y-4">
            {pendingDeposits.map((tx: any) => (
              <div
                key={tx.id}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                  selectedTx?.id === tx.id
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTx(tx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.reference}</p>
                      <p className="text-sm text-gray-500">{tx.paymentMethod}</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">+{formatCurrency(tx.amount)}</p>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  {formatDate(tx.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Transaction Detail */}
          {selectedTx ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails du dépôt</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Référence</p>
                    <p className="font-medium">{selectedTx.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant</p>
                    <p className="font-bold text-green-600">{formatCurrency(selectedTx.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Méthode</p>
                    <p className="font-medium">{selectedTx.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(selectedTx.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Wallet ID</p>
                  <p className="font-mono text-sm">{selectedTx.wallet?.id}</p>
                </div>

                {selectedTx.description && (
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{selectedTx.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Référence bancaire (optionnel)
                  </label>
                  <input
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Référence de la transaction bancaire"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleApprove}
                    disabled={validating}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {validating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approuver
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 border border-red-500 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Sélectionnez un dépôt pour voir les détails</p>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejeter le dépôt</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison du rejet
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Expliquez la raison du rejet..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={validating || !rejectReason}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {validating && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
