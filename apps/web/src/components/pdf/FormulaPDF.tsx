import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Formula } from '@/graphql/perfume';
import { generateComplianceReport, type FormulaIngredientInput } from '@/lib/compliance';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #6366f1',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
    fontSize: 10,
    color: '#1e293b',
  },
  ingredientTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    marginBottom: 5,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1 solid #f1f5f9',
  },
  tableCell: {
    fontSize: 9,
    color: '#475569',
  },
  pyramidSection: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  pyramidTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  pyramidNote: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 2,
  },
  complianceSection: {
    marginTop: 15,
    padding: 12,
    borderRadius: 4,
  },
  compliantBg: {
    backgroundColor: '#f0fdf4',
    border: '2 solid #86efac',
  },
  nonCompliantBg: {
    backgroundColor: '#fef2f2',
    border: '2 solid #fca5a5',
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  compliantTitle: {
    color: '#16a34a',
  },
  nonCompliantTitle: {
    color: '#dc2626',
  },
  allergenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    fontSize: 9,
  },
  allergenName: {
    color: '#475569',
  },
  allergenCompliant: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  allergenViolation: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  warning: {
    backgroundColor: '#fff7ed',
    padding: 8,
    marginTop: 6,
    borderRadius: 4,
    border: '1 solid #fb923c',
  },
  warningText: {
    fontSize: 9,
    color: '#ea580c',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgePrimary: {
    backgroundColor: '#ddd6fe',
    color: '#6366f1',
  },
  badgeSecondary: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
});

interface FormulaPDFProps {
  formula: Formula;
}

export const FormulaPDF: React.FC<FormulaPDFProps> = ({ formula }) => {
  // Calculate compliance
  const formulaIngredients: FormulaIngredientInput[] = formula.ingredients.map((fi) => ({
    ingredient: fi.ingredient,
    percentage: fi.percentage,
  }));
  const complianceReport = generateComplianceReport(formulaIngredients);

  // Group ingredients by tenacity
  const topNotes = formula.ingredients.filter((fi) => fi.ingredient.tenacity === 'top');
  const heartNotes = formula.ingredients.filter((fi) => fi.ingredient.tenacity === 'heart');
  const baseNotes = formula.ingredients.filter((fi) => fi.ingredient.tenacity === 'base');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{formula.name}</Text>
          <Text style={styles.subtitle}>Perfume Architect Pro - Technical Specification Sheet</Text>
          <Text style={styles.subtitle}>Generated: {formatDate(new Date().toISOString())}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formula Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Formula ID:</Text>
            <Text style={styles.value}>{formula.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{formula.description || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Target Gender:</Text>
            <Text style={styles.value} style={{ textTransform: 'capitalize' }}>{formula.targetGender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Difficulty Level:</Text>
            <Text style={styles.value} style={{ textTransform: 'capitalize' }}>{formula.difficulty}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Ingredients:</Text>
            <Text style={styles.value}>{formula.ingredients.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>{formatDate(formula.createdAt)}</Text>
          </View>
        </View>

        {/* Olfactive Pyramid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Olfactive Pyramid</Text>

          {topNotes.length > 0 && (
            <View style={styles.pyramidSection}>
              <Text style={styles.pyramidTitle}>
                Top Notes ({topNotes.reduce((sum, fi) => sum + fi.percentage, 0).toFixed(1)}%)
              </Text>
              {topNotes.map((fi) => (
                <Text key={fi.id} style={styles.pyramidNote}>
                  • {fi.ingredient.name} - {fi.percentage.toFixed(2)}%
                </Text>
              ))}
            </View>
          )}

          {heartNotes.length > 0 && (
            <View style={styles.pyramidSection}>
              <Text style={styles.pyramidTitle}>
                Heart Notes ({heartNotes.reduce((sum, fi) => sum + fi.percentage, 0).toFixed(1)}%)
              </Text>
              {heartNotes.map((fi) => (
                <Text key={fi.id} style={styles.pyramidNote}>
                  • {fi.ingredient.name} - {fi.percentage.toFixed(2)}%
                </Text>
              ))}
            </View>
          )}

          {baseNotes.length > 0 && (
            <View style={styles.pyramidSection}>
              <Text style={styles.pyramidTitle}>
                Base Notes ({baseNotes.reduce((sum, fi) => sum + fi.percentage, 0).toFixed(1)}%)
              </Text>
              {baseNotes.map((fi) => (
                <Text key={fi.id} style={styles.pyramidNote}>
                  • {fi.ingredient.name} - {fi.percentage.toFixed(2)}%
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Complete Ingredient List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Ingredient List</Text>
          <View style={styles.ingredientTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: '40%' }]}>Ingredient</Text>
              <Text style={[styles.tableHeaderText, { width: '15%' }]}>%</Text>
              <Text style={[styles.tableHeaderText, { width: '20%' }]}>Note</Text>
              <Text style={[styles.tableHeaderText, { width: '25%' }]}>Family</Text>
            </View>
            {formula.ingredients.map((fi) => (
              <View key={fi.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '40%' }]}>{fi.ingredient.name}</Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>{fi.percentage.toFixed(2)}%</Text>
                <Text style={[styles.tableCell, { width: '20%', textTransform: 'capitalize' }]}>
                  {fi.ingredient.tenacity}
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>{fi.ingredient.olfactiveFamily.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compliance Status */}
        <View style={[
          styles.complianceSection,
          complianceReport.isFullyCompliant ? styles.compliantBg : styles.nonCompliantBg
        ]}>
          <Text style={[
            styles.complianceTitle,
            complianceReport.isFullyCompliant ? styles.compliantTitle : styles.nonCompliantTitle
          ]}>
            {complianceReport.isFullyCompliant ? '✓ Fully Compliant' : '⚠ Compliance Violations'}
          </Text>

          {complianceReport.allergenReports.length === 0 ? (
            <Text style={{ fontSize: 10, color: '#16a34a' }}>
              This formula contains no regulated allergens.
            </Text>
          ) : (
            <View>
              <Text style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>
                Allergen Analysis ({complianceReport.totalAllergenCount} detected):
              </Text>
              {complianceReport.allergenReports.map((report) => (
                <View key={report.allergen.id} style={styles.allergenRow}>
                  <Text style={styles.allergenName}>{report.allergen.name}</Text>
                  <Text style={report.isCompliant ? styles.allergenCompliant : styles.allergenViolation}>
                    {report.totalPercentage.toFixed(2)}% / {report.regulatoryLimit}% max
                    {!report.isCompliant && ` (EXCEEDS BY ${report.exceedsBy?.toFixed(2)}%)`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {complianceReport.warnings.length > 0 && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>WARNINGS:</Text>
              {complianceReport.warnings.map((warning, index) => (
                <Text key={index} style={[styles.warningText, { marginTop: 3 }]}>
                  • {warning}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Perfume Architect Pro © 2025 | This document is for internal use only
          </Text>
          <Text>
            Formula ID: {formula.id.substring(0, 12)}... | Page 1
          </Text>
        </View>
      </Page>
    </Document>
  );
};
