'use client';

import { useQuery } from '@apollo/client';
import { TrendingUp, BarChart3, PieChart, Award } from 'lucide-react';
import { GET_PUBLIC_PERFORMANCE_METRICS, GET_PUBLIC_CATEGORY_STATS } from '@/graphql/oj-public';

export default function PublicPerformancePage() {
  const { data: metricsData } = useQuery(GET_PUBLIC_PERFORMANCE_METRICS);
  const { data: categoryData } = useQuery(GET_PUBLIC_CATEGORY_STATS);

  const metrics = metricsData?.publicPerformanceMetrics;
  const categories = categoryData?.publicCategoryStats || [];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
    }).format(v);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Performance de la plateforme</h1>
        <p className="text-gray-600">Métriques et statistiques en temps réel</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border">
            <Award className="w-8 h-8 text-indigo-600 mb-3" />
            <p className="text-3xl font-bold">{metrics.totalActiveProjects}</p>
            <p className="text-gray-600">Projets actifs</p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <TrendingUp className="w-8 h-8 text-emerald-600 mb-3" />
            <p className="text-3xl font-bold">{metrics.averageReturn}%</p>
            <p className="text-gray-600">ROI moyen</p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
            <p className="text-3xl font-bold">{metrics.successRate}%</p>
            <p className="text-gray-600">Taux de succès</p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <PieChart className="w-8 h-8 text-purple-600 mb-3" />
            <p className="text-3xl font-bold">{formatCurrency(metrics.totalValueLocked)}</p>
            <p className="text-gray-600">Valeur totale</p>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-2xl font-bold mb-6">Répartition par catégorie</h2>
          <div className="space-y-4">
            {categories.map((cat: any) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{cat.category}</p>
                  <p className="text-sm text-gray-500">{cat.projectCount} projet(s)</p>
                </div>
                <p className="text-lg font-bold text-indigo-600">
                  {formatCurrency(cat.totalFunding)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
