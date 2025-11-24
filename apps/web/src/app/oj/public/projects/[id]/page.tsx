'use client';

import { useQuery } from '@apollo/client';
import { TrendingUp, Users, Calendar, Target, CheckCircle } from 'lucide-react';
import { GET_PUBLIC_PROJECT_DETAILS } from '@/graphql/oj-public';
import Link from 'next/link';

export default function PublicProjectDetailsPage({ params }: { params: { id: string } }) {
  const { data, loading } = useQuery(GET_PUBLIC_PROJECT_DETAILS, {
    variables: { projectId: params.id },
  });

  const project = data?.publicProjectDetails;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Projet non trouvé</p>
      </div>
    );
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-8" />
        <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
        <p className="text-xl text-gray-600 mb-8">{project.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border">
            <TrendingUp className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold">{project.expectedReturn}%</p>
            <p className="text-sm text-gray-500">Rendement</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{project.investorCount}</p>
            <p className="text-sm text-gray-500">Investisseurs</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{project.duration}</p>
            <p className="text-sm text-gray-500">Mois</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <Target className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-2xl font-bold">{project.fundingProgress.toFixed(0)}%</p>
            <p className="text-sm text-gray-500">Financé</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border mb-8">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Progression</span>
            <span>
              {formatCurrency(project.currentFunding)} / {formatCurrency(project.fundingGoal)}
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${Math.min(project.fundingProgress, 100)}%` }}
            />
          </div>
        </div>

        {project.metadata?.milestones && project.metadata.milestones.length > 0 && (
          <div className="bg-white p-6 rounded-xl border mb-8">
            <h2 className="text-2xl font-bold mb-4">Milestones</h2>
            <div className="space-y-3">
              {project.metadata.milestones.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle
                    className={`w-5 h-5 ${m.status === 'COMPLETED' ? 'text-green-500' : 'text-gray-300'}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{m.title}</p>
                    <div className="h-1 bg-gray-200 rounded mt-1" style={{ width: '200px' }}>
                      <div
                        className="h-full bg-purple-500 rounded"
                        style={{ width: `${m.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/oj/auth/register"
          className="block w-full py-4 bg-indigo-600 text-white text-center rounded-xl font-semibold text-lg hover:bg-indigo-700"
        >
          Investir dans ce projet
        </Link>
      </div>
    </div>
  );
}
