/**
 * FlowNav - Interactive Onboarding & Tutorial
 *
 * Multi-step walkthrough for new users explaining:
 * - Optimal departure time calculation
 * - Privacy-by-design features
 * - How to use main features
 * - Benefits and value proposition
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Onboarding Step
 */
interface OnboardingStep {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  details: string[];
  animation?: 'fade' | 'slide' | 'scale';
}

/**
 * Props
 */
interface OnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

/**
 * Onboarding Steps Configuration
 */
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: 'map-marker-path',
    iconColor: '#2196F3',
    title: 'Bienvenue sur FlowNav',
    description: 'La navigation prédictive qui optimise vos trajets',
    details: [
      'Calculez le meilleur moment pour partir',
      'Économisez du temps et du carburant',
      'Réduisez votre empreinte carbone',
      'Votre vie privée respectée par design',
    ],
    animation: 'fade',
  },
  {
    id: 'optimization',
    icon: 'chart-timeline-variant',
    iconColor: '#4CAF50',
    title: 'Départ optimal t₀',
    description: 'FlowNav calcule quand partir pour minimiser votre temps de trajet',
    details: [
      'Analyse le trafic en temps réel sur votre itinéraire',
      'Prédit les conditions futures (congestion, accidents)',
      'Compare tous les scénarios de départ possibles',
      'Recommande le t₀ optimal avec gain estimé',
    ],
    animation: 'slide',
  },
  {
    id: 'privacy',
    icon: 'shield-check',
    iconColor: '#9C27B0',
    title: 'Vie privée protégée',
    description: 'Aucune donnée personnelle collectée. Jamais.',
    details: [
      'k-anonymat : minimum 3 véhicules par agrégat',
      'ID éphémère rotatif toutes les 10-15 minutes',
      'Aucune coordonnée GPS brute transmise',
      'Conformité RGPD/CNIL par conception',
    ],
    animation: 'scale',
  },
  {
    id: 'features',
    icon: 'star-four-points',
    iconColor: '#FF9800',
    title: 'Fonctionnalités principales',
    description: 'Tout ce dont vous avez besoin pour des trajets optimisés',
    details: [
      '📍 Carte interactive avec trafic en temps réel',
      '⏰ Recommandations de départ intelligentes',
      '🔔 Notifications au moment parfait',
      '📊 Historique et statistiques de vos gains',
    ],
    animation: 'fade',
  },
  {
    id: 'tutorial',
    icon: 'school',
    iconColor: '#00BCD4',
    title: 'Comment utiliser FlowNav',
    description: 'Simple et intuitif en 3 étapes',
    details: [
      '1️⃣ Entrez votre destination et heure d\'arrivée souhaitée',
      '2️⃣ FlowNav calcule le t₀ optimal et le gain estimé',
      '3️⃣ Attendez la notification et partez au bon moment',
      '✅ Arrivez plus vite, avec moins de stress',
    ],
    animation: 'slide',
  },
  {
    id: 'ready',
    icon: 'rocket-launch',
    iconColor: '#F44336',
    title: 'Prêt à partir !',
    description: 'Commencez à économiser du temps dès maintenant',
    details: [
      'Activez les notifications pour ne rien manquer',
      'Autorisez la localisation pour des prédictions précises',
      'Consultez les paramètres pour personnaliser l\'app',
      'Suivez les recommandations pour maximiser vos gains',
    ],
    animation: 'scale',
  },
];

/**
 * Onboarding Component
 */
export const Onboarding: React.FC<OnboardingProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  /**
   * Navigate to next step
   */
  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      // Animate transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  /**
   * Skip onboarding
   */
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  /**
   * Pulse animation for icon
   */
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {!isLastStep && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Passer</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          { opacity: fadeAnim },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Icon
              name={step.icon}
              size={120}
              color={step.iconColor}
            />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>{step.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{step.description}</Text>

          {/* Details */}
          <View style={styles.detailsContainer}>
            {step.details.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Icon
                  name="check-circle"
                  size={24}
                  color={step.iconColor}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>

          {/* Special content for specific steps */}
          {step.id === 'optimization' && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>Exemple concret</Text>
              <Text style={styles.exampleText}>
                Trajet Paris → Défense, 20 km{'\n'}
                Arrivée souhaitée : 9h00{'\n\n'}
                ❌ Départ immédiat (8h20) → arrivée 9h15 (45 min){'\n'}
                ✅ Départ optimal (8h35) → arrivée 9h00 (25 min){'\n\n'}
                <Text style={styles.exampleGain}>Gain : 20 minutes !</Text>
              </Text>
            </View>
          )}

          {step.id === 'privacy' && (
            <View style={styles.privacyBox}>
              <Icon name="shield-lock" size={40} color="#9C27B0" />
              <Text style={styles.privacyText}>
                Vos déplacements ne sont JAMAIS tracés.{'\n'}
                Seules des statistiques agrégées et anonymisées{'\n'}
                permettent d'améliorer les prédictions.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {/* Previous Button */}
        {!isFirstStep && (
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Icon name="chevron-left" size={24} color="#2196F3" />
            <Text style={styles.prevButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        {/* Next/Finish Button */}
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.nextButton,
            isFirstStep && styles.nextButtonFull,
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Commencer' : 'Suivant'}
          </Text>
          <Icon
            name={isLastStep ? 'check' : 'chevron-right'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
    marginRight: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#2196F3',
    width: 30,
  },
  progressDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
  },
  detailsContainer: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  exampleBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 15,
    color: '#424242',
    lineHeight: 22,
  },
  exampleGain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  privacyBox: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  privacyText: {
    fontSize: 15,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 15,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  prevButton: {
    backgroundColor: '#F5F5F5',
  },
  prevButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
});

/**
 * Compact Onboarding (for returning users)
 */
interface CompactOnboardingProps {
  onComplete: () => void;
}

export const CompactOnboarding: React.FC<CompactOnboardingProps> = ({
  onComplete,
}) => {
  return (
    <View style={compactStyles.container}>
      <View style={compactStyles.content}>
        <Icon name="map-marker-path" size={80} color="#2196F3" />
        <Text style={compactStyles.title}>FlowNav</Text>
        <Text style={compactStyles.subtitle}>
          Navigation prédictive avec départ optimal t₀
        </Text>

        <View style={compactStyles.features}>
          <View style={compactStyles.featureRow}>
            <Icon name="clock-outline" size={24} color="#4CAF50" />
            <Text style={compactStyles.featureText}>
              Économisez jusqu'à 20 min/trajet
            </Text>
          </View>
          <View style={compactStyles.featureRow}>
            <Icon name="shield-check" size={24} color="#9C27B0" />
            <Text style={compactStyles.featureText}>
              Vie privée protégée (k-anonymat)
            </Text>
          </View>
          <View style={compactStyles.featureRow}>
            <Icon name="leaf" size={24} color="#4CAF50" />
            <Text style={compactStyles.featureText}>
              Réduisez votre CO₂ de 15%
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={compactStyles.button}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={compactStyles.buttonText}>Commencer</Text>
          <Icon name="chevron-right" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const compactStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  features: {
    width: '100%',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default Onboarding;
