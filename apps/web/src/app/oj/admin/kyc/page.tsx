'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  User,
  FileText,
  Camera,
} from 'lucide-react';
import {
  GET_ADMIN_PENDING_KYC,
  ADMIN_APPROVE_KYC,
  ADMIN_REJECT_KYC,
} from '@/graphql/oj-admin';

export default function OjAdminKycPage() {
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, loading, refetch } = useQuery(GET_ADMIN_PENDING_KYC);

  const [approveKyc, { loading: approving }] = useMutation(ADMIN_APPROVE_KYC, {
    onCompleted: () => {
      setSelectedKyc(null);
      refetch();
    },
  });

  const [rejectKyc, { loading: rejecting }] = useMutation(ADMIN_REJECT_KYC, {
    onCompleted: () => {
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedKyc(null);
      refetch();
    },
  });

  const pendingKyc = data?.adminPendingKyc || [];

  const handleApprove = (investorId: string) => {
    approveKyc({ variables: { investorId, level: 'STANDARD' } });
  };

  const handleReject = () => {
    if (selectedKyc && rejectReason) {
      rejectKyc({
        variables: { investorId: selectedKyc.investor.id, reason: rejectReason },
      });
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validation KYC</h1>
        <p className="text-gray-500">
          {pendingKyc.length} vérification(s) en attente
        </p>
      </div>

      {pendingKyc.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucune vérification en attente</h3>
          <p className="text-gray-500 mt-1">Toutes les demandes KYC ont été traitées</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KYC List */}
          <div className="space-y-4">
            {pendingKyc.map((kyc: any) => (
              <div
                key={kyc.id}
                className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                  selectedKyc?.id === kyc.id
                    ? 'border-emerald-500 ring-2 ring-emerald-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedKyc(kyc)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {kyc.investor?.firstName} {kyc.investor?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{kyc.investor?.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    {kyc.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {kyc.documentType || 'Document'}
                  </span>
                  <span>{formatDate(kyc.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* KYC Detail */}
          {selectedKyc ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la vérification</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Investisseur</p>
                  <p className="font-medium">
                    {selectedKyc.investor?.firstName} {selectedKyc.investor?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedKyc.investor?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type de document</p>
                    <p className="font-medium">{selectedKyc.documentType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Numéro</p>
                    <p className="font-medium">{selectedKyc.documentNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pays</p>
                    <p className="font-medium">{selectedKyc.documentCountry || 'N/A'}</p>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Documents</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedKyc.documentFrontUrl && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {selectedKyc.selfieUrl && (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(selectedKyc.investor.id)}
                    disabled={approving}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {approving ? (
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
              <p className="text-gray-500">
                Sélectionnez une vérification pour voir les détails
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rejeter la vérification</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison du rejet
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
                disabled={rejecting || !rejectReason}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {rejecting && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
