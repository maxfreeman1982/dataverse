'use client';

import { useQuery } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { GET_FORMULA_BY_ID, type Formula } from '@/graphql/perfume';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Shield, ShieldAlert, AlertTriangle, CheckCircle2, Download, FlaskConical } from 'lucide-react';
import { generateComplianceReport, getComplianceStatus, getComplianceColor, type FormulaIngredientInput } from '@/lib/compliance';
import { cn } from '@/lib/utils';

export default function ComplianceReportPage() {
  const params = useParams();
  const router = useRouter();
  const formulaId = params.id as string;

  const { data, loading } = useQuery<{ getFormulaById: Formula }>(GET_FORMULA_BY_ID, {
    variables: { id: formulaId },
  });

  const formula = data?.getFormulaById;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading compliance report...</p>
        </div>
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Formula not found</h3>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Convert formula ingredients to the format expected by compliance calculator
  const formulaIngredients: FormulaIngredientInput[] = formula.ingredients.map((fi) => ({
    ingredient: fi.ingredient,
    percentage: fi.percentage,
  }));

  const complianceReport = generateComplianceReport(formulaIngredients);
  const complianceStatus = getComplianceStatus(complianceReport);

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
            <h2 className="text-3xl font-bold tracking-tight">Compliance Report</h2>
            <p className="text-muted-foreground">{formula.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overview Card */}
        <Card className={cn(
          "lg:col-span-1 border-2",
          complianceReport.isFullyCompliant ? "border-green-500" : "border-orange-500"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {complianceReport.isFullyCompliant ? (
                <Shield className="h-6 w-6 text-green-600" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-orange-600" />
              )}
              <CardTitle>Overall Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge variant={complianceStatus.variant} className="text-lg px-4 py-2">
                {complianceStatus.label}
              </Badge>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Ingredients</span>
                <span className="font-semibold">{formula.ingredients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Allergens Detected</span>
                <span className="font-semibold">{complianceReport.totalAllergenCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Violations</span>
                <span className={cn(
                  "font-semibold",
                  complianceReport.violationCount === 0 ? "text-green-600" : "text-red-600"
                )}>
                  {complianceReport.violationCount}
                </span>
              </div>
            </div>

            {complianceReport.isFullyCompliant ? (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">Compliant Formula</p>
                  <p className="text-xs text-green-700">All allergen concentrations are within regulatory limits</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Action Required</p>
                  <p className="text-xs text-orange-700">This formula exceeds regulatory limits and needs adjustment</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Violations Section */}
          {complianceReport.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <CardTitle>Compliance Violations</CardTitle>
                </div>
                <CardDescription>
                  {complianceReport.violationCount} allergen{complianceReport.violationCount > 1 ? 's exceed' : ' exceeds'} regulatory limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceReport.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-900 font-medium">{warning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Allergen Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Allergen Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of allergen concentrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceReport.allergenReports.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Allergen-Free Formula</h3>
                  <p className="text-sm text-muted-foreground">
                    This formula does not contain any regulated allergens
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {complianceReport.allergenReports.map((report) => {
                    const color = getComplianceColor(report.totalPercentage, report.regulatoryLimit);
                    return (
                      <div key={report.allergen.id} className="space-y-3 pb-6 border-b last:border-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{report.allergen.name}</h4>
                            {report.allergen.casNumber && (
                              <p className="text-sm text-muted-foreground">CAS: {report.allergen.casNumber}</p>
                            )}
                          </div>
                          <Badge variant={report.isCompliant ? 'default' : 'destructive'}>
                            {report.isCompliant ? 'Compliant' : 'Violation'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Concentration</span>
                            <span className={cn(
                              "font-semibold text-lg",
                              color === 'green' ? 'text-green-600' :
                              color === 'orange' ? 'text-orange-600' :
                              'text-red-600'
                            )}>
                              {report.totalPercentage.toFixed(2)}% / {report.regulatoryLimit}% max
                            </span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all",
                                color === 'green' ? 'bg-green-600' :
                                color === 'orange' ? 'bg-orange-600' :
                                'bg-red-600'
                              )}
                              style={{ width: `${Math.min((report.totalPercentage / report.regulatoryLimit) * 100, 100)}%` }}
                            />
                          </div>
                          {!report.isCompliant && report.exceedsBy && (
                            <p className="text-sm text-red-600 font-medium">
                              Exceeds limit by {report.exceedsBy.toFixed(2)}%
                            </p>
                          )}
                        </div>

                        {report.affectedIngredients.length > 0 && (
                          <div className="space-y-2 pt-3 border-t">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">
                              Contributing Ingredients ({report.affectedIngredients.length})
                            </Label>
                            <div className="space-y-2">
                              {report.affectedIngredients.map((ai) => (
                                <div key={ai.ingredient.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span className="text-sm">{ai.ingredient.name}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {ai.ingredient.tenacity}
                                    </Badge>
                                    <span className="text-sm font-medium">{ai.contributedPercentage.toFixed(2)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          {!complianceReport.isFullyCompliant && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Suggested actions to achieve compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Reduce allergen-containing ingredients</h4>
                      <p className="text-sm text-muted-foreground">
                        Lower the percentage of ingredients that contribute to the violation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Substitute with allergen-free alternatives</h4>
                      <p className="text-sm text-muted-foreground">
                        Replace problematic ingredients with similar ones that don't contain the allergen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Rebalance formula composition</h4>
                      <p className="text-sm text-muted-foreground">
                        Adjust the overall formula to dilute allergen concentration while maintaining character
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}
