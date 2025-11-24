'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Shield, Smartphone, Key, Loader2, Eye, EyeOff } from 'lucide-react';
import {
  GET_ME,
  UPDATE_INVESTOR_PROFILE,
  SETUP_TWO_FACTOR,
  ENABLE_TWO_FACTOR,
  DISABLE_TWO_FACTOR,
} from '@/graphql/oj';

export default function OjSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: meData, refetch } = useQuery(GET_ME);
  const investor = meData?.me;

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: investor?.firstName || '',
    lastName: investor?.lastName || '',
    phone: investor?.phone || '',
    country: investor?.country || '',
    address: investor?.address || '',
  });

  // 2FA
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const [updateProfile, { loading: updating }] = useMutation(UPDATE_INVESTOR_PROFILE, {
    onCompleted: () => {
      setSuccess('Profil mis à jour avec succès');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [setupTwoFactor, { loading: settingUp2FA }] = useMutation(SETUP_TWO_FACTOR, {
    onCompleted: (data) => {
      setTwoFactorSetup(data.setupTwoFactor);
    },
    onError: (err) => setError(err.message),
  });

  const [enableTwoFactor, { loading: enabling2FA }] = useMutation(ENABLE_TWO_FACTOR, {
    onCompleted: () => {
      setSuccess('Authentification à deux facteurs activée');
      setTwoFactorSetup(null);
      setOtpCode('');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [disableTwoFactor, { loading: disabling2FA }] = useMutation(DISABLE_TWO_FACTOR, {
    onCompleted: () => {
      setSuccess('Authentification à deux facteurs désactivée');
      setOtpCode('');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const handleUpdateProfile = () => {
    setError('');
    setSuccess('');
    updateProfile({
      variables: { input: profileForm },
    });
  };

  const handleSetup2FA = () => {
    setError('');
    setSuccess('');
    setupTwoFactor();
  };

  const handleEnable2FA = () => {
    setError('');
    if (!otpCode || otpCode.length !== 6) {
      setError('Veuillez entrer un code OTP valide');
      return;
    }
    enableTwoFactor({ variables: { otpCode } });
  };

  const handleDisable2FA = () => {
    setError('');
    if (!otpCode || otpCode.length !== 6) {
      setError('Veuillez entrer un code OTP valide');
      return;
    }
    disableTwoFactor({ variables: { otpCode } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              activeTab === 'security'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sécurité
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

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={investor?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={updating}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating && <Loader2 className="w-5 h-5 animate-spin" />}
                Enregistrer les modifications
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* 2FA Section */}
              <div className="p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
                    <p className="text-sm text-gray-500">
                      {investor?.twoFactorEnabled
                        ? 'Activée - Votre compte est sécurisé'
                        : 'Désactivée - Activez pour plus de sécurité'}
                    </p>
                  </div>
                </div>

                {investor?.twoFactorEnabled ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        L'authentification à deux facteurs est activée sur votre compte.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code OTP pour désactiver
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>
                    <button
                      onClick={handleDisable2FA}
                      disabled={disabling2FA}
                      className="w-full py-3 border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {disabling2FA && <Loader2 className="w-5 h-5 animate-spin" />}
                      Désactiver 2FA
                    </button>
                  </div>
                ) : twoFactorSetup ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        Scannez ce QR code avec votre application d'authentification
                      </p>
                      <img
                        src={twoFactorSetup.qrCodeUrl}
                        alt="QR Code"
                        className="mx-auto w-48 h-48 border border-gray-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Ou entrez ce code manuellement: <code className="bg-gray-100 px-1 rounded">{twoFactorSetup.secret}</code>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entrez le code OTP
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="123456"
                        maxLength={6}
                      />
                    </div>
                    <button
                      onClick={handleEnable2FA}
                      disabled={enabling2FA}
                      className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {enabling2FA && <Loader2 className="w-5 h-5 animate-spin" />}
                      Activer 2FA
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSetup2FA}
                    disabled={settingUp2FA}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {settingUp2FA && <Loader2 className="w-5 h-5 animate-spin" />}
                    Configurer 2FA
                  </button>
                )}
              </div>

              {/* Account Info */}
              <div className="p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Statut du compte</h3>
                    <p className="text-sm text-gray-500">Informations de sécurité</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Type de compte</span>
                    <span className="font-medium text-gray-900">{investor?.investorType}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Statut</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        investor?.status === 'VERIFIED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {investor?.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">KYC</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        investor?.kycVerification?.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {investor?.kycVerification?.status || 'Non vérifié'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Compte créé le</span>
                    <span className="font-medium text-gray-900">
                      {investor?.createdAt
                        ? new Date(investor.createdAt).toLocaleDateString('fr-FR')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
