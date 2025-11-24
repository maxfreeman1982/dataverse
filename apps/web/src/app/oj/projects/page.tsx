'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { Search, Filter, Building2, TrendingUp, Users, Clock } from 'lucide-react';
import { GET_PROJECTS, GET_PROJECT_STATS } from '@/graphql/oj';

const categories = [
  { value: '', label: 'Toutes catégories' },
  { value: 'REAL_ESTATE', label: 'Immobilier' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'ENERGY', label: 'Énergie' },
  { value: 'AGRICULTURE', label: 'Agriculture' },
  { value: 'TECHNOLOGY', label: 'Technologie' },
  { value: 'OTHER', label: 'Autre' },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700' },
  FUNDED: { label: 'Financé', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'Terminé', color: 'bg-gray-100 text-gray-700' },
};

export default function OjProjectsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: projectsData, loading: projectsLoading } = useQuery(GET_PROJECTS, {
    variables: {
      filter: category ? { category } : undefined,
      search: search || undefined,
    },
  });

  const { data: statsData } = useQuery(GET_PROJECT_STATS);

  const projects = projectsData?.ojProjects || [];
  const stats = statsData?.ojProjectStats;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Projets actifs</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.activeProjects || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Fonds levés</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.totalFundsRaised || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Rendement moyen</p>
          <p className="text-2xl font-bold text-emerald-600">
            {(stats?.averageReturn || 0).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500">Investisseurs</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalInvestors || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un projet..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun projet trouvé</h3>
          <p className="text-gray-500 mt-1">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/oj/projects/${project.id}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Project Image */}
              <div className="h-40 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusLabels[project.status]?.color || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusLabels[project.status]?.label || project.status}
                  </span>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{project.expectedReturn}%</p>
                    <p className="text-xs text-gray-500">rendement</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {project.shortDescription || project.description}
                </p>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Progression</span>
                    <span className="font-medium text-gray-900">
                      {project.progressPercent?.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(project.progressPercent || 0, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>{formatCurrency(project.raisedAmount || 0)}</span>
                    <span>{formatCurrency(project.targetAmount)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{project.totalInvestors} investisseurs</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{project.durationMonths} mois</span>
                  </div>
                </div>

                {/* Min Investment */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Investissement minimum</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(project.minimumInvestment)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
