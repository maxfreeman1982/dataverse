'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  FileText,
  Target,
  Trophy,
  BarChart3
} from 'lucide-react';

export default function FootballDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            FootMind Engine
          </h1>
          <p className="text-xl text-slate-300">
            IA d'analyse tactique football · Prédiction · Entraînement · Innovation
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Équipes"
            value="0"
            color="blue"
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            title="Matchs"
            value="0"
            color="emerald"
          />
          <StatCard
            icon={<Activity className="w-8 h-8" />}
            title="Analyses"
            value="0"
            color="purple"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="Entraînements"
            value="0"
            color="orange"
          />
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            href="/football/dashboard"
            icon={<BarChart3 className="w-12 h-12" />}
            title="Dashboard Analytics"
            description="Statistiques avancées, graphiques et comparaisons"
            color="indigo"
          />

          <FeatureCard
            href="/football/teams"
            icon={<Users className="w-12 h-12" />}
            title="Gestion d'Équipes"
            description="Créez et gérez vos équipes, joueurs et compositions"
            color="blue"
          />

          <FeatureCard
            href="/football/matches"
            icon={<Trophy className="w-12 h-12" />}
            title="Matchs & Analyses"
            description="Analysez les matchs avec l'IA tactique avancée"
            color="emerald"
          />

          <FeatureCard
            href="/football/training"
            icon={<Target className="w-12 h-12" />}
            title="Générateur d'Entraînements"
            description="Plans d'entraînement personnalisés par IA"
            color="purple"
          />

          <FeatureCard
            href="/football/analysis"
            icon={<TrendingUp className="w-12 h-12" />}
            title="Analyse Tactique"
            description="Patterns, prédictions, insights spatio-temporels"
            color="orange"
          />

          <FeatureCard
            href="/football/matches"
            icon={<Activity className="w-12 h-12" />}
            title="Tracking Live"
            description="Analyse en temps réel et prédictions 3-10 secondes"
            color="pink"
          />

          <FeatureCard
            href="/football/reports"
            icon={<FileText className="w-12 h-12" />}
            title="Rapports & Insights"
            description="Rapports détaillés pour le staff technique"
            color="indigo"
          />
        </div>

        {/* Features List */}
        <div className="mt-16 bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Capacités FootMind Engine</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Feature text="Analyse tactique UEFA Pro niveau" />
            <Feature text="Détection de patterns offensifs/défensifs" />
            <Feature text="Prédictions micro (3-10 sec)" />
            <Feature text="Analyse spatio-temporelle" />
            <Feature text="Profil adversaire complet" />
            <Feature text="Recommandations coaching live" />
            <Feature text="Génération d'entraînements IA" />
            <Feature text="Innovations cross-sport (NBA, NFL, Rugby)" />
            <Feature text="Optimisation phases arrêtées" />
            <Feature text="Substitutions intelligentes" />
            <Feature text="Risques & opportunités temps réel" />
            <Feature text="Intégration tracking + events + vidéo" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
  color
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30 hover:border-blue-400',
    emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-400',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-500/30 hover:border-orange-400',
    pink: 'from-pink-500/10 to-pink-600/10 border-pink-500/30 hover:border-pink-400',
    indigo: 'from-indigo-500/10 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400',
  };

  return (
    <Link href={href}>
      <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-105 cursor-pointer h-full`}>
        <div className="mb-4 text-slate-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </Link>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
      <span className="text-slate-300">{text}</span>
    </div>
  );
}
