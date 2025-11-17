'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info, Maximize2, Download } from 'lucide-react';
import { MatchVisualization3D } from '@/components/football/3d';

/**
 * 3D Match Visualization Page
 * Full-screen immersive 3D view of match data
 */
export default function Visualization3DPage() {
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const exportView = () => {
    // TODO: Implement screenshot/export functionality
    alert('Export feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/football"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Back to Football"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                🎮 Visualisation 3D
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                Exploration interactive du terrain et des données de match
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle info"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              onClick={exportView}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Export view"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-blue-300 mb-2">Contrôles interactifs :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="font-medium">🖱️ Clic gauche + glisser :</span> Rotation de la caméra
                  </div>
                  <div>
                    <span className="font-medium">🖱️ Clic droit + glisser :</span> Déplacement latéral
                  </div>
                  <div>
                    <span className="font-medium">🖱️ Molette :</span> Zoom avant/arrière
                  </div>
                  <div>
                    <span className="font-medium">📹 Bouton caméra :</span> Changer de vue (Tactique/Broadcast/But)
                  </div>
                  <div>
                    <span className="font-medium">📊 Bouton graphique :</span> Afficher/masquer heat map
                  </div>
                  <div>
                    <span className="font-medium">▶️ Play/Pause :</span> Lire l'animation (à venir)
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close info"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Visualization */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <MatchVisualization3D showHeatMap={false} showTrajectories={false} />
      </div>

      {/* Stats Panel */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">🔵</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Équipe domicile</p>
                <p className="text-lg font-bold">FC Barcelona</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">8</p>
                <p className="text-xs text-slate-400">Joueurs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">65%</p>
                <p className="text-xs text-slate-400">Possession</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">12</p>
                <p className="text-xs text-slate-400">Tirs</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">Match en cours</p>
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="text-4xl font-bold text-blue-400">2</div>
                <div className="text-2xl text-slate-500">-</div>
                <div className="text-4xl font-bold text-red-400">1</div>
              </div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                45' + 2' - Première mi-temps
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Équipe extérieur</p>
                <p className="text-lg font-bold">Real Madrid</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-red-400">5</p>
                <p className="text-xs text-slate-400">Joueurs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">35%</p>
                <p className="text-xs text-slate-400">Possession</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">6</p>
                <p className="text-xs text-slate-400">Tirs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold mb-4">🎯 Fonctionnalités 3D</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <div className="text-3xl mb-2">⚽</div>
            <h3 className="font-bold mb-1">Positions Réalistes</h3>
            <p className="text-sm text-slate-400">
              Visualisation 3D des positions réelles des joueurs et du ballon
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="font-bold mb-1">Heat Maps 3D</h3>
            <p className="text-sm text-slate-400">
              Cartes thermiques volumétriques des zones d'occupation
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-lg p-4">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-bold mb-1">Trajectoires</h3>
            <p className="text-sm text-slate-400">
              Visualisation des déplacements et passes en 3D animé
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
            <div className="text-3xl mb-2">🎬</div>
            <h3 className="font-bold mb-1">Multi-Caméras</h3>
            <p className="text-sm text-slate-400">
              Vues tactique, broadcast et derrière le but
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
