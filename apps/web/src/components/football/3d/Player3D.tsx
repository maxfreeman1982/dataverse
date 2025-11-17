'use client';

import { useRef, useMemo } from 'react';
import { Mesh, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface Player3DProps {
  position: [number, number, number];
  team: 'home' | 'away';
  number?: number;
  name?: string;
  isSelected?: boolean;
  speed?: number;
  direction?: number;
}

/**
 * 3D Player representation on the field
 * Shows player position, team color, number, and movement
 */
export function Player3D({
  position,
  team,
  number,
  name,
  isSelected = false,
  speed = 0,
  direction = 0,
}: Player3DProps) {
  const meshRef = useRef<Mesh>(null);
  const pulseRef = useRef(0);

  // Team colors
  const teamColor = team === 'home' ? '#3b82f6' : '#ef4444';
  const highlightColor = '#fbbf24';

  // Animation for selected player
  useFrame((state, delta) => {
    if (isSelected && meshRef.current) {
      pulseRef.current += delta * 2;
      const scale = 1 + Math.sin(pulseRef.current) * 0.1;
      meshRef.current.scale.set(scale, 1, scale);
    }
  });

  // Speed indicator (arrow showing direction and velocity)
  const speedVector = useMemo(() => {
    if (speed > 0) {
      const radians = (direction * Math.PI) / 180;
      return new Vector3(Math.cos(radians) * speed * 0.5, 0, Math.sin(radians) * speed * 0.5);
    }
    return null;
  }, [speed, direction]);

  return (
    <group position={position}>
      {/* Player cylinder (body) */}
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial
          color={isSelected ? highlightColor : teamColor}
          emissive={isSelected ? highlightColor : teamColor}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Player head */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffd4a3" roughness={0.7} />
      </mesh>

      {/* Jersey number on back */}
      {number && (
        <Html position={[0, 0.8, -0.35]} center distanceFactor={10}>
          <div
            style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              textShadow: '0 0 4px black',
              pointerEvents: 'none',
            }}
          >
            {number}
          </div>
        </Html>
      )}

      {/* Player name label (when selected) */}
      {isSelected && name && (
        <Html position={[0, 2, 0]} center distanceFactor={15}>
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {name}
          </div>
        </Html>
      )}

      {/* Speed indicator arrow */}
      {speedVector && speed > 1 && (
        <group>
          <arrowHelper args={[speedVector.normalize(), new Vector3(0, 0.1, 0), speedVector.length(), teamColor, 0.3, 0.2]} />
        </group>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={highlightColor} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Shadow circle */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Ball 3D representation
 */
export function Ball3D({ position }: { position: [number, number, number] }) {
  const ballRef = useRef<Mesh>(null);

  // Rotate ball slightly for realism
  useFrame((state, delta) => {
    if (ballRef.current) {
      ballRef.current.rotation.x += delta * 2;
      ballRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.11, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Ball shadow */}
      <mesh position={[0, -position[1] + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
