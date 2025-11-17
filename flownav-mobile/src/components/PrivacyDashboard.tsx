/**
 * FlowNav - Privacy Dashboard Component
 * Displays privacy metrics and user contributions with full transparency
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import type { PrivacyMetrics, UserStatistics } from '../types';

interface PrivacyDashboardProps {
  privacyMetrics: PrivacyMetrics;
  userStats: UserStatistics;
  sharingEnabled: boolean;
  onToggleSharing: (enabled: boolean) => void;
  onPurgeData: () => void;
  onViewPrivacyPolicy: () => void;
}

export const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({
  privacyMetrics,
  userStats,
  sharingEnabled,
  onToggleSharing,
  onPurgeData,
  onViewPrivacyPolicy,
}) => {
  const idExpiresIn = Math.floor(privacyMetrics.currentDeviceIdAge / 60);
  const idAgePercent = (privacyMetrics.currentDeviceIdAge / (15 * 60)) * 100;

  return (
    <ScrollView style={styles.container}>
      {/* Privacy Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Statut Confidentialité</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Partage de données</Text>
          <Switch
            value={sharingEnabled}
            onValueChange={onToggleSharing}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
            thumbColor={sharingEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {sharingEnabled && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>✓ Données transmises anonymes</Text>
              <Text style={styles.infoText}>
                • Aucune position GPS brute{'\n'}
                • ID éphémère rotatif toutes les 10-15 min{'\n'}
                • Agrégation k≥3 véhicules minimum{'\n'}
                • Segments hachés non-réversibles
              </Text>
            </View>

            {/* ID Rotation Status */}
            <View style={styles.rotationContainer}>
              <View style={styles.rotationHeader}>
                <Text style={styles.rotationLabel}>Rotation ID dans</Text>
                <Text style={styles.rotationTime}>{idExpiresIn} min</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${idAgePercent}%` }]} />
              </View>
              <Text style={styles.rotationHelp}>
                Votre identifiant change automatiquement pour empêcher tout suivi
              </Text>
            </View>
          </>
        )}

        {!sharingEnabled && (
          <View style={[styles.infoBox, styles.infoBoxWarning]}>
            <Text style={styles.infoTitle}>⚠️ Mode Hors Ligne</Text>
            <Text style={styles.infoText}>
              Prédictions limitées. FlowNav fonctionne avec données locales uniquement.
              Activez le partage pour bénéficier des prédictions optimales.
            </Text>
          </View>
        )}
      </View>

      {/* Privacy Metrics Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Métriques Confidentialité</Text>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Agrégats envoyés aujourd'hui</Text>
          <Text style={styles.metricValue}>{privacyMetrics.aggregatesSentToday}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Violations k-anonymité</Text>
          <Text style={[styles.metricValue, styles.metricSuccess]}>
            {privacyMetrics.kAnonymityViolations}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Données purgées (7j)</Text>
          <Text style={styles.metricValue}>{privacyMetrics.dataPurgedCount}</Text>
        </View>

        <Text style={styles.helpText}>
          💡 k-anonymité : chaque agrégat contient ≥3 véhicules (impossible d'identifier un individu)
        </Text>
      </View>

      {/* User Contributions Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌍 Vos Contributions</Text>

        <View style={styles.statGrid}>
          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>{userStats.totalTrips}</Text>
            <Text style={styles.statGridLabel}>trajets</Text>
          </View>

          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>
              {Math.round(userStats.totalTimeSavedMinutes)}
            </Text>
            <Text style={styles.statGridLabel}>min gagnées</Text>
          </View>

          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>
              {Math.round(userStats.totalCo2SavedGrams / 1000)}
            </Text>
            <Text style={styles.statGridLabel}>kg CO₂ évités</Text>
          </View>

          <View style={styles.statGridItem}>
            <Text style={styles.statGridValue}>
              {userStats.contributedAggregatesCount}
            </Text>
            <Text style={styles.statGridLabel}>agrégats partagés</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            En partageant des données anonymes, vous aidez la communauté FlowNav
            à améliorer les prédictions pour tous. Merci ! 🙏
          </Text>
        </View>
      </View>

      {/* GDPR Compliance Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚖️ Conformité RGPD</Text>

        <View style={styles.gdprList}>
          <View style={styles.gdprItem}>
            <Text style={styles.gdprIcon}>✓</Text>
            <Text style={styles.gdprText}>
              <Text style={styles.gdprBold}>Anonymisation irréversible</Text> : aucune donnée
              personnelle conservée
            </Text>
          </View>

          <View style={styles.gdprItem}>
            <Text style={styles.gdprIcon}>✓</Text>
            <Text style={styles.gdprText}>
              <Text style={styles.gdprBold}>Minimisation</Text> : uniquement données
              nécessaires collectées
            </Text>
          </View>

          <View style={styles.gdprItem}>
            <Text style={styles.gdprIcon}>✓</Text>
            <Text style={styles.gdprText}>
              <Text style={styles.gdprBold}>Consentement</Text> : vous contrôlez le partage
              (opt-in)
            </Text>
          </View>

          <View style={styles.gdprItem}>
            <Text style={styles.gdprIcon}>✓</Text>
            <Text style={styles.gdprText}>
              <Text style={styles.gdprBold}>Rétention limitée</Text> : 7 jours local,
              90 jours cloud
            </Text>
          </View>

          <View style={styles.gdprItem}>
            <Text style={styles.gdprIcon}>✓</Text>
            <Text style={styles.gdprText}>
              <Text style={styles.gdprBold}>Droit à l'effacement</Text> : purge immédiate
              sur demande
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={onViewPrivacyPolicy}
        >
          <Text style={styles.linkButtonText}>📄 Consulter la Politique de Confidentialité</Text>
        </TouchableOpacity>
      </View>

      {/* Data Purge Card */}
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardTitle}>🗑️ Gestion des Données</Text>

        <Text style={styles.dangerText}>
          Vous pouvez supprimer toutes vos données locales à tout moment.
          Cette action est irréversible.
        </Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={onPurgeData}
        >
          <Text style={styles.dangerButtonText}>Supprimer Toutes Mes Données</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Vos données serveur (agrégats anonymes) seront automatiquement purgées
          après 90 jours selon notre politique RGPD.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  // Status Row
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },

  // Info Box
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoBoxWarning: {
    backgroundColor: '#FFF3E0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },

  // ID Rotation
  rotationContainer: {
    marginTop: 8,
  },
  rotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rotationLabel: {
    fontSize: 14,
    color: '#666',
  },
  rotationTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  rotationHelp: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Metrics
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metricSuccess: {
    color: '#4CAF50',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    lineHeight: 18,
  },

  // Stat Grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statGridItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statGridValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statGridLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // GDPR List
  gdprList: {
    marginBottom: 16,
  },
  gdprItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gdprIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  gdprText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  gdprBold: {
    fontWeight: '600',
    color: '#333',
  },

  // Buttons
  linkButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },

  // Danger Card
  dangerCard: {
    borderColor: '#f44336',
    borderWidth: 1,
  },
  dangerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  dangerButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f44336',
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default PrivacyDashboard;
