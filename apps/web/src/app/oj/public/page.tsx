'use client';

import { useQuery } from '@apollo/client';
import {
  TrendingUp,
  Users,
  FolderKanban,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Shield,
  LineChart,
} from 'lucide-react';
import Link from 'next/link';
import {
  GET_PUBLIC_PLATFORM_STATS,
  GET_PUBLIC_RECENT_ACTIVITY,
  GET_PUBLIC_PERFORMANCE_METRICS,
} from '@/graphql/oj-public';

export default function PublicDashboardPage() {
  const { data: statsData } = useQuery(GET_PUBLIC_PLATFORM_STATS);
  const { data: activityData } = useQuery(GET_PUBLIC_RECENT_ACTIVITY, {
    variables: { limit: 5 },
  });
  const { data: metricsData } = useQuery(GET_PUBLIC_PERFORMANCE_METRICS);

  const stats = statsData?.publicPlatformStats;
  const activity = activityData?.publicRecentActivity;
  const metrics = metricsData?.publicPerformanceMetrics;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Investissez dans l'avenir avec transparence
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Plateforme d'investissement sécurisée et transparente basée sur la blockchain
            </p>
            <div className="flex gap-4">
              <Link
                href="/oj/auth/register"
                className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Commencer à investir
              </Link>
              <Link
                href="/oj/public/projects"
                className="px-6 py-3 bg-indigo-500/20 border border-white/30 text-white rounded-lg font-semibold hover:bg-indigo-500/30 transition-colors"
              >
                Découvrir les projets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="container mx-auto px-4 py-12 -mt-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FolderKanban className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              <p className="text-gray-500">Projets au total</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalFunding)}
              </p>
              <p className="text-gray-500">Fonds levés</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalInvestors}</p>
              <p className="text-gray-500">Investisseurs</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.averageReturn.toFixed(1)}%
              </p>
              <p className="text-gray-500">Rendement moyen</p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir OJ Investment ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Une plateforme moderne qui combine transparence blockchain et sécurité bancaire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Sécurisé & Régulé
            </h3>
            <p className="text-gray-600">
              KYC vérifié, fonds en séquestre bancaire et traçabilité blockchain complète
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <LineChart className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Transparence Totale
            </h3>
            <p className="text-gray-600">
              Tous les projets et transactions sont enregistrés sur la blockchain
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Rendements Attractifs
            </h3>
            <p className="text-gray-600">
              Investissez dans des projets sélectionnés avec des rendements compétitifs
            </p>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      {metrics && (
        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Performance de la plateforme
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-2">
                  {metrics.totalActiveProjects}
                </p>
                <p className="text-gray-600">Projets actifs</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-2">
                  {metrics.averageFundingTime}j
                </p>
                <p className="text-gray-600">Temps de financement moyen</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-2">
                  {metrics.averageReturn}%
                </p>
                <p className="text-gray-600">Rendement moyen</p>
              </div>

              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-2">
                  {metrics.successRate}%
                </p>
                <p className="text-gray-600">Taux de succès</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Projects */}
      {activity?.recentProjects && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Projets récents</h2>
            <Link
              href="/oj/public/projects"
              className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Voir tous les projets
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activity.recentProjects.map((project: any) => {
              const progress = (project.currentFunding / project.fundingGoal) * 100;
              return (
                <div key={project.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.name}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Objectif</span>
                          <span className="font-medium">
                            {formatCurrency(project.fundingGoal)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Rendement</span>
                        <span className="font-semibold text-emerald-600">
                          {project.expectedReturn}%
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/oj/public/projects/${project.id}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                    >
                      En savoir plus
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à commencer votre parcours d'investissement ?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'investisseurs qui font confiance à notre plateforme
          </p>
          <Link
            href="/oj/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-colors"
          >
            Créer un compte gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
