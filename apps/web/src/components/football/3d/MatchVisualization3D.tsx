'use client';

import { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Sky } from '@react-three/drei';
import { Field3D } from './Field3D';
import { Player3D, Ball3D } from './Player3D';
import { HeatMap3D } from './HeatMap3D';
import { Trajectory3D } from './Trajectory3D';
import { Play, Pause, RotateCcw, Camera, Grid3x3, TrendingUp } from 'lucide-react';

interface MatchVisualization3DProps {
  trackingData?: any[];
  showHeatMap?: boolean;
  showTrajectories?: boolean;
  matchId?: string;
}

/**
 * Main 3D Match Visualization Component
 * Orchestrates all 3D elements: field, players, ball, heat maps, trajectories
 */
export function MatchVisualization3D({
  trackingData = [],
  showHeatMap = false,
  showTrajectories = false,
  matchId,
}: MatchVisualization3DProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [viewMode, setViewMode] = useState<'tactical' | 'broadcast' | 'behind-goal'>('tactical');
  const [showGrid, setShowGrid] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Mock data if no tracking data provided
  const mockPlayers = [
    // Home team
    { id: '1', position: [-45, 0, 0] as [number, number, number], team: 'home' as const, number: 1, name: 'Goalkeeper' },
    { id: '2', position: [-30, 0, -20] as [number, number, number], team: 'home' as const, number: 2, name: 'Defender' },
    { id: '3', position: [-30, 0, 20] as [number, number, number], team: 'home' as const, number: 3, name: 'Defender' },
    { id: '4', position: [-15, 0, -25] as [number, number, number], team: 'home' as const, number: 4, name: 'Midfielder' },
    { id: '5', position: [-15, 0, 0] as [number, number, number], team: 'home' as const, number: 5, name: 'Midfielder' },
    { id: '6', position: [-15, 0, 25] as [number, number, number], team: 'home' as const, number: 6, name: 'Midfielder' },
    { id: '7', position: [0, 0, -20] as [number, number, number], team: 'home' as const, number: 7, name: 'Forward', speed: 5, direction: 45 },
    { id: '8', position: [0, 0, 20] as [number, number, number], team: 'home' as const, number: 8, name: 'Forward' },
    // Away team
    { id: '9', position: [45, 0, 0] as [number, number, number], team: 'away' as const, number: 1, name: 'Goalkeeper' },
    { id: '10', position: [30, 0, -20] as [number, number, number], team: 'away' as const, number: 2, name: 'Defender' },
    { id: '11', position: [30, 0, 20] as [number, number, number], team: 'away' as const, number: 3, name: 'Defender' },
    { id: '12', position: [15, 0, 0] as [number, number, number], team: 'away' as const, number: 4, name: 'Midfielder' },
    { id: '13', position: [0, 0, -10] as [number, number, number], team: 'away' as const, number: 5, name: 'Forward', speed: 3, direction: 180 },
  ];

  const ballPosition: [number, number, number] = [0, 0.2, -10];

  // Mock heat map data
  const heatMapPoints = Array.from({ length: 100 }, (_, i) => ({
    x: (Math.random() - 0.5) * 60,
    z: (Math.random() - 0.5) * 40,
    intensity: Math.random(),
  }));

  // Camera positions for different view modes
  const getCameraPosition = (): [number, number, number] => {
    switch (viewMode) {
      case 'broadcast':
        return [0, 35, 80];
      case 'behind-goal':
        return [-60, 25, 0];
      case 'tactical':
      default:
        return [0, 60, 60];
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const cycleViewMode = () => {
    const modes: Array<'tactical' | 'broadcast' | 'behind-goal'> = ['tactical', 'broadcast', 'behind-goal'];
    const currentIndex = modes.indexOf(viewMode);
    setViewMode(modes[(currentIndex + 1) % modes.length]);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <div ref={canvasRef} className="w-full h-[600px] lg:h-[700px] relative">
        <Canvas shadows>
          <Suspense fallback={null}>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={getCameraPosition()} fov={50} />
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              maxPolarAngle={Math.PI / 2.2}
              minDistance={20}
              maxDistance={150}
            />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[50, 50, 50]}
              intensity={0.8}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={200}
              shadow-camera-left={-60}
              shadow-camera-right={60}
              shadow-camera-top={60}
              shadow-camera-bottom={-60}
            />
            <pointLight position={[0, 30, 0]} intensity={0.3} />

            {/* Sky */}
            <Sky sunPosition={[100, 20, 100]} />

            {/* Environment */}
            <Environment preset="sunset" />

            {/* Football Field */}
            <Field3D />

            {/* Players */}
            {mockPlayers.map((player) => (
              <Player3D
                key={player.id}
                position={player.position}
                team={player.team}
                number={player.number}
                name={player.name}
                speed={player.speed}
                direction={player.direction}
              />
            ))}

            {/* Ball */}
            <Ball3D position={ballPosition} />

            {/* Heat Map (optional) */}
            {showHeatMap && <HeatMap3D points={heatMapPoints} team="home" />}

            {/* Grid helper (optional) */}
            {showGrid && <gridHelper args={[120, 24, '#444444', '#333333']} position={[0, 0.05, 0]} />}
          </Suspense>
        </Canvas>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
          <button
            onClick={handlePlayPause}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Reset"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>
          <div className="w-px bg-white/30 mx-2" />
          <button
            onClick={cycleViewMode}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Change view"
            title={`View: ${viewMode}`}
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 hover:bg-white/20 rounded-full transition-colors ${showGrid ? 'bg-white/20' : ''}`}
            aria-label="Toggle grid"
          >
            <Grid3x3 className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`p-2 hover:bg-white/20 rounded-full transition-colors ${showHeatMap ? 'bg-white/20' : ''}`}
            aria-label="Toggle heat map"
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* View Mode Indicator */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm">
          {viewMode === 'tactical' && '📊 Tactical View'}
          {viewMode === 'broadcast' && '📺 Broadcast View'}
          {viewMode === 'behind-goal' && '🎯 Behind Goal'}
        </div>

        {/* Timeline (placeholder for now) */}
        <div className="absolute bottom-20 left-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-white text-sm whitespace-nowrap">00:00</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentFrame / 100) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm whitespace-nowrap">90:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
