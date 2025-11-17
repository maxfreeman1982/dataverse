'use client';

import { useMemo, useRef } from 'react';
import { CatmullRomCurve3, Vector3, BufferGeometry, Line as ThreeLine } from 'three';
import { useFrame } from '@react-three/fiber';

interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface Trajectory3DProps {
  points: TrajectoryPoint[];
  color?: string;
  animated?: boolean;
  opacity?: number;
  lineWidth?: number;
}

/**
 * 3D Trajectory line with optional animation
 * Shows player or ball movement path
 */
export function Trajectory3D({
  points,
  color = '#10b981',
  animated = true,
  opacity = 0.8,
  lineWidth = 2,
}: Trajectory3DProps) {
  const lineRef = useRef<ThreeLine>(null);
  const animationRef = useRef(0);

  // Create smooth curve from points
  const curve = useMemo(() => {
    if (points.length < 2) return null;

    const vectors = points.map((p) => new Vector3(p.x, p.y, p.z));
    return new CatmullRomCurve3(vectors);
  }, [points]);

  // Animated dash effect
  useFrame((state, delta) => {
    if (animated && lineRef.current) {
      animationRef.current += delta * 2;
      // @ts-ignore - dashOffset exists on LineDashedMaterial
      if (lineRef.current.material.dashOffset !== undefined) {
        // @ts-ignore
        lineRef.current.material.dashOffset = -animationRef.current;
      }
    }
  });

  if (!curve) return null;

  const curvePoints = curve.getPoints(50);
  const geometry = new BufferGeometry().setFromPoints(curvePoints);

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial
        color={color}
        transparent
        opacity={opacity}
        linewidth={lineWidth}
        dashSize={0.5}
        gapSize={0.3}
      />
    </line>
  );
}

/**
 * Ball trajectory with parabolic arc
 */
export function BallTrajectory3D({
  start,
  end,
  height = 2,
  color = '#fbbf24',
}: {
  start: Vector3;
  end: Vector3;
  height?: number;
  color?: string;
}) {
  const curve = useMemo(() => {
    const midPoint = new Vector3().lerpVectors(start, end, 0.5);
    midPoint.y += height;

    return new CatmullRomCurve3([start, midPoint, end]);
  }, [start, end, height]);

  const curvePoints = curve.getPoints(30);
  const geometry = new BufferGeometry().setFromPoints(curvePoints);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.7} linewidth={3} />
    </line>
  );
}

/**
 * Passing network visualization
 * Shows connections between players with pass counts
 */
export function PassingNetwork3D({
  passes,
  playerPositions,
}: {
  passes: Array<{ from: string; to: string; count: number }>;
  playerPositions: Record<string, Vector3>;
}) {
  return (
    <group>
      {passes.map((pass, index) => {
        const fromPos = playerPositions[pass.from];
        const toPos = playerPositions[pass.to];

        if (!fromPos || !toPos) return null;

        // Line thickness based on pass count
        const thickness = Math.min(0.1 + pass.count * 0.02, 0.5);
        const opacity = Math.min(0.3 + pass.count * 0.05, 0.9);

        return (
          <group key={index}>
            {/* Pass line */}
            <mesh position={[
              (fromPos.x + toPos.x) / 2,
              (fromPos.y + toPos.y) / 2 + 0.5,
              (fromPos.z + toPos.z) / 2,
            ]}>
              <cylinderGeometry
                args={[
                  thickness / 2,
                  thickness / 2,
                  fromPos.distanceTo(toPos),
                  8,
                ]}
              />
              <meshBasicMaterial color="#3b82f6" transparent opacity={opacity} />
            </mesh>

            {/* Pass count label */}
            {pass.count > 2 && (
              <mesh
                position={[
                  (fromPos.x + toPos.x) / 2,
                  (fromPos.y + toPos.y) / 2 + 1.5,
                  (fromPos.z + toPos.z) / 2,
                ]}
              >
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
