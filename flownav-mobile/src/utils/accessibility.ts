/**
 * FlowNav - Accessibility (a11y) Utilities
 *
 * Features:
 * - Screen reader support (VoiceOver, TalkBack)
 * - Dynamic type scaling
 * - Touch target sizing
 * - Color contrast validation
 * - Focus management
 * - Semantic labels and hints
 * - Accessible navigation
 */

import { AccessibilityInfo, Platform, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

/**
 * Minimum touch target size (WCAG 2.1 Level AAA)
 */
export const MIN_TOUCH_TARGET_SIZE = 44;

/**
 * Recommended touch target size
 */
export const RECOMMENDED_TOUCH_TARGET_SIZE = 48;

/**
 * WCAG Contrast Ratios
 */
export const CONTRAST_RATIO = {
  AA_NORMAL: 4.5, // Normal text (< 18pt or < 14pt bold)
  AA_LARGE: 3, // Large text (>= 18pt or >= 14pt bold)
  AAA_NORMAL: 7, // Enhanced contrast for normal text
  AAA_LARGE: 4.5, // Enhanced contrast for large text
};

/**
 * Accessibility Role Types
 */
export type A11yRole =
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'text'
  | 'header'
  | 'summary'
  | 'adjustable'
  | 'imagebutton'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar'
  | 'none';

/**
 * Accessibility Props Builder
 */
export interface A11yProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: A11yRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityActions?: Array<{ name: string; label?: string }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * Create accessible button props
 */
export const createButtonA11y = (
  label: string,
  hint?: string,
  disabled?: boolean
): A11yProps => ({
  accessible: true,
  accessibilityRole: 'button',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: { disabled: disabled || false },
});

/**
 * Create accessible link props
 */
export const createLinkA11y = (label: string, hint?: string): A11yProps => ({
  accessible: true,
  accessibilityRole: 'link',
  accessibilityLabel: label,
  accessibilityHint: hint,
});

/**
 * Create accessible heading props
 */
export const createHeadingA11y = (text: string, level: number = 1): A11yProps => ({
  accessible: true,
  accessibilityRole: 'header',
  accessibilityLabel: text,
  accessibilityValue: { text: `Niveau ${level}` },
});

/**
 * Create accessible slider/adjustable props
 */
export const createSliderA11y = (
  label: string,
  value: number,
  min: number,
  max: number,
  hint?: string
): A11yProps => ({
  accessible: true,
  accessibilityRole: 'adjustable',
  accessibilityLabel: label,
  accessibilityHint: hint || 'Glissez pour ajuster',
  accessibilityValue: { min, max, now: value },
  accessibilityActions: [
    { name: 'increment', label: 'Augmenter' },
    { name: 'decrement', label: 'Diminuer' },
  ],
});

/**
 * Create accessible switch props
 */
export const createSwitchA11y = (
  label: string,
  value: boolean,
  hint?: string
): A11yProps => ({
  accessible: true,
  accessibilityRole: 'switch',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: { checked: value },
});

/**
 * Create accessible checkbox props
 */
export const createCheckboxA11y = (
  label: string,
  checked: boolean | 'mixed',
  hint?: string
): A11yProps => ({
  accessible: true,
  accessibilityRole: 'checkbox',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: { checked },
});

/**
 * Create accessible radio button props
 */
export const createRadioA11y = (
  label: string,
  selected: boolean,
  hint?: string
): A11yProps => ({
  accessible: true,
  accessibilityRole: 'radio',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: { selected },
});

/**
 * Create accessible progress bar props
 */
export const createProgressA11y = (
  label: string,
  value: number,
  max: number = 100
): A11yProps => ({
  accessible: true,
  accessibilityRole: 'progressbar',
  accessibilityLabel: label,
  accessibilityValue: { min: 0, max, now: value, text: `${Math.round((value / max) * 100)}%` },
});

/**
 * Create accessible alert props
 */
export const createAlertA11y = (message: string, live: boolean = true): A11yProps => ({
  accessible: true,
  accessibilityRole: 'alert',
  accessibilityLabel: message,
  accessibilityLiveRegion: live ? 'assertive' : 'polite',
});

/**
 * Calculate relative luminance (WCAG formula)
 */
const getLuminance = (color: string): number => {
  // Parse hex color
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG standards
 */
export const meetsContrastRatio = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): { passes: boolean; ratio: number; required: number } => {
  const ratio = getContrastRatio(foreground, background);

  const required =
    level === 'AA'
      ? isLargeText
        ? CONTRAST_RATIO.AA_LARGE
        : CONTRAST_RATIO.AA_NORMAL
      : isLargeText
      ? CONTRAST_RATIO.AAA_LARGE
      : CONTRAST_RATIO.AAA_NORMAL;

  return {
    passes: ratio >= required,
    ratio,
    required,
  };
};

/**
 * Ensure minimum touch target size
 */
export const ensureTouchTargetSize = (size: number): {
  width: number;
  height: number;
  padding: number;
} => {
  const minSize = RECOMMENDED_TOUCH_TARGET_SIZE;

  if (size >= minSize) {
    return { width: size, height: size, padding: 0 };
  }

  const padding = (minSize - size) / 2;

  return {
    width: minSize,
    height: minSize,
    padding,
  };
};

/**
 * Hook: Screen Reader Status
 */
export const useScreenReader = (): boolean => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check initial status
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      setIsEnabled(enabled);
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsEnabled
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return isEnabled;
};

