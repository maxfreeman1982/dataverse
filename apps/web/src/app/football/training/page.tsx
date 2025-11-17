'use client';

import { useState } from 'react';
import { Target, Zap, Calendar, Download, Plus } from 'lucide-react';

export default function TrainingPage() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Générateur d'Entraînements IA</h1>
            <p className="text-slate-400">Plans personnalisés basés sur l'analyse FootMind Engine</p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Zap className="w-5 h-5" />
            Générer un Plan
          </button>
        </div>

        {/* Generator Card */}
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-purple-500/30 mb-12">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">IA de Génération d'Entraînements</h2>
              <p className="text-slate-300 mb-4">
                FootMind Engine analyse vos matchs et génère des plans d'entraînement personnalisés
                pour corriger les faiblesses, améliorer les tactiques et intégrer des innovations
                cross-sport (basket, rugby, handball, NFL).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Feature text="Exercices personnalisés" />
                <Feature text="Charge physique optimisée" />
                <Feature text="Innovations multi-sports" />
                <Feature text="Durée adaptative" />
                <Feature text="Objectifs mesurables" />
                <Feature text="Points de coaching" />
              </div>
            </div>
          </div>
        </div>

        {/* Training Plans */}
        {trainingPlans.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold mb-2">Aucun plan d'entraînement</h3>
            <p className="text-slate-400 mb-6">
              Générez votre premier plan avec l'IA FootMind Engine
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Générer un plan IA
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingPlans.map((plan) => (
              <TrainingPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}

        {/* Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Générer un Plan d'Entraînement IA</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Équipe</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                    <option>Sélectionnez une équipe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Focus Principal</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                    <option value="tactical">Tactique</option>
                    <option value="technical">Technique</option>
                    <option value="physical">Physique</option>
                    <option value="set-pieces">Phases Arrêtées</option>
                    <option value="recovery">Récupération</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Durée (minutes)</label>
                  <input
                    type="number"
                    defaultValue={90}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2"
                    min={30}
                    max={180}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulté</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Basé sur un match (optionnel)
                  </label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2">
                    <option value="">Aucun match</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="crossSport" defaultChecked />
                  <label htmlFor="crossSport" className="text-sm">
                    Inclure innovations cross-sport (basket, rugby, handball, NFL)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Objectifs spécifiques (optionnel)
                  </label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 h-24"
                    placeholder="Ex: Améliorer le pressing haut, transitions défensives rapides..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // TODO: Generate training via GraphQL
                    setShowGenerator(false);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Générer avec IA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}

function TrainingPlanCard({ plan }: { plan: any }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold mb-1">{plan.title}</h3>
          <p className="text-sm text-slate-400">{plan.focus} · {plan.duration} min</p>
        </div>
        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-semibold">
          {plan.status}
        </span>
      </div>
      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{plan.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {plan.exercisesCount} exercices
        </span>
        <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium">
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>
    </div>
  );
}
