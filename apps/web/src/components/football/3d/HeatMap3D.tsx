'use client';

import { useMemo } from 'react';
import { Color } from 'three';

interface HeatMapPoint {
  x: number;
  z: number;
  intensity: number; // 0-1
}

interface HeatMap3DProps {
  points: HeatMapPoint[];
  gridSize?: number;
  maxHeight?: number;
  team?: 'home' | 'away';
}

/**
 * 3D Heat Map visualization
 * Shows player occupation zones with color-coded intensity
 */
export function HeatMap3D({ points, gridSize = 20, maxHeight = 3, team = 'home' }: HeatMap3DProps) {
  const heatMapData = useMemo(() => {
    if (!points || points.length === 0) return [];

    // Create grid
    const grid: number[][] = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(0));

    // Field dimensions
    const fieldLength = 105;
    const fieldWidth = 68;
    const cellLength = fieldLength / gridSize;
    const cellWidth = fieldWidth / gridSize;

    // Populate grid with intensities
    points.forEach((point) => {
      const gridX = Math.floor((point.x + fieldLength / 2) / cellLength);
      const gridZ = Math.floor((point.z + fieldWidth / 2) / cellWidth);

      if (gridX >= 0 && gridX < gridSize && gridZ >= 0 && gridZ < gridSize) {
        grid[gridX][gridZ] += point.intensity;
      }
    });

    // Normalize and create bars
    const maxIntensity = Math.max(...grid.flat());
    const bars: Array<{ position: [number, number, number]; height: number; intensity: number }> = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const intensity = grid[i][j] / maxIntensity;
        if (intensity > 0.1) {
          const x = -fieldLength / 2 + i * cellLength + cellLength / 2;
          const z = -fieldWidth / 2 + j * cellWidth + cellWidth / 2;
          const height = intensity * maxHeight;

          bars.push({
            position: [x, height / 2, z],
            height,
            intensity,
          });
        }
      }
    });

    return bars;
  }, [points, gridSize, maxHeight]);

  // Color gradient based on team and intensity
  const getColor = (intensity: number) => {
    const baseColor = team === 'home' ? new Color('#3b82f6') : new Color('#ef4444');
    const color = baseColor.clone();
    color.lerp(new Color('#ffffff'), 1 - intensity);
    return color;
  };

  return (
    <group>
      {heatMapData.map((bar, index) => (
        <mesh key={index} position={bar.position} castShadow>
          <boxGeometry args={[105 / gridSize * 0.9, bar.height, 68 / gridSize * 0.9]} />
          <meshStandardMaterial
            color={getColor(bar.intensity)}
            transparent
            opacity={0.6 + bar.intensity * 0.4}
            emissive={getColor(bar.intensity)}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