/**
 * Hook: Bold Text Preference (iOS)
 */
export const useBoldText = (): boolean => {
  const [isBold, setIsBold] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isBoldTextEnabled().then((enabled) => {
        setIsBold(enabled);
      });

      const subscription = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        setIsBold
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return isBold;
};

/**
 * Hook: Grayscale Preference (iOS)
 */
export const useGrayscale = (): boolean => {
  const [isGrayscale, setIsGrayscale] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isGrayscaleEnabled().then((enabled) => {
        setIsGrayscale(enabled);
      });

      const subscription = AccessibilityInfo.addEventListener(
        'grayscaleChanged',
        setIsGrayscale
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return isGrayscale;
};

/**
 * Hook: Reduced Motion Preference
 */
export const useReducedMotion = (): boolean => {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setIsReduced(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduced
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return isReduced;
};

/**
 * Hook: Reduced Transparency Preference (iOS)
 */
export const useReducedTransparency = (): boolean => {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
        setIsReduced(enabled);
      });

      const subscription = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        setIsReduced
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return isReduced;
};

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string, delay: number = 0): void => {
  setTimeout(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, delay);
};

/**
 * Set accessibility focus to a specific ref
 */
export const setAccessibilityFocus = (reactTag: number): void => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

/**
 * Format time for screen readers
 *
 * Example: 125 seconds → "2 minutes 5 secondes"
 */
export const formatTimeForA11y = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'heure' : 'heures'}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs <= 1 ? 'seconde' : 'secondes'}`);
  }

  return parts.join(' ');
};

/**
 * Format distance for screen readers
 *
 * Example: 1250 meters → "1 kilomètre 250 mètres"
 */
export const formatDistanceForA11y = (meters: number): string => {
  if (meters >= 1000) {
    const km = Math.floor(meters / 1000);
    const m = Math.floor(meters % 1000);

    if (m === 0) {
      return `${km} ${km === 1 ? 'kilomètre' : 'kilomètres'}`;
    }

    return `${km} ${km === 1 ? 'kilomètre' : 'kilomètres'} ${m} mètres`;
  }

  return `${Math.floor(meters)} mètres`;
};

/**
 * Format speed for screen readers
 *
 * Example: 85.5 → "85 kilomètres par heure"
 */
export const formatSpeedForA11y = (kmh: number): string => {
  return `${Math.round(kmh)} kilomètres par heure`;
};

/**
 * Format traffic condition for screen readers
 */
export const formatTrafficForA11y = (condition: 'free' | 'moderate' | 'congested' | 'jammed'): string => {
  const labels = {
    free: 'Trafic fluide',
    moderate: 'Trafic modéré',
    congested: 'Trafic dense',
    jammed: 'Trafic bloqué',
  };

  return labels[condition];
};

/**
 * Format percentage for screen readers
 */
export const formatPercentageForA11y = (value: number): string => {
  return `${Math.round(value)} pourcent`;
};

/**
 * Format date/time for screen readers
 */
export const formatDateTimeForA11y = (timestamp: number): string => {
  const date = new Date(timestamp);

  const day = date.getDate();
  const month = date.toLocaleString('fr-FR', { month: 'long' });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year} à ${hours} heures ${minutes}`;
};

