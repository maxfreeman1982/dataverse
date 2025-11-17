/**
 * FlowNav - Micro-interaction Components
 *
 * Reusable UI components with delightful animations:
 * - Animated buttons
 * - Loading indicators
 * - Success/error feedback
 * - Progress indicators
 * - Skeleton loaders
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useFadeIn,
  useScale,
  usePulse,
  useLoadingDots,
  useShimmer,
  createPressAnimation,
  animateSuccess,
  animateError,
  hapticFeedback,
  interpolateShimmer,
  AnimationPresets,
} from '../utils/animations';

/**
 * Animated Button with Press Effect
 */
interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressHandlers = createPressAnimation(
    scaleAnim,
    () => hapticFeedback('light'),
    undefined
  );

  const colors = {
    primary: { bg: '#2196F3', text: '#FFF' },
    secondary: { bg: '#F5F5F5', text: '#212121' },
    danger: { bg: '#F44336', text: '#FFF' },
    success: { bg: '#4CAF50', text: '#FFF' },
  };

  const { bg, text } = colors[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      {...pressHandlers}
    >
      <Animated.View
        style={[
          styles.animatedButton,
          { backgroundColor: bg, transform: [{ scale: scaleAnim }] },
          disabled && styles.animatedButtonDisabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={text} size="small" />
        ) : (
          <>
            {icon && (
              <Icon
                name={icon}
                size={24}
                color={text}
                style={styles.buttonIcon}
              />
            )}
            <Text style={[styles.animatedButtonText, { color: text }]}>
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Loading Dots Indicator
 */
export const LoadingDots: React.FC<{ size?: number; color?: string }> = ({
  size = 12,
  color = '#2196F3',
}) => {
  const [dot1, dot2, dot3] = useLoadingDots();

  return (
    <View style={styles.loadingDotsContainer}>
      {[dot1, dot2, dot3].map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.loadingDot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              transform: [{ translateY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
};

/**
 * Success Checkmark Animation
 */
interface SuccessCheckmarkProps {
  visible: boolean;
  size?: number;
  onComplete?: () => void;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  visible,
  size = 80,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      animateSuccess(scaleAnim, opacityAnim, onComplete);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successCheckmark,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Icon name="check-circle" size={size} color="#4CAF50" />
    </Animated.View>
  );
};

/**
 * Error Shake View
 */
interface ErrorShakeProps {
  trigger: boolean;
  children: React.ReactNode;
  onComplete?: () => void;
}

export const ErrorShake: React.FC<ErrorShakeProps> = ({
  trigger,
  children,
  onComplete,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      animateError(translateX, onComplete);
    }
  }, [trigger, translateX, onComplete]);

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
};

/**
 * Pulsing Badge (for notifications)
 */
interface PulsingBadgeProps {
  count: number;
  size?: number;
  color?: string;
}

export const PulsingBadge: React.FC<PulsingBadgeProps> = ({
  count,
  size = 20,
  color = '#F44336',
}) => {
  const pulseAnim = usePulse(1, 1.2, 800);

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        styles.pulsingBadge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Text style={[styles.pulsingBadgeText, { fontSize: size * 0.6 }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </Animated.View>
  );
};

/**
 * Progress Bar with Animation
 */
interface AnimatedProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 8,
  color = '#4CAF50',
  backgroundColor = '#E0E0E0',
  showPercentage = false,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      ...AnimationPresets.spring.standard,
      useNativeDriver: false, // width can't use native driver
    }).start();
  }, [progress, widthAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBarBackground,
          { height, backgroundColor, borderRadius: height / 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              height,
              backgroundColor: color,
              borderRadius: height / 2,
              width: animatedWidth,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.progressBarText}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
};

/**
 * Circular Progress Indicator
 */
interface CircularProgressProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#2196F3',
  backgroundColor = '#E0E0E0',
  showPercentage = true,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      ...AnimationPresets.spring.standard,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Note: For actual implementation, use react-native-svg
  // This is a simplified representation
  return (
    <View
      style={[
        styles.circularProgress,
        { width: size, height: size },
      ]}
    >
      {showPercentage && (
        <View style={styles.circularProgressCenter}>
          <Text style={styles.circularProgressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Skeleton Loader
 */
interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useShimmer(1500);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.skeletonShimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

/**
 * Fade In View (for entrance animations)
 */
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 300,
  style,
}) => {
  const fadeAnim = useFadeIn(duration, delay);

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Scale In View (for pop-in animations)
 */
interface ScaleInViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  delay = 0,
  style,
}) => {
  const scaleAnim = useScale(0, 1);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

/**
 * Floating Action Button (FAB) with pulse
 */
interface FloatingActionButtonProps {
  icon: string;
  onPress: () => void;
  color?: string;
  size?: number;
  pulse?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  color = '#2196F3',
  size = 56,
  pulse = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = usePulse(1, 1.05, 2000);
  const pressHandlers = createPressAnimation(scaleAnim, () =>
    hapticFeedback('medium')
  );

  const scale = pulse ? Animated.multiply(scaleAnim, pulseAnim) : scaleAnim;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      {...pressHandlers}
    >
      <Animated.View
        style={[
          styles.fab,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            transform: [{ scale }],
          },
        ]}
      >
        <Icon name={icon} size={size * 0.45} color="#FFF" />
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Tooltip with fade animation
 */
interface TooltipProps {
  text: string;
  visible: boolean;
  position?: 'top' | 'bottom';
  style?: ViewStyle;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  visible,
  position = 'top',
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: AnimationPresets.duration.short,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.tooltip,
        position === 'top' ? styles.tooltipTop : styles.tooltipBottom,
        { opacity: fadeAnim },
        style,
      ]}
    >
      <Text style={styles.tooltipText}>{text}</Text>
      <View
        style={[
          styles.tooltipArrow,
          position === 'top'
            ? styles.tooltipArrowBottom
            : styles.tooltipArrowTop,
        ]}
      />
    </Animated.View>
  );
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  // Animated Button
  animatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minHeight: 48,
  },
  animatedButtonDisabled: {
    opacity: 0.5,
  },
  animatedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Loading Dots
  loadingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    marginHorizontal: 4,
  },

  // Success Checkmark
  successCheckmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pulsing Badge
  pulsingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -5,
    right: -5,
  },
  pulsingBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Progress Bar
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressBarText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
    minWidth: 40,
  },

  // Circular Progress
  circularProgress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressCenter: {
    position: 'absolute',
  },
  circularProgressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },

  // Skeleton Loader
  skeleton: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    width: '50%',
  },

  // FAB
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Tooltip
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'center',
  },
  tooltipTop: {
    bottom: '110%',
  },
  tooltipBottom: {
    top: '110%',
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 14,
  },
  tooltipArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignSelf: 'center',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tooltipArrowTop: {
    top: -6,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
  tooltipArrowBottom: {
    bottom: -6,
    borderTopWidth: 6,
    borderTopColor: 'rgba(0, 0, 0, 0.8)',
  },
});

export default {
  AnimatedButton,
  LoadingDots,
  SuccessCheckmark,
  ErrorShake,
  PulsingBadge,
  AnimatedProgressBar,
  CircularProgress,
  SkeletonLoader,
  FadeInView,
  ScaleInView,
  FloatingActionButton,
  Tooltip,
};
