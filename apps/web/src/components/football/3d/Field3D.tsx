'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

/**
 * 3D Football Field Component
 * Renders a realistic 3D football pitch with markings
 */
export function Field3D() {
  const fieldRef = useRef<Mesh>(null);

  // FIFA standard pitch dimensions (in meters)
  const FIELD_LENGTH = 105;
  const FIELD_WIDTH = 68;
  const PENALTY_AREA_LENGTH = 16.5;
  const PENALTY_AREA_WIDTH = 40.3;
  const GOAL_AREA_LENGTH = 5.5;
  const GOAL_AREA_WIDTH = 18.3;
  const CENTER_CIRCLE_RADIUS = 9.15;

  return (
    <group>
      {/* Main grass field */}
      <mesh ref={fieldRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[FIELD_LENGTH, FIELD_WIDTH]} />
        <meshStandardMaterial color="#1e8449" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Field markings (white lines) */}
      <LineMarkings
        length={FIELD_LENGTH}
        width={FIELD_WIDTH}
        penaltyAreaLength={PENALTY_AREA_LENGTH}
        penaltyAreaWidth={PENALTY_AREA_WIDTH}
        goalAreaLength={GOAL_AREA_LENGTH}
        goalAreaWidth={GOAL_AREA_WIDTH}
        centerCircleRadius={CENTER_CIRCLE_RADIUS}
      />

      {/* Goals */}
      <Goal position={[-FIELD_LENGTH / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Goal position={[FIELD_LENGTH / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Grass stripes pattern */}
      <GrassStripes length={FIELD_LENGTH} width={FIELD_WIDTH} />
    </group>
  );
}

/**
 * Field line markings component
 */
function LineMarkings({
  length,
  width,
  penaltyAreaLength,
  penaltyAreaWidth,
  goalAreaLength,
  goalAreaWidth,
  centerCircleRadius,
}: {
  length: number;
  width: number;
  penaltyAreaLength: number;
  penaltyAreaWidth: number;
  goalAreaLength: number;
  goalAreaWidth: number;
  centerCircleRadius: number;
}) {
  const lineHeight = 0.02;
  const lineColor = '#ffffff';

  return (
    <group position={[0, lineHeight, 0]}>
      {/* Outer boundary */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[length / 2 - 0.05, length / 2 + 0.05, 4, 1]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Center line */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, width]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[centerCircleRadius - 0.05, centerCircleRadius + 0.05, 64]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Center spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Penalty areas - Left */}
      <PenaltyArea
        position={[-length / 2 + penaltyAreaLength / 2, 0, 0]}
        length={penaltyAreaLength}
        width={penaltyAreaWidth}
        goalAreaLength={goalAreaLength}
        goalAreaWidth={goalAreaWidth}
        lineColor={lineColor}
        side="left"
      />

      {/* Penalty areas - Right */}
      <PenaltyArea
        position={[length / 2 - penaltyAreaLength / 2, 0, 0]}
        length={penaltyAreaLength}
        width={penaltyAreaWidth}
        goalAreaLength={goalAreaLength}
        goalAreaWidth={goalAreaWidth}
        lineColor={lineColor}
        side="right"
      />
    </group>
  );
}

/**
 * Penalty area with goal box and penalty spot
 */
function PenaltyArea({
  position,
  length,
  width,
  goalAreaLength,
  goalAreaWidth,
  lineColor,
  side,
}: {
  position: [number, number, number];
  length: number;
  width: number;
  goalAreaLength: number;
  goalAreaWidth: number;
  lineColor: string;
  side: 'left' | 'right';
}) {
  const penaltySpotDistance = 11;
  const penaltyArcRadius = 9.15;

  return (
    <group position={position}>
      {/* Penalty box outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.sqrt((length / 2) ** 2 + (width / 2) ** 2) - 0.05, Math.sqrt((length / 2) ** 2 + (width / 2) ** 2) + 0.05, 4, 1]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.8} />
      </mesh>

      {/* Goal box (small box) */}
      <mesh position={[side === 'left' ? -length / 2 + goalAreaLength / 2 : length / 2 - goalAreaLength / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.sqrt((goalAreaLength / 2) ** 2 + (goalAreaWidth / 2) ** 2) - 0.05, Math.sqrt((goalAreaLength / 2) ** 2 + (goalAreaWidth / 2) ** 2) + 0.05, 4, 1]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.8} />
      </mesh>

      {/* Penalty spot */}
      <mesh
        position={[side === 'left' ? -length / 2 + penaltySpotDistance : length / 2 - penaltySpotDistance, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Penalty arc */}
      <mesh
        position={[side === 'left' ? -length / 2 + penaltySpotDistance : length / 2 - penaltySpotDistance, 0, 0]}
        rotation={[-Math.PI / 2, 0, side === 'left' ? 0 : Math.PI]}
      >
        <ringGeometry args={[penaltyArcRadius - 0.05, penaltyArcRadius + 0.05, 64, 1, 0, Math.PI]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>
    </group>
  );
}

/**
 * Goal posts and net
 */
function Goal({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const GOAL_WIDTH = 7.32;
  const GOAL_HEIGHT = 2.44;
  const GOAL_DEPTH = 2;

  return (
    <group position={position} rotation={rotation}>
      {/* Left post */}
      <mesh position={[-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, GOAL_HEIGHT, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Right post */}
      <mesh position={[GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, GOAL_HEIGHT, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, GOAL_HEIGHT, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, GOAL_WIDTH, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Net (simplified as wireframe) */}
      <mesh position={[0, GOAL_HEIGHT / 2, -GOAL_DEPTH / 2]}>
        <boxGeometry args={[GOAL_WIDTH, GOAL_HEIGHT, GOAL_DEPTH]} />
        <meshBasicMaterial color="#ffffff" wireframe opacity={0.3} transparent />
      </mesh>
    </group>
  );
}

/**
 * Grass stripes for realistic appearance
 */
function GrassStripes({ length, width }: { length: number; width: number }) {
  const stripeCount = 14;
  const stripeWidth = length / stripeCount;

  return (
    <group position={[0, 0.01, 0]}>
      {Array.from({ length: stripeCount }).map((_, i) => {
        if (i % 2 === 0) {
          return (
            <mesh key={i} position={[-length / 2 + i * stripeWidth + stripeWidth / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[stripeWidth, width]} />
              <meshStandardMaterial color="#1a7a3e" roughness={0.8} metalness={0.2} transparent opacity={0.3} />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
}
