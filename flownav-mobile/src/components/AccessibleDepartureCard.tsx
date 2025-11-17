/**
 * FlowNav - Accessible Departure Recommendation Card
 *
 * Demonstrates accessibility best practices:
 * - Semantic labels and hints
 * - Screen reader announcements
 * - Touch target sizing
 * - Dynamic type support
 * - Reduced motion respect
 * - High contrast support
 * - Focus management
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  findNodeHandle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  createButtonA11y,
  createHeadingA11y,
  createProgressA11y,
  formatTimeForA11y,
  announceForAccessibility,
  setAccessibilityFocus,
  useScreenReader,
  useReducedMotion,
  RECOMMENDED_TOUCH_TARGET_SIZE,
} from '../utils/accessibility';
import { useTheme } from '../theme/ThemeContext';
import { OptimalDeparture } from '../types';

/**
 * Props
 */
interface AccessibleDepartureCardProps {
  departure: OptimalDeparture;
  onStartNavigation: () => void;
  onDismiss?: () => void;
  autoFocus?: boolean;
}

/**
 * Accessible Departure Card Component
 */
export const AccessibleDepartureCard: React.FC<AccessibleDepartureCardProps> = ({
  departure,
  onStartNavigation,
  onDismiss,
  autoFocus = false,
}) => {
  const { colors } = useTheme();
  const isScreenReaderEnabled = useScreenReader();
  const isReducedMotion = useReducedMotion();
  const cardRef = useRef<View>(null);

  const { t0, travelTimeMinutes, gainMinutes, confidence } = departure;

  // Calculate countdown
  const now = Date.now();
  const secondsUntilDeparture = Math.max(0, Math.floor((t0 - now) / 1000));
  const minutesUntilDeparture = Math.floor(secondsUntilDeparture / 60);

  // Animation (disabled if reduced motion)
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isReducedMotion && secondsUntilDeparture > 0 && secondsUntilDeparture < 300) {
      // Pulse when departure is imminent (< 5 minutes)
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [secondsUntilDeparture, isReducedMotion, pulseAnim]);

  // Auto-focus for screen readers
  useEffect(() => {
    if (autoFocus && isScreenReaderEnabled && cardRef.current) {
      const reactTag = findNodeHandle(cardRef.current);
      if (reactTag) {
        setTimeout(() => {
          setAccessibilityFocus(reactTag);
        }, 500);
      }
    }
  }, [autoFocus, isScreenReaderEnabled]);

  // Announce changes to screen reader
  useEffect(() => {
    if (isScreenReaderEnabled && secondsUntilDeparture > 0) {
      if (secondsUntilDeparture === 300) {
        // 5 minutes
        announceForAccessibility('Plus que 5 minutes avant le départ optimal');
      } else if (secondsUntilDeparture === 120) {
        // 2 minutes
        announceForAccessibility(
          'Plus que 2 minutes avant le départ optimal. Préparez-vous.'
        );
      } else if (secondsUntilDeparture === 60) {
        // 1 minute
        announceForAccessibility(
          'Plus qu\'une minute avant le départ optimal. C\'est presque l\'heure !'
        );
      } else if (secondsUntilDeparture === 0) {
        announceForAccessibility(
          'C\'est le moment de partir ! Départ optimal maintenant.'
        );
      }
    }
  }, [secondsUntilDeparture, isScreenReaderEnabled]);

  /**
   * Format recommendation for screen reader
   */
  const getA11yLabel = (): string => {
    const parts: string[] = [
      'Recommandation de départ optimal.',
    ];

    if (secondsUntilDeparture > 0) {
      parts.push(`Partez dans ${formatTimeForA11y(secondsUntilDeparture)}.`);
    } else {
      parts.push('Partez maintenant.');
    }

    parts.push(`Durée de trajet estimée : ${formatTimeForA11y(travelTimeMinutes * 60)}.`);

    if (gainMinutes > 0) {
      parts.push(`Vous gagnerez environ ${Math.round(gainMinutes)} minutes par rapport à un départ immédiat.`);
    }

    parts.push(`Niveau de confiance : ${Math.round(confidence * 100)} pourcent.`);

    return parts.join(' ');
  };

  /**
   * Format hint for screen reader
   */
  const getA11yHint = (): string => {
    return 'Double-tap pour démarrer la navigation maintenant, ou attendez le moment optimal.';
  };

  /**
   * Status icon and color
   */
  const getStatus = (): { icon: string; color: string; text: string } => {
    if (secondsUntilDeparture === 0) {
      return {
        icon: 'play-circle',
        color: colors.success,
        text: 'Partez maintenant !',
      };
    } else if (secondsUntilDeparture < 300) {
      return {
        icon: 'clock-alert',
        color: colors.warning,
        text: 'Bientôt le moment',
      };
    } else {
      return {
        icon: 'clock-outline',
        color: colors.primary,
        text: 'Attendez le signal',
      };
    }
  };

  const status = getStatus();

  return (
    <Animated.View
      ref={cardRef}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: status.color,
          transform: isReducedMotion ? [] : [{ scale: pulseAnim }],
        },
      ]}
      {...createHeadingA11y('Recommandation de départ', 2)}
    >
      {/* Status Header */}
      <View
        style={[styles.header, { backgroundColor: status.color }]}
        accessible={true}
        accessibilityLabel={`Statut : ${status.text}`}
      >
        <Icon name={status.icon} size={32} color="#FFF" />
        <Text style={styles.headerText}>{status.text}</Text>
      </View>

      {/* Departure Time */}
      <View style={styles.section}>
        <Text
          style={[styles.label, { color: colors.textSecondary }]}
          {...createHeadingA11y('Départ optimal', 3)}
        >
          Départ optimal
        </Text>
        <Text
          style={[styles.time, { color: colors.text }]}
          accessible={true}
          accessibilityLabel={`Départ dans ${formatTimeForA11y(secondsUntilDeparture)}`}
        >
          {minutesUntilDeparture > 0
            ? `Dans ${minutesUntilDeparture} min`
            : 'Maintenant'}
        </Text>
      </View>

      {/* Travel Time */}
      <View style={styles.section}>
        <Text
          style={[styles.label, { color: colors.textSecondary }]}
          {...createHeadingA11y('Durée du trajet', 3)}
        >
          Durée du trajet
        </Text>
        <Text
          style={[styles.value, { color: colors.text }]}
          accessible={true}
          accessibilityLabel={`Durée estimée : ${formatTimeForA11y(travelTimeMinutes * 60)}`}
        >
          {Math.round(travelTimeMinutes)} min
        </Text>
      </View>

      {/* Gain */}
      {gainMinutes > 0 && (
        <View style={styles.section}>
          <Text
            style={[styles.label, { color: colors.textSecondary }]}
            {...createHeadingA11y('Temps gagné', 3)}
          >
            Temps gagné
          </Text>
          <View style={styles.gainRow}>
            <Icon name="speedometer" size={24} color={colors.success} />
            <Text
              style={[styles.gain, { color: colors.success }]}
              accessible={true}
              accessibilityLabel={`Vous gagnerez ${Math.round(gainMinutes)} minutes`}
            >
              +{Math.round(gainMinutes)} min
            </Text>
          </View>
        </View>
      )}

      {/* Confidence */}
      <View style={styles.section}>
        <Text
          style={[styles.label, { color: colors.textSecondary }]}
          {...createHeadingA11y('Fiabilité', 3)}
        >
          Fiabilité
        </Text>
        <View
          style={styles.confidenceBar}
          {...createProgressA11y('Niveau de confiance', confidence, 1)}
        >
          <View
            style={[
              styles.confidenceFill,
              {
                width: `${confidence * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text
          style={[styles.confidenceText, { color: colors.textSecondary }]}
          accessible={false}
        >
          {Math.round(confidence * 100)}%
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {/* Start Navigation Button */}
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            {
              backgroundColor: status.color,
              minHeight: RECOMMENDED_TOUCH_TARGET_SIZE,
            },
          ]}
          onPress={onStartNavigation}
          activeOpacity={0.8}
          {...createButtonA11y(
            'Démarrer la navigation',
            'Lance la navigation vers votre destination',
            false
          )}
        >
          <Icon name="navigation" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Démarrer</Text>
        </TouchableOpacity>

        {/* Dismiss Button */}
        {onDismiss && (
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              {
                borderColor: colors.border,
                minHeight: RECOMMENDED_TOUCH_TARGET_SIZE,
              },
            ]}
            onPress={onDismiss}
            activeOpacity={0.8}
            {...createButtonA11y(
              'Ignorer',
              'Ferme cette recommandation',
              false
            )}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Ignorer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Accessibility Announcement Region */}
      <View
        accessible={true}
        accessibilityLiveRegion="polite"
        accessibilityLabel={getA11yLabel()}
        accessibilityHint={getA11yHint()}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
      />
    </Animated.View>
  );
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
  },
  gainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gain: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
  },
  confidenceText: {
    fontSize: 14,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  primaryButton: {
    flex: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccessibleDepartureCard;
