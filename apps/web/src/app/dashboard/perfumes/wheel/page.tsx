'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { GET_ALL_OLFACTIVE_FAMILIES, GET_ALL_INGREDIENTS, type OlfactiveFamily, type Ingredient } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';

// Color palette for the wheel
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  '#E63946', '#A8DADC', '#457B9D', '#F1FAEE', '#E9C46A',
  '#F4A261', '#E76F51', '#2A9D8F', '#264653', '#E9D8A6',
];

export default function ScentWheelPage() {
  const router = useRouter();
  const [selectedFamily, setSelectedFamily] = useState<OlfactiveFamily | null>(null);
  const [hoveredFamily, setHoveredFamily] = useState<string | null>(null);

  const { data: familiesData } = useQuery<{ getAllOlfactiveFamilies: OlfactiveFamily[] }>(GET_ALL_OLFACTIVE_FAMILIES);
  const { data: ingredientsData } = useQuery<{ getAllIngredients: Ingredient[] }>(GET_ALL_INGREDIENTS);

  const families = familiesData?.getAllOlfactiveFamilies || [];
  const ingredients = ingredientsData?.getAllIngredients || [];

  // Get ingredients for selected family
  const selectedIngredients = selectedFamily
    ? ingredients.filter((i) => i.olfactiveFamily.id === selectedFamily.id)
    : [];

  // Calculate wheel segments
  const centerX = 200;
  const centerY = 200;
  const radius = 150;
  const innerRadius = 60;
  const angleStep = (2 * Math.PI) / families.length;

  const createWedgePath = (index: number) => {
    const startAngle = index * angleStep - Math.PI / 2;
    const endAngle = (index + 1) * angleStep - Math.PI / 2;

    const outerStartX = centerX + radius * Math.cos(startAngle);
    const outerStartY = centerY + radius * Math.sin(startAngle);
    const outerEndX = centerX + radius * Math.cos(endAngle);
    const outerEndY = centerY + radius * Math.sin(endAngle);

    const innerStartX = centerX + innerRadius * Math.cos(startAngle);
    const innerStartY = centerY + innerRadius * Math.sin(startAngle);
    const innerEndX = centerX + innerRadius * Math.cos(endAngle);
    const innerEndY = centerY + innerRadius * Math.sin(endAngle);

    const largeArcFlag = angleStep > Math.PI ? 1 : 0;

    return `
      M ${innerStartX} ${innerStartY}
      L ${outerStartX} ${outerStartY}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}
      Z
    `;
  };

  const getLabelPosition = (index: number) => {
    const angle = (index + 0.5) * angleStep - Math.PI / 2;
    const labelRadius = (radius + innerRadius) / 2;
    return {
      x: centerX + labelRadius * Math.cos(angle),
      y: centerY + labelRadius * Math.sin(angle),
    };
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CircleDot className="h-8 w-8 text-indigo-600" />
              Roue des Senteurs
            </h2>
            <p className="text-muted-foreground">
              Interactive olfactive family wheel for visual navigation
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Wheel Visualization */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Olfactive Families Wheel</CardTitle>
            <CardDescription>
              Click on a segment to explore ingredients
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <svg
              width="450"
              height="450"
              viewBox="0 0 400 400"
              className="drop-shadow-lg"
            >
              {/* Wheel segments */}
              {families.map((family, index) => {
                const isSelected = selectedFamily?.id === family.id;
                const isHovered = hoveredFamily === family.id;
                const color = COLORS[index % COLORS.length];

                return (
                  <g key={family.id}>
                    <path
                      d={createWedgePath(index)}
                      fill={color}
                      opacity={isSelected ? 1 : isHovered ? 0.8 : 0.6}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedFamily(family)}
                      onMouseEnter={() => setHoveredFamily(family.id)}
                      onMouseLeave={() => setHoveredFamily(null)}
                      style={{
                        transform: isSelected || isHovered ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: `${centerX}px ${centerY}px`,
                      }}
                    />
                    {/* Label */}
                    <text
                      x={getLabelPosition(index).x}
                      y={getLabelPosition(index).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {family.name.length > 12
                        ? family.name.substring(0, 10) + '...'
                        : family.name}
                    </text>
                  </g>
                );
              })}

              {/* Center circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={innerRadius}
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              <text
                x={centerX}
                y={centerY - 10}
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#374151"
              >
                {families.length}
              </text>
              <text
                x={centerX}
                y={centerY + 10}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                Families
              </text>
            </svg>
          </CardContent>
        </Card>

        {/* Family Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedFamily ? selectedFamily.name : 'Select a Family'}
            </CardTitle>
            <CardDescription>
              {selectedFamily
                ? selectedFamily.description
                : 'Click on a segment in the wheel'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFamily ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-semibold">Ingredients:</span>
                  <Badge variant="default">{selectedIngredients.length}</Badge>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() =>
                        (window.location.href = `/dashboard/perfumes/ingredients/${ingredient.id}`)
                      }
                    >
                      <div className="font-medium mb-1">{ingredient.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {ingredient.description}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {ingredient.tenacity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {ingredient.diffusion}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {selectedIngredients.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No ingredients in this family yet
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => setSelectedFamily(null)}
                  variant="outline"
                >
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <CircleDot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Click on a segment in the wheel to explore ingredients
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Family Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Family Legend</CardTitle>
          <CardDescription>All olfactive families with ingredient counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {families.map((family, index) => {
              const count = ingredients.filter((i) => i.olfactiveFamily.id === family.id).length;
              const color = COLORS[index % COLORS.length];

              return (
                <div
                  key={family.id}
                  className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-all',
                    selectedFamily?.id === family.id ? 'ring-2 ring-offset-2' : 'hover:border-gray-400'
                  )}
                  style={{
                    borderColor: color,
                    backgroundColor: `${color}10`,
                  }}
                  onClick={() => setSelectedFamily(family)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-sm">{family.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{count} ingredients</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
