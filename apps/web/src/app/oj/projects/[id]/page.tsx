'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  MapPin,
  FileText,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { GET_PROJECT, INVEST, GET_ME } from '@/graphql/oj';

export default function OjProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [investAmount, setInvestAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [error, setError] = useState('');

  const { data: projectData, loading: projectLoading } = useQuery(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
  });

  const { data: meData } = useQuery(GET_ME);

  const [invest, { loading: investing }] = useMutation(INVEST, {
    onCompleted: () => {
      setShowInvestModal(false);
      setInvestAmount('');
      router.push('/oj/portfolio');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const project = projectData?.ojProject;
  const investor = meData?.me;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleInvest = () => {
    setError('');
    const amount = parseFloat(investAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Veuillez entrer un montant valide');
      return;
    }

    if (amount < project.minimumInvestment) {
      setError(`Le montant minimum est de ${formatCurrency(project.minimumInvestment)}`);
      return;
    }

    invest({
      variables: {
        input: {
          projectId,
          amount,
        },
      },
    });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">Projet non trouvé</h2>
        <Link href="/oj/projects" className="text-emerald-600 hover:underline mt-2 inline-block">
          Retour aux projets
        </Link>
      </div>
    );
  }

  const canInvest =
    project.status === 'ACTIVE' &&
    investor?.kycVerification?.status === 'APPROVED' &&
    investor?.wallet?.balance > 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/oj/projects"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux projets
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Building2 className="w-24 h-24 text-white/50" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                  {project.category}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  Série {project.seriesCode}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.spvName}</p>
            </div>

            <div className="flex items-center gap-3">
              {project.blockchainTxHash && (
                <a
                  href={`https://etherscan.io/tx/${project.blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  Blockchain
                </a>
              )}
              <button
                onClick={() => setShowInvestModal(true)}
                disabled={!canInvest}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Investir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description du projet</h2>
            <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
          </div>

          {/* Milestones */}
          {project.milestones && project.milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Étapes du projet</h2>
              <div className="space-y-4">
                {project.milestones.map((milestone: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      <p className="text-sm text-gray-500">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {project.documents && project.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="space-y-2">
                {project.documents.map((doc: string, index: number) => (
                  <a
                    key={index}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Document {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Rendement attendu</span>
                <span className="text-xl font-bold text-emerald-600">{project.expectedReturn}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Durée</span>
                <span className="font-medium text-gray-900">{project.durationMonths} mois</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Investissement minimum</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(project.minimumInvestment)}
                </span>
              </div>

              <hr />

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progression</span>
                  <span className="font-medium">{project.progressPercent?.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(project.progressPercent || 0, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(project.raisedAmount || 0)}</span>
                  <span>{formatCurrency(project.targetAmount)}</span>
                </div>
              </div>

              <hr />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{project.totalInvestors} investisseurs</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Début: {formatDate(project.startDate)}</span>
                </div>
                {project.spvCountry && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{project.spvCountry}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SPV Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SPV</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{project.spvName}</p>
              <p className="text-sm text-gray-500">N° {project.spvRegistrationNumber}</p>
              {project.spvCountry && (
                <p className="text-sm text-gray-500">{project.spvCountry}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Investir dans {project.name}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Solde disponible</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(investor?.wallet?.balance || 0)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant à investir
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min={project.minimumInvestment}
                  step="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder={`Min. ${formatCurrency(project.minimumInvestment)}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">EUR</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInvestModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleInvest}
                disabled={investing}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {investing && <Loader2 className="w-5 h-5 animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
