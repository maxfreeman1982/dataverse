'use client';

import { useEffect, useRef } from 'react';

interface Player {
  x: number; // meters from center (-52.5 to 52.5)
  y: number; // meters from center (-34 to 34)
  team: 'home' | 'away';
  number?: number;
  label?: string;
}

interface Ball {
  x: number;
  y: number;
}

interface FieldVisualizationProps {
  players?: Player[];
  ball?: Ball;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showZones?: boolean;
}

export function FieldVisualization({
  players = [],
  ball,
  width = 800,
  height = 520,
  showGrid = false,
  showZones = false,
}: FieldVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Field dimensions (standard: 105m x 68m)
    const fieldLength = 105; // meters
    const fieldWidth = 68; // meters
    const scale = Math.min(width / fieldLength, height / fieldWidth);
    const offsetX = (width - fieldLength * scale) / 2;
    const offsetY = (height - fieldWidth * scale) / 2;

    // Convert field coordinates to canvas coordinates
    const toCanvasX = (x: number) => offsetX + (x + fieldLength / 2) * scale;
    const toCanvasY = (y: number) => offsetY + (y + fieldWidth / 2) * scale;

    // Draw field background
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(offsetX, offsetY, fieldLength * scale, fieldWidth * scale);

    // Draw field lines
    ctx.strokeStyle = '#475569'; // slate-600
    ctx.lineWidth = 2;

    // Outer boundary
    ctx.strokeRect(offsetX, offsetY, fieldLength * scale, fieldWidth * scale);

    // Center line
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), offsetY);
    ctx.lineTo(toCanvasX(0), offsetY + fieldWidth * scale);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(toCanvasX(0), toCanvasY(0), 9.15 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Penalty areas
    const drawPenaltyArea = (side: 'left' | 'right') => {
      const x = side === 'left' ? -fieldLength / 2 : fieldLength / 2 - 16.5;
      const y = -20.15;

      ctx.strokeRect(
        toCanvasX(x),
        toCanvasY(y),
        16.5 * scale,
        40.3 * scale
      );

      // Goal area
      const gx = side === 'left' ? -fieldLength / 2 : fieldLength / 2 - 5.5;
      const gy = -9.15;
      ctx.strokeRect(
        toCanvasX(gx),
        toCanvasY(gy),
        5.5 * scale,
        18.3 * scale
      );

      // Penalty spot
      const px = side === 'left' ? -fieldLength / 2 + 11 : fieldLength / 2 - 11;
      ctx.beginPath();
      ctx.arc(toCanvasX(px), toCanvasY(0), 2, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPenaltyArea('left');
    drawPenaltyArea('right');

    // Draw zones if enabled
    if (showZones) {
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      // Thirds
      ctx.beginPath();
      ctx.moveTo(toCanvasX(-fieldLength / 6), offsetY);
      ctx.lineTo(toCanvasX(-fieldLength / 6), offsetY + fieldWidth * scale);
      ctx.moveTo(toCanvasX(fieldLength / 6), offsetY);
      ctx.lineTo(toCanvasX(fieldLength / 6), offsetY + fieldWidth * scale);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;

      for (let x = -50; x <= 50; x += 10) {
        ctx.beginPath();
        ctx.moveTo(toCanvasX(x), offsetY);
        ctx.lineTo(toCanvasX(x), offsetY + fieldWidth * scale);
        ctx.stroke();
      }

      for (let y = -30; y <= 30; y += 10) {
        ctx.beginPath();
        ctx.moveTo(offsetX, toCanvasY(y));
        ctx.lineTo(offsetX + fieldLength * scale, toCanvasY(y));
        ctx.stroke();
      }
    }

    // Draw players
    players.forEach((player) => {
      const x = toCanvasX(player.x);
      const y = toCanvasY(player.y);

      // Player circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = player.team === 'home' ? '#3b82f6' : '#10b981'; // blue-500 : emerald-500
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Player number/label
      if (player.number || player.label) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(player.number || player.label), x, y);
      }
    });

    // Draw ball
    if (ball) {
      const x = toCanvasX(ball.x);
      const y = toCanvasY(ball.y);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [players, ball, width, height, showGrid, showZones]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl border border-slate-700"
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-lg text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Home</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-lg text-sm">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Away</span>
        </div>
      </div>
    </div>
  );
}
