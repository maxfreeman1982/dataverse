'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Search, Filter, FolderKanban, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { GET_PUBLIC_PROJECTS } from '@/graphql/oj-public';
import Link from 'next/link';

export default function PublicProjectsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, loading } = useQuery(GET_PUBLIC_PROJECTS, {
    variables: { status: status || undefined, category: category || undefined, page, limit },
  });

  const projectsData = data?.publicProjects;
  const projects = projectsData?.projects || [];
  const total = projectsData?.total || 0;
  const totalPages = projectsData?.totalPages || 1;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(value);

  const filteredProjects = projects.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">Projets d'investissement</h1><p className="text-gray-600">{total} projet(s) disponible(s)</p></div>

      <div className="bg-white rounded-xl border p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un projet..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="">Tous les statuts</option><option value="FUNDRAISING">Levée en cours</option><option value="FUNDED">Financé</option><option value="ACTIVE">Actif</option></select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="">Toutes catégories</option><option value="RENEWABLE_ENERGY">Énergie renouvelable</option><option value="REAL_ESTATE">Immobilier</option><option value="TECH">Technologie</option></select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12"><FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Aucun projet trouvé</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const progress = (project.currentFunding / project.fundingGoal) * 100;
            return (
              <Link key={project.id} href={`/oj/public/projects/${project.id}`} className="bg-white rounded-xl border hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-t-xl" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{project.category}</span></div>
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  <div className="space-y-3">
                    <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Objectif</span><span className="font-medium">{formatCurrency(project.fundingGoal)}</span></div><div className="h-2 bg-gray-200 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} /></div></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Rendement</span><span className="font-semibold text-emerald-600">{project.expectedReturn}%</span></div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">{project.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{project.location}</div>}<div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.duration} mois</div></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Précédent</button>
          <span className="px-4 py-2">Page {page} sur {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Suivant</button>
        </div>
      )}
    </div>
  );
}
