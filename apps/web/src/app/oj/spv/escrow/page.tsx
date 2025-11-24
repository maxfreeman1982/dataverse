'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Vault, Plus, Clock, CheckCircle, XCircle, DollarSign, X } from 'lucide-react';
import { GET_SPV_ESCROW_REQUESTS, SPV_REQUEST_ESCROW_RELEASE, GET_SPV_DASHBOARD } from '@/graphql/oj-spv';

export default function SpvEscrowPage() {
  const projectId = 'project-1';
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ amount: '', reason: '', beneficiary: '' });

  const { data: dashboardData } = useQuery(GET_SPV_DASHBOARD, { variables: { projectId } });
  const { data, loading, refetch } = useQuery(GET_SPV_ESCROW_REQUESTS, { variables: { projectId } });
  const [requestRelease, { loading: requesting }] = useMutation(SPV_REQUEST_ESCROW_RELEASE, {
    onCompleted: () => {
      setShowRequestModal(false);
      setRequestForm({ amount: '', reason: '', beneficiary: '' });
      refetch();
    },
  });

  const requests = data?.spvEscrowRequests || [];
  const escrowBalance = dashboardData?.spvDashboard?.escrowBalance || 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, any> = {
      PENDING: { icon: Clock, bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      APPROVED: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-700', label: 'Approuvé' },
      REJECTED: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', label: 'Rejeté' },
    };
    return badges[status] || badges.PENDING;
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Gestion du séquestre</h1><p className="text-gray-500">Solde: {formatCurrency(escrowBalance)}</p></div>
        <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Plus className="w-5 h-5" />Demander libération</button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center"><Vault className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucune demande</p></div>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => {
            const badge = getStatusBadge(req.status);
            const Icon = badge.icon;
            return (
              <div key={req.id} className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">{formatCurrency(req.amount)}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}><Icon className="w-3 h-3 inline mr-1" />{badge.label}</span>
                </div>
                <p className="text-gray-600"><strong>Bénéficiaire:</strong> {req.beneficiary}</p>
                <p className="text-gray-600"><strong>Raison:</strong> {req.reason}</p>
              </div>
            );
          })}
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg m-4">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">Demander libération</h2><button onClick={() => setShowRequestModal(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Montant</label><input type="number" value={requestForm.amount} onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Bénéficiaire</label><input type="text" value={requestForm.beneficiary} onChange={(e) => setRequestForm({ ...requestForm, beneficiary: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">Raison</label><textarea value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRequestModal(false)} className="flex-1 px-4 py-3 border rounded-lg">Annuler</button>
              <button onClick={() => requestRelease({ variables: { projectId, amount: parseFloat(requestForm.amount), reason: requestForm.reason, beneficiary: requestForm.beneficiary }})} disabled={requesting} className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
