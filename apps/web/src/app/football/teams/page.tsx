'use client';

import { useState } from 'react';
import { Plus, Users, Edit, Trash2, ChevronRight } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestion d'Équipes</h1>
            <p className="text-slate-400">Créez et gérez vos équipes de football</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Équipe
          </button>
        </div>

        {/* Empty State */}
        {teams.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-2xl font-bold mb-2">Aucune équipe</h3>
            <p className="text-slate-400 mb-6">Créez votre première équipe pour commencer</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer une équipe
            </button>
          </div>
        ) : (
          /* Teams Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}

        {/* Quick Guide */}
        <div className="mt-12 bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">Guide Rapide</h3>
          <div className="space-y-3 text-slate-300">
            <Step number={1} text="Créez une nouvelle équipe avec nom, formation et style tactique" />
            <Step number={2} text="Ajoutez des joueurs avec leurs profils, positions et statistiques" />
            <Step number={3} text="Créez des matchs pour analyser les performances" />
            <Step number={4} text="Utilisez l'IA pour générer analyses et entraînements" />
          </div>
        </div>
      </div>

      {/* Create Team Modal (simplified) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6">Nouvelle Équipe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom de l'équipe</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Ex: FC Barcelona"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Formation</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
                  <option>4-3-3</option>
                  <option>4-4-2</option>
                  <option>3-5-2</option>
                  <option>4-2-3-1</option>
                  <option>3-4-3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Style Tactique</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
                  <option>Possession</option>
                  <option>Counter-Attack</option>
                  <option>High-Press</option>
                  <option>Defensive</option>
                  <option>Direct</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // TODO: Create team via GraphQL
                  setShowCreateModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamCard({ team }: { team: any }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">
            {team.name}
          </h3>
          <p className="text-sm text-slate-400">{team.formation} · {team.tacticalStyle}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <div>
          <span className="font-semibold text-white">{team.playersCount || 0}</span> joueurs
        </div>
        <div>
          <span className="font-semibold text-white">{team.matchesCount || 0}</span> matchs
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {number}
      </div>
      <span>{text}</span>
    </div>
  );
}
