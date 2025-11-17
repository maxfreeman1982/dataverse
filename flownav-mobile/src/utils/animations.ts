/**
 * FlowNav - Animations & Micro-interactions
 *
 * Reusable animation utilities and hooks for:
 * - Entrance/exit animations
 * - Gesture feedback
 * - Loading states
 * - Success/error feedback
 * - Smooth transitions
 */

import { useRef, useEffect } from 'react';
import { Animated, Easing, Platform, Vibration } from 'react-native';

/**
 * Animation Presets
 */
export const AnimationPresets = {
  // Timing curves
  easing: {
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
    bounce: Easing.bounce,
    elastic: Easing.elastic(1),
  },

  // Durations (ms)
  duration: {
    instant: 100,
    short: 200,
    standard: 300,
    long: 400,
    extraLong: 600,
  },

  // Spring configs
  spring: {
    gentle: { tension: 40, friction: 7 },
    standard: { tension: 80, friction: 8 },
    snappy: { tension: 120, friction: 10 },
    bouncy: { tension: 180, friction: 12 },
  },
};

/**
 * Hook: Fade In Animation
 */
export const useFadeIn = (
  duration: number = AnimationPresets.duration.standard,
  delay: number = 0
): Animated.Value => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      easing: AnimationPresets.easing.decelerate,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return fadeAnim;
};

/**
 * Hook: Slide In Animation
 */
export const useSlideIn = (
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  distance: number = 50,
  duration: number = AnimationPresets.duration.standard
): Animated.Value => {
  const slideAnim = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      ...AnimationPresets.spring.standard,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return slideAnim;
};

/**
 * Hook: Scale Animation
 */
export const useScale = (
  fromScale: number = 0,
  toScale: number = 1,
  duration: number = AnimationPresets.duration.standard
): Animated.Value => {
  const scaleAnim = useRef(new Animated.Value(fromScale)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: toScale,
      ...AnimationPresets.spring.snappy,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, toScale]);

  return scaleAnim;
};

/**
 * Hook: Pulse Animation (Loop)
 */
export const usePulse = (
  minScale: number = 1,
  maxScale: number = 1.1,
  duration: number = 1000
): Animated.Value => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration,
          easing: AnimationPresets.easing.standard,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration,
          easing: AnimationPresets.easing.standard,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, minScale, maxScale, duration]);

  return pulseAnim;
};

/**
 * Hook: Rotation Animation (Loop)
 */
export const useRotation = (
  duration: number = 2000,
  continuous: boolean = true
): Animated.Value => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(rotateAnim, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    if (continuous) {
      Animated.loop(animation).start();
    } else {
      animation.start();
    }
  }, [rotateAnim, duration, continuous]);

  return rotateAnim;
};

/**
 * Hook: Shimmer Animation (Loading)
 */
export const useShimmer = (duration: number = 1500): Animated.Value => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim, duration]);

  return shimmerAnim;
};

/**
 * Interpolate rotation
 */
export const interpolateRotation = (animatedValue: Animated.Value): Animated.AnimatedInterpolation => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

/**
 * Interpolate shimmer position
 */
export const interpolateShimmer = (animatedValue: Animated.Value): Animated.AnimatedInterpolation => {
  return animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, 1],
  });
};

/**
 * Press Animation
 *
 * Scale down slightly when pressed, scale back on release
 */
export const createPressAnimation = (
  scaleValue: Animated.Value,
  onPressIn?: () => void,
  onPressOut?: () => void
) => {
  return {
    onPressIn: () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        ...AnimationPresets.spring.snappy,
        useNativeDriver: true,
      }).start();
      onPressIn?.();
    },
    onPressOut: () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        ...AnimationPresets.spring.snappy,
        useNativeDriver: true,
      }).start();
      onPressOut?.();
    },
  };
};

/**
 * Success Animation
 *
 * Scale up with bounce and fade in green
 */
export const animateSuccess = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value,
  callback?: () => void
) => {
  Animated.parallel([
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        ...AnimationPresets.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        ...AnimationPresets.spring.gentle,
        useNativeDriver: true,
      }),
    ]),
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: AnimationPresets.duration.short,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // Haptic feedback
    hapticFeedback('success');
    callback?.();
  });
};

/**
 * Error Animation
 *
 * Shake horizontally
 */