/**
 * Accessibility Guidelines Summary
 */
export const A11Y_GUIDELINES = {
  touchTargets: {
    minimum: MIN_TOUCH_TARGET_SIZE,
    recommended: RECOMMENDED_TOUCH_TARGET_SIZE,
  },
  contrast: {
    AA: {
      normalText: CONTRAST_RATIO.AA_NORMAL,
      largeText: CONTRAST_RATIO.AA_LARGE,
    },
    AAA: {
      normalText: CONTRAST_RATIO.AAA_NORMAL,
      largeText: CONTRAST_RATIO.AAA_LARGE,
    },
  },
  textSize: {
    minimumBodyText: 14,
    recommendedBodyText: 16,
    minimumLargeText: 18,
  },
  principles: [
    'Perceivable: Information and UI must be presented in ways users can perceive',
    'Operable: UI components and navigation must be operable',
    'Understandable: Information and UI operation must be understandable',
    'Robust: Content must be robust enough to work with assistive technologies',
  ],
};

/**
 * Validate component accessibility
 */
export interface A11yValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateA11y = (
  props: any,
  componentType: string
): A11yValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for accessibility label
  if (props.accessible !== false && !props.accessibilityLabel) {
    warnings.push(`${componentType} should have accessibilityLabel`);
  }

  // Check touch target size
  if (props.style?.width && props.style?.height) {
    const width = props.style.width;
    const height = props.style.height;

    if (
      typeof width === 'number' &&
      typeof height === 'number' &&
      (width < MIN_TOUCH_TARGET_SIZE || height < MIN_TOUCH_TARGET_SIZE)
    ) {
      errors.push(
        `Touch target too small: ${width}x${height}. Minimum: ${MIN_TOUCH_TARGET_SIZE}x${MIN_TOUCH_TARGET_SIZE}`
      );
    }
  }

  // Check contrast (if colors provided)
  if (props.color && props.backgroundColor) {
    const contrast = getContrastRatio(props.color, props.backgroundColor);
    if (contrast < CONTRAST_RATIO.AA_NORMAL) {
      errors.push(
        `Insufficient contrast ratio: ${contrast.toFixed(2)}:1. Required: ${CONTRAST_RATIO.AA_NORMAL}:1`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export default {
  MIN_TOUCH_TARGET_SIZE,
  RECOMMENDED_TOUCH_TARGET_SIZE,
  CONTRAST_RATIO,
  createButtonA11y,
  createLinkA11y,
  createHeadingA11y,
  createSliderA11y,
  createSwitchA11y,
  createCheckboxA11y,
  createRadioA11y,
  createProgressA11y,
  createAlertA11y,
  getContrastRatio,
  meetsContrastRatio,
  ensureTouchTargetSize,
  useScreenReader,
  useBoldText,
  useGrayscale,
  useReducedMotion,
  useReducedTransparency,
  announceForAccessibility,
  setAccessibilityFocus,
  formatTimeForA11y,
  formatDistanceForA11y,
  formatSpeedForA11y,
  formatTrafficForA11y,
  formatPercentageForA11y,
  formatDateTimeForA11y,
  A11Y_GUIDELINES,
  validateA11y,
};
