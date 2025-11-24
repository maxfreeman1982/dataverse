'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Smartphone,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import {
  GET_ME,
  GET_WALLET_SUMMARY,
  GET_TRANSACTIONS,
  DEPOSIT,
  WITHDRAW,
  LINK_BANK_ACCOUNT,
} from '@/graphql/oj';

const paymentMethods = [
  { value: 'CARD', label: 'Carte bancaire', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire', icon: Building },
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone },
];

const transactionTypeLabels: Record<string, { label: string; color: string }> = {
  DEPOSIT: { label: 'Dépôt', color: 'text-green-600' },
  WITHDRAWAL: { label: 'Retrait', color: 'text-red-600' },
  INVESTMENT: { label: 'Investissement', color: 'text-blue-600' },
  RETURN_PAYMENT: { label: 'Rendement', color: 'text-emerald-600' },
  TRANSFER: { label: 'Transfert', color: 'text-purple-600' },
  FEE: { label: 'Frais', color: 'text-gray-600' },
  REFUND: { label: 'Remboursement', color: 'text-orange-600' },
};

export default function OjWalletPage() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'bank'>('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('CARD');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankForm, setBankForm] = useState({ iban: '', name: '', bankName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: meData } = useQuery(GET_ME);
  const { data: summaryData } = useQuery(GET_WALLET_SUMMARY);
  const { data: transactionsData, refetch: refetchTransactions } = useQuery(GET_TRANSACTIONS, {
    variables: { limit: 20 },
  });

  const [deposit, { loading: depositing }] = useMutation(DEPOSIT, {
    onCompleted: () => {
      setSuccess('Dépôt initié avec succès');
      setDepositAmount('');
      refetchTransactions();
    },
    onError: (err) => setError(err.message),
  });

  const [withdraw, { loading: withdrawing }] = useMutation(WITHDRAW, {
    onCompleted: () => {
      setSuccess('Retrait initié avec succès');
      setWithdrawAmount('');
      refetchTransactions();
    },
    onError: (err) => setError(err.message),
  });

  const [linkBank, { loading: linkingBank }] = useMutation(LINK_BANK_ACCOUNT, {
    onCompleted: () => {
      setSuccess('Compte bancaire lié avec succès');
      setBankForm({ iban: '', name: '', bankName: '' });
    },
    onError: (err) => setError(err.message),
  });

  const wallet = meData?.me?.wallet;
  const summary = summaryData?.walletSummary;
  const transactions = transactionsData?.transactionHistory || [];

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

  const handleDeposit = () => {
    setError('');
    setSuccess('');
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }
    deposit({
      variables: {
        input: {
          amount,
          paymentMethod: depositMethod,
        },
      },
    });
  };

  const handleWithdraw = () => {
    setError('');
    setSuccess('');
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }
    if (amount > (summary?.availableBalance || 0)) {
      setError('Solde insuffisant');
      return;
    }
    withdraw({
      variables: {
        input: { amount },
      },
    });
  };

  const handleLinkBank = () => {
    setError('');
    setSuccess('');
    if (!bankForm.iban || !bankForm.name || !bankForm.bankName) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    linkBank({
      variables: {
        input: {
          bankAccountIban: bankForm.iban,
          bankAccountName: bankForm.name,
          bankName: bankForm.bankName,
        },
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-emerald-100">Solde disponible</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(summary?.availableBalance || 0)}</p>
          {summary?.pendingBalance > 0 && (
            <p className="text-sm text-emerald-100 mt-2">
              + {formatCurrency(summary.pendingBalance)} en attente
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total investi</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary?.totalInvested || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Rendements totaux</p>
          <p className="text-2xl font-bold text-green-600">
            +{formatCurrency(summary?.totalReturns || 0)}
          </p>
        </div>
      </div>

      {/* Virtual Account Info */}
      {wallet?.virtualAccountNumber && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="font-medium text-blue-800 mb-2">Compte virtuel OJ</h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg text-blue-900">{wallet.virtualAccountNumber}</span>
            <button
              onClick={() => copyToClipboard(wallet.virtualAccountNumber)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Utilisez ce numéro pour les virements vers votre wallet OJ
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions Panel */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'deposit'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 inline mr-2" />
              Déposer
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'withdraw'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 inline mr-2" />
              Retirer
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'bank'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building className="w-4 h-4 inline mr-2" />
              Compte bancaire
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {activeTab === 'deposit' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode de paiement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setDepositMethod(method.value)}
                        className={`p-3 border rounded-lg text-center ${
                          depositMethod === method.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <method.icon className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                        <span className="text-xs">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={depositing}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {depositing && <Loader2 className="w-5 h-5 animate-spin" />}
                  Déposer
                </button>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Solde disponible</p>
                  <p className="text-lg font-semibold">{formatCurrency(summary?.availableBalance || 0)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {withdrawing && <Loader2 className="w-5 h-5 animate-spin" />}
                  Retirer
                </button>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="space-y-4">
                {wallet?.bankAccountIban ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Compte lié</p>
                    <p className="font-medium text-green-800">{wallet.bankName}</p>
                    <p className="text-sm text-green-700">{wallet.bankAccountName}</p>
                    <p className="font-mono text-sm text-green-700">{wallet.bankAccountIban}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                      <input
                        type="text"
                        value={bankForm.iban}
                        onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        placeholder="FR76 0000 0000 0000 0000 0000 000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titulaire du compte
                      </label>
                      <input
                        type="text"
                        value={bankForm.name}
                        onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
                      <input
                        type="text"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      onClick={handleLinkBank}
                      disabled={linkingBank}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {linkingBank && <Loader2 className="w-5 h-5 animate-spin" />}
                      Lier le compte
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Historique des transactions</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Aucune transaction</div>
            ) : (
              transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT' ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transactionTypeLabels[tx.type]?.label || tx.type}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT'
                            ? 'text-green-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' || tx.type === 'RETURN_PAYMENT' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <p
                        className={`text-xs ${
                          tx.status === 'COMPLETED'
                            ? 'text-green-500'
                            : tx.status === 'PENDING'
                            ? 'text-yellow-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {tx.status}
                      </p>
                    </div>
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