export const animateError = (
  translateX: Animated.Value,
  callback?: () => void
) => {
  Animated.sequence([
    Animated.timing(translateX, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // Haptic feedback
    hapticFeedback('error');
    callback?.();
  });
};

/**
 * Loading Dots Animation
 *
 * Three dots bounce in sequence
 */
export const useLoadingDots = (): [Animated.Value, Animated.Value, Animated.Value] => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -10,
          duration: 300,
          easing: AnimationPresets.easing.standard,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          easing: AnimationPresets.easing.standard,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(
      Animated.parallel([
        createBounce(dot1, 0),
        createBounce(dot2, 150),
        createBounce(dot3, 300),
      ])
    ).start();
  }, [dot1, dot2, dot3]);

  return [dot1, dot2, dot3];
};

/**
 * Stagger Animation
 *
 * Animate children with delay between each
 */
export const createStaggerAnimation = (
  items: Animated.Value[],
  staggerDelay: number = 100,
  animation: 'fade' | 'slide' | 'scale' = 'fade'
): void => {
  const animations = items.map((item, index) => {
    let config: Animated.TimingAnimationConfig = {
      toValue: 1,
      duration: AnimationPresets.duration.standard,
      delay: index * staggerDelay,
      easing: AnimationPresets.easing.decelerate,
      useNativeDriver: true,
    };

    return Animated.timing(item, config);
  });

  Animated.stagger(staggerDelay, animations).start();
};

/**
 * Haptic Feedback
 */
export const hapticFeedback = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): void => {
  if (Platform.OS === 'ios') {
    // iOS haptic feedback
    const ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };

    const feedbackType = {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
    }[type];

    try {
      ReactNativeHapticFeedback.trigger(feedbackType, options);
    } catch (error) {
      // Fallback to Vibration
      Vibration.vibrate(10);
    }
  } else {
    // Android vibration fallback
    const pattern = {
      light: [0, 10],
      medium: [0, 20],
      heavy: [0, 30],
      success: [0, 10, 50, 10],
      warning: [0, 10, 50, 10, 50, 10],
      error: [0, 20, 50, 20],
    }[type];

    Vibration.vibrate(pattern);
  }
};

/**
 * Page Transition Animations
 */
export const PageTransitions = {
  /**
   * Slide from right (modal-style)
   */
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  },

  /**
   * Fade (simple crossfade)
   */
  fade: {
    cardStyleInterpolator: ({ current }: any) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
  },

  /**
   * Scale from center
   */
  scaleFromCenter: {
    cardStyleInterpolator: ({ current }: any) => ({
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
        opacity: current.progress,
      },
    }),
  },

  /**
   * Slide from bottom (modal sheet)
   */
  slideFromBottom: {
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    }),
  },
};

/**
 * Skeleton Loader Component Styles
 */
export const createSkeletonStyle = (
  shimmerAnim: Animated.Value,
  backgroundColor: string = '#E0E0E0',
  highlightColor: string = '#F5F5F5'
) => {
  return {
    backgroundColor,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  };
};

export const createSkeletonShimmer = (shimmerAnim: Animated.Value) => {
  return {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [
      {
        translateX: interpolateShimmer(shimmerAnim),
      },
    ],
  };
};

/**
 * Number Counter Animation
 *
 * Animate number from start to end
 */
export const animateNumber = (
  animatedValue: Animated.Value,
  from: number,
  to: number,
  duration: number = AnimationPresets.duration.standard,
  callback?: (value: number) => void
): void => {
  animatedValue.setValue(from);

  Animated.timing(animatedValue, {
    toValue: to,
    duration,
    easing: AnimationPresets.easing.decelerate,
    useNativeDriver: false, // Numbers can't use native driver
  }).start();

  // Optional: update callback with interpolated values
  if (callback) {
    animatedValue.addListener(({ value }) => {
      callback(Math.round(value));
    });
  }
};

/**
 * Parallax Scroll Effect
 */
export const createParallaxStyle = (
  scrollY: Animated.Value,
  parallaxRatio: number = 0.5
) => {
  return {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 1],
          outputRange: [0, parallaxRatio],
        }),
      },
    ],
  };
};

/**
 * Blur Transition (for backgrounds)
 */
export const createBlurTransition = (
  animatedValue: Animated.Value,
  maxBlur: number = 10
) => {
  return {
    blurRadius: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxBlur],
    }),
  };
};

export default {
  AnimationPresets,
  useFadeIn,
  useSlideIn,
  useScale,
  usePulse,
  useRotation,
  useShimmer,
  useLoadingDots,
  interpolateRotation,
  interpolateShimmer,
  createPressAnimation,
  animateSuccess,
  animateError,
  createStaggerAnimation,
  hapticFeedback,
  PageTransitions,
  createSkeletonStyle,
  createSkeletonShimmer,
  animateNumber,
  createParallaxStyle,
  createBlurTransition,
};
