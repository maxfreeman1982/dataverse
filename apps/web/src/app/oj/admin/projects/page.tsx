'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  FolderKanban,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import { GET_ADMIN_ALL_PROJECTS, ADMIN_UPDATE_PROJECT_STATUS } from '@/graphql/oj-admin';
import Link from 'next/link';

export default function OjAdminProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, loading, refetch } = useQuery(GET_ADMIN_ALL_PROJECTS);

  const [updateStatus, { loading: updating }] = useMutation(ADMIN_UPDATE_PROJECT_STATUS, {
    onCompleted: () => refetch(),
  });

  const projects = data?.adminAllProjects || [];

  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.spvName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Brouillon' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      FUNDRAISING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Levée en cours' },
      FUNDED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Financé' },
      ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Actif' },
      COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Terminé' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulé' },
    };
    return badges[status] || badges.DRAFT;
  };

  const handleStatusChange = (projectId: string, newStatus: string) => {
    updateStatus({
      variables: { projectId, status: newStatus },
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
          <p className="text-gray-500">{projects.length} projet(s) au total</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau projet
        </button>
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
              placeholder="Rechercher un projet..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="PENDING">En attente</option>
            <option value="FUNDRAISING">Levée en cours</option>
            <option value="FUNDED">Financé</option>
            <option value="ACTIVE">Actif</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun projet trouvé</h3>
          <p className="text-gray-500 mt-1">Créez votre premier projet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const statusBadge = getStatusBadge(project.status);
            const progress = project.fundingGoal
              ? (project.currentFunding / project.fundingGoal) * 100
              : 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Project Image */}
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <FolderKanban className="w-12 h-12 text-slate-400" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.spvName}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Funding Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(project.currentFunding || 0)}</span>
                      <span>{formatCurrency(project.fundingGoal || 0)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Rendement</p>
                      <p className="font-medium text-sm">{project.expectedReturn || 0}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Investisseurs</p>
                      <p className="font-medium text-sm">{project.investorsCount || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Durée</p>
                      <p className="font-medium text-sm">{project.duration || 0} mois</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/oj/admin/projects/${project.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </Link>
                    <Link
                      href={`/oj/admin/projects/${project.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </Link>
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(project.id, e.target.value)}
                      disabled={updating}
                      className="px-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="DRAFT">Brouillon</option>
                      <option value="PENDING">En attente</option>
                      <option value="FUNDRAISING">Levée</option>
                      <option value="FUNDED">Financé</option>
                      <option value="ACTIVE">Actif</option>
                      <option value="COMPLETED">Terminé</option>
                      <option value="CANCELLED">Annulé</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
