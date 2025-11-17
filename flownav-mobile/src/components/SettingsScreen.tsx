/**
 * FlowNav - Settings Screen
 * Advanced user settings with privacy controls and preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Slider,
} from 'react-native';

export interface Settings {
  // Privacy
  dataSharing: boolean;
  anonymousMode: boolean;
  idRotationMinutes: number;
  autoDataPurge: boolean;

  // Notifications
  notificationsEnabled: boolean;
  departureReminders: boolean;
  trafficAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  advanceNoticeMinutes: number;

  // Navigation
  flexibilityMinutes: number;
  avoidTolls: boolean;
  avoidHighways: boolean;
  optimizeFor: 'time' | 'distance' | 'eco';
  showTrafficLayer: boolean;
  autoRecalculate: boolean;

  // Display
  darkMode: boolean;
  mapStyle: 'standard' | 'satellite' | 'hybrid';
  units: 'metric' | 'imperial';
  language: 'fr' | 'en';

  // Advanced
  developerMode: boolean;
  betaFeatures: boolean;
}

interface SettingsScreenProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onResetSettings: () => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSettingsChange,
  onResetSettings,
  onExportData,
  onDeleteAccount,
}) => {
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Réinitialiser les Paramètres',
      'Voulez-vous vraiment réinitialiser tous les paramètres par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: onResetSettings,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le Compte',
      'ATTENTION : Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Êtes-vous absolument sûr ?',
              'Dernière confirmation avant suppression définitive.',
              [
                { text: 'Non, annuler', style: 'cancel' },
                {
                  text: 'Oui, supprimer',
                  style: 'destructive',
                  onPress: onDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Confidentialité & Sécurité</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Partage de données</Text>
            <Text style={styles.settingDescription}>
              Contribuer aux prédictions (données k-anonymes)
            </Text>
          </View>
          <Switch
            value={settings.dataSharing}
            onValueChange={value => updateSetting('dataSharing', value)}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Mode anonyme renforcé</Text>
            <Text style={styles.settingDescription}>
              Rotation ID plus fréquente (toutes les 5 min)
            </Text>
          </View>
          <Switch
            value={settings.anonymousMode}
            onValueChange={value => updateSetting('anonymousMode', value)}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Purge auto des données</Text>
            <Text style={styles.settingDescription}>
              Suppression locale après 3 jours (au lieu de 7)
            </Text>
          </View>
          <Switch
            value={settings.autoDataPurge}
            onValueChange={value => updateSetting('autoDataPurge', value)}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Privacy Policy', 'Ouvre la politique de confidentialité...')}>
          <Text style={styles.buttonText}>📄 Consulter la Politique de Confidentialité</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Notifications activées</Text>
            <Text style={styles.settingDescription}>
              Recevoir toutes les notifications
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={value => updateSetting('notificationsEnabled', value)}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>

        {settings.notificationsEnabled && (
          <>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingTitle}>Rappels de départ</Text>
                <Text style={styles.settingDescription}>
                  Notif quand c'est le moment optimal
                </Text>
              </View>
              <Switch
                value={settings.departureReminders}
                onValueChange={value => updateSetting('departureReminders', value)}
                trackColor={{ false: '#ddd', true: '#2196F3' }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingTitle}>Alertes trafic</Text>
                <Text style={styles.settingDescription}>
                  Ondes de choc, accidents, embouteillages
                </Text>
              </View>
              <Switch
                value={settings.trafficAlerts}
                onValueChange={value => updateSetting('trafficAlerts', value)}
                trackColor={{ false: '#ddd', true: '#2196F3' }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingTitle}>Son</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={value => updateSetting('soundEnabled', value)}
                trackColor={{ false: '#ddd', true: '#2196F3' }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingTitle}>Vibration</Text>
              </View>
              <Switch
                value={settings.vibrationEnabled}
                onValueChange={value => updateSetting('vibrationEnabled', value)}
                trackColor={{ false: '#ddd', true: '#2196F3' }}
              />
            </View>

            <View style={styles.sliderRow}>
              <Text style={styles.sliderTitle}>
                Préavis avant départ : {settings.advanceNoticeMinutes} min
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={15}
                step={1}
                value={settings.advanceNoticeMinutes}
                onValueChange={value => updateSetting('advanceNoticeMinutes', value)}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
              />
            </View>
          </>
        )}
      </View>

      {/* Navigation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧭 Navigation</Text>

        <View style={styles.sliderRow}>
          <Text style={styles.sliderTitle}>
            Flexibilité départ : {settings.flexibilityMinutes} min
          </Text>
          <Text style={styles.sliderDescription}>
            Fenêtre de recherche t₀ optimal
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={60}
            step={5}
            value={settings.flexibilityMinutes}
            onValueChange={value => updateSetting('flexibilityMinutes', value)}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#ddd"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Éviter les péages</Text>
          </View>
          <Switch
            value={settings.avoidTolls}
            onValueChange={value => updateSetting('avoidTolls', value)}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Éviter les autoroutes</Text>
          </View>
          <Switch
            value={settings.avoidHighways}
            onValueChange={value => updateSetting('avoidHighways', value)}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Afficher couche trafic</Text>
            <Text style={styles.settingDescription}>
              Couleurs sur carte selon congestion
            </Text>
          </View>
          <Switch
            value={settings.showTrafficLayer}
            onValueChange={value => updateSetting('showTrafficLayer', value)}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Recalcul automatique</Text>
            <Text style={styles.settingDescription}>
              Ajuster t₀ si conditions changent
            </Text>
          </View>
          <Switch
            value={settings.autoRecalculate}
            onValueChange={value => updateSetting('autoRecalculate', value)}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>Optimiser pour :</Text>
          <View style={styles.optionButtons}>
            <TouchableOpacity
              style={[styles.optionButton, settings.optimizeFor === 'time' && styles.optionButtonActive]}
              onPress={() => updateSetting('optimizeFor', 'time')}
            >
              <Text style={[styles.optionButtonText, settings.optimizeFor === 'time' && styles.optionButtonTextActive]}>
                ⏱️ Temps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, settings.optimizeFor === 'distance' && styles.optionButtonActive]}
              onPress={() => updateSetting('optimizeFor', 'distance')}
            >
              <Text style={[styles.optionButtonText, settings.optimizeFor === 'distance' && styles.optionButtonTextActive]}>
                📏 Distance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, settings.optimizeFor === 'eco' && styles.optionButtonActive]}
              onPress={() => updateSetting('optimizeFor', 'eco')}
            >
              <Text style={[styles.optionButtonText, settings.optimizeFor === 'eco' && styles.optionButtonTextActive]}>
                🌱 Éco
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Affichage</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Mode sombre</Text>
            <Text style={styles.settingDescription}>
              Interface sombre pour économiser la batterie
            </Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={value => updateSetting('darkMode', value)}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>Style de carte :</Text>
          <View style={styles.optionButtons}>
            <TouchableOpacity
              style={[styles.optionButton, settings.mapStyle === 'standard' && styles.optionButtonActive]}
              onPress={() => updateSetting('mapStyle', 'standard')}
            >
              <Text style={[styles.optionButtonText, settings.mapStyle === 'standard' && styles.optionButtonTextActive]}>
                Standard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, settings.mapStyle === 'satellite' && styles.optionButtonActive]}
              onPress={() => updateSetting('mapStyle', 'satellite')}
            >
              <Text style={[styles.optionButtonText, settings.mapStyle === 'satellite' && styles.optionButtonTextActive]}>
                Satellite
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, settings.mapStyle === 'hybrid' && styles.optionButtonActive]}
              onPress={() => updateSetting('mapStyle', 'hybrid')}
            >
              <Text style={[styles.optionButtonText, settings.mapStyle === 'hybrid' && styles.optionButtonTextActive]}>
                Hybride
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionGroup}>
          <Text style={styles.optionTitle}>Unités :</Text>
          <View style={styles.optionButtons}>
            <TouchableOpacity
              style={[styles.optionButton, settings.units === 'metric' && styles.optionButtonActive]}
              onPress={() => updateSetting('units', 'metric')}
            >
              <Text style={[styles.optionButtonText, settings.units === 'metric' && styles.optionButtonTextActive]}>
                Métriques (km)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, settings.units === 'imperial' && styles.optionButtonActive]}
              onPress={() => updateSetting('units', 'imperial')}
            >
              <Text style={[styles.optionButtonText, settings.units === 'imperial' && styles.optionButtonTextActive]}>
                Impériales (mi)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Advanced Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Avancé</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Mode développeur</Text>
            <Text style={styles.settingDescription}>
              Afficher logs et métriques détaillés
            </Text>
          </View>
          <Switch
            value={settings.developerMode}
            onValueChange={value => updateSetting('developerMode', value)}
            trackColor={{ false: '#ddd', true: '#FF9800' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Fonctionnalités bêta</Text>
            <Text style={styles.settingDescription}>
              Accès anticipé aux nouvelles features
            </Text>
          </View>
          <Switch
            value={settings.betaFeatures}
            onValueChange={value => updateSetting('betaFeatures', value)}
            trackColor={{ false: '#ddd', true: '#FF9800' }}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={onExportData}>
          <Text style={styles.buttonText}>💾 Exporter mes Données (RGPD)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonWarning]} onPress={handleResetSettings}>
          <Text style={styles.buttonText}>🔄 Réinitialiser les Paramètres</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={styles.sectionTitle}>⚠️ Zone Danger</Text>

        <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={handleDeleteAccount}>
          <Text style={[styles.buttonText, styles.buttonDangerText]}>
            🗑️ Supprimer mon Compte
          </Text>
        </TouchableOpacity>

        <Text style={styles.dangerWarning}>
          ATTENTION : La suppression du compte est définitive et irréversible.
          Toutes vos données seront perdues.
        </Text>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>FlowNav Mobile v0.1.0</Text>
        <Text style={styles.appInfoText}>© 2025 FlowNav Technologies</Text>
        <TouchableOpacity onPress={() => Alert.alert('About', 'FlowNav - Navigation prédictive privacy-first')}>
          <Text style={styles.appInfoLink}>À propos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerSection: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // Slider
  sliderRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sliderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sliderDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },

  // Option Group
  optionGroup: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#2196F3',
  },
  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  optionButtonTextActive: {
    color: '#ffffff',
  },

  // Buttons
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonWarning: {
    backgroundColor: '#FF9800',
  },
  buttonDanger: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDangerText: {
    color: '#ffffff',
  },
  dangerWarning: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    padding: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  appInfoLink: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;
