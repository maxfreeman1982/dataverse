'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Camera,
  FileText,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  GET_KYC_PROGRESS,
  START_KYC,
  SUBMIT_KYC_DOCUMENT,
  SUBMIT_KYC_SELFIE,
  SUBMIT_KYC_FOR_REVIEW,
} from '@/graphql/oj';

const kycLevels = [
  { value: 'BASIC', label: 'Basique', description: 'Document d\'identité uniquement' },
  { value: 'STANDARD', label: 'Standard', description: 'Document + Selfie' },
  { value: 'ENHANCED', label: 'Avancé', description: 'Document + Selfie + Justificatif de domicile' },
];

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  NOT_STARTED: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Non commencé' },
  PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'En attente' },
  IN_REVIEW: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100', label: 'En cours de vérification' },
  APPROVED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Approuvé' },
  REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Rejeté' },
  EXPIRED: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100', label: 'Expiré' },
};

export default function OjKycPage() {
  const [step, setStep] = useState(1);
  const [targetLevel, setTargetLevel] = useState('STANDARD');
  const [documentForm, setDocumentForm] = useState({
    documentType: 'PASSPORT',
    documentNumber: '',
    documentCountry: '',
    documentFrontUrl: '',
    documentBackUrl: '',
  });
  const [selfieUrl, setSelfieUrl] = useState('');
  const [error, setError] = useState('');

  const { data: progressData, loading, refetch } = useQuery(GET_KYC_PROGRESS);

  const [startKyc, { loading: starting }] = useMutation(START_KYC, {
    onCompleted: () => {
      setStep(2);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [submitDocument, { loading: submittingDoc }] = useMutation(SUBMIT_KYC_DOCUMENT, {
    onCompleted: () => {
      setStep(3);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [submitSelfie, { loading: submittingSelfie }] = useMutation(SUBMIT_KYC_SELFIE, {
    onCompleted: () => {
      setStep(4);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [submitForReview, { loading: submitting }] = useMutation(SUBMIT_KYC_FOR_REVIEW, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const progress = progressData?.kycProgress;
  const statusInfo = statusConfig[progress?.status || 'NOT_STARTED'];

  const handleStartKyc = () => {
    setError('');
    startKyc({
      variables: { input: { targetLevel } },
    });
  };

  const handleSubmitDocument = () => {
    setError('');
    if (!documentForm.documentNumber || !documentForm.documentCountry || !documentForm.documentFrontUrl) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    submitDocument({
      variables: {
        input: {
          documentType: documentForm.documentType,
          documentNumber: documentForm.documentNumber,
          documentCountry: documentForm.documentCountry,
          documentFrontUrl: documentForm.documentFrontUrl,
          documentBackUrl: documentForm.documentBackUrl || undefined,
        },
      },
    });
  };

  const handleSubmitSelfie = () => {
    setError('');
    if (!selfieUrl) {
      setError('Veuillez télécharger un selfie');
      return;
    }
    submitSelfie({
      variables: { input: { selfieUrl } },
    });
  };

  const handleFinalSubmit = () => {
    setError('');
    submitForReview();
  };

  // Simulate file upload (in production, this would upload to storage)
  const handleFileUpload = (type: 'front' | 'back' | 'selfie') => {
    const mockUrl = `https://storage.example.com/${type}-${Date.now()}.jpg`;
    if (type === 'front') {
      setDocumentForm({ ...documentForm, documentFrontUrl: mockUrl });
    } else if (type === 'back') {
      setDocumentForm({ ...documentForm, documentBackUrl: mockUrl });
    } else {
      setSelfieUrl(mockUrl);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // If already approved
  if (progress?.status === 'APPROVED') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Identité vérifiée</h1>
          <p className="text-gray-600 mb-4">
            Votre vérification KYC est complète. Vous pouvez maintenant investir sur la plateforme.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700">
            <Shield className="w-4 h-4" />
            <span className="font-medium">Niveau {progress.currentLevel}</span>
          </div>
        </div>
      </div>
    );
  }

  // If in review
  if (progress?.status === 'IN_REVIEW') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérification en cours</h1>
          <p className="text-gray-600">
            Vos documents sont en cours de vérification. Vous serez notifié une fois le processus terminé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${statusInfo.bg} rounded-xl flex items-center justify-center`}>
            <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vérification d'identité (KYC)</h1>
            <p className={`text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
          </div>
        </div>

        {progress?.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Raison du rejet:</strong> {progress.rejectionReason}
            </p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {progress?.completedSteps?.includes(
                  s === 2 ? 'document' : s === 3 ? 'selfie' : ''
                ) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  s
                )}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 md:w-24 h-1 ${
                    step > s ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Choose Level */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Choisissez votre niveau de vérification</h2>
            <div className="space-y-3">
              {kycLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setTargetLevel(level.value)}
                  className={`w-full p-4 border rounded-lg text-left ${
                    targetLevel === level.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{level.label}</p>
                  <p className="text-sm text-gray-500">{level.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={handleStartKyc}
              disabled={starting}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {starting && <Loader2 className="w-5 h-5 animate-spin" />}
              Commencer la vérification
            </button>
          </div>
        )}

        {/* Step 2: Document Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Document d'identité</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
              <select
                value={documentForm.documentType}
                onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="PASSPORT">Passeport</option>
                <option value="ID_CARD">Carte d'identité</option>
                <option value="DRIVER_LICENSE">Permis de conduire</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                <input
                  type="text"
                  value={documentForm.documentNumber}
                  onChange={(e) => setDocumentForm({ ...documentForm, documentNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays d'émission</label>
                <input
                  type="text"
                  value={documentForm.documentCountry}
                  onChange={(e) => setDocumentForm({ ...documentForm, documentCountry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recto</label>
                <button
                  onClick={() => handleFileUpload('front')}
                  className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
                    documentForm.documentFrontUrl
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {documentForm.documentFrontUrl ? (
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Télécharger</span>
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verso (optionnel)</label>
                <button
                  onClick={() => handleFileUpload('back')}
                  className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
                    documentForm.documentBackUrl
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {documentForm.documentBackUrl ? (
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Télécharger</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitDocument}
              disabled={submittingDoc}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submittingDoc && <Loader2 className="w-5 h-5 animate-spin" />}
              Continuer
            </button>
          </div>
        )}

        {/* Step 3: Selfie */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Photo de vérification</h2>
            <p className="text-gray-600">
              Prenez un selfie en tenant votre document d'identité à côté de votre visage.
            </p>

            <button
              onClick={() => handleFileUpload('selfie')}
              className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
                selfieUrl
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {selfieUrl ? (
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              ) : (
                <>
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-gray-500">Cliquez pour prendre une photo</span>
                </>
              )}
            </button>

            <button
              onClick={handleSubmitSelfie}
              disabled={submittingSelfie}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submittingSelfie && <Loader2 className="w-5 h-5 animate-spin" />}
              Continuer
            </button>
          </div>
        )}

        {/* Step 4: Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Récapitulatif</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Document d'identité</span>
                <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Photo de vérification</span>
                <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                En soumettant votre vérification, vous confirmez que les informations fournies sont exactes
                et que les documents vous appartiennent.
              </p>
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              Soumettre ma vérification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
