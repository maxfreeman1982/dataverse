/**
 * Tests for Accessibility Utilities
 *
 * Tests WCAG compliance, contrast ratios, touch targets,
 * screen reader formatting, and a11y props builders
 */

import {
  getContrastRatio,
  meetsContrastRatio,
  ensureTouchTargetSize,
  formatTimeForA11y,
  formatDistanceForA11y,
  formatSpeedForA11y,
  formatTrafficForA11y,
  formatPercentageForA11y,
  createButtonA11y,
  createSliderA11y,
  createSwitchA11y,
  createProgressA11y,
  CONTRAST_RATIO,
  MIN_TOUCH_TARGET_SIZE,
  RECOMMENDED_TOUCH_TARGET_SIZE,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0); // Maximum contrast is 21:1
    });

    it('should calculate correct contrast for white on black', () => {
      const ratio = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1:1 for same colors', () => {
      const ratio = getContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should calculate intermediate contrasts', () => {
      // Blue on white
      const ratio1 = getContrastRatio('#2196F3', '#FFFFFF');
      expect(ratio1).toBeGreaterThan(1);
      expect(ratio1).toBeLessThan(21);

      // Gray on white
      const ratio2 = getContrastRatio('#666666', '#FFFFFF');
      expect(ratio2).toBeGreaterThan(4); // Should meet AA
    });

    it('should be symmetric', () => {
      const ratio1 = getContrastRatio('#FF0000', '#00FF00');
      const ratio2 = getContrastRatio('#00FF00', '#FF0000');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('meetsContrastRatio', () => {
    it('should pass AA for sufficient contrast', () => {
      const result = meetsContrastRatio('#000000', '#FFFFFF', 'AA', false);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(CONTRAST_RATIO.AA_NORMAL);
    });

    it('should fail AA for insufficient contrast', () => {
      const result = meetsContrastRatio('#F0F0F0', '#FFFFFF', 'AA', false);
      expect(result.passes).toBe(false);
      expect(result.ratio).toBeLessThan(CONTRAST_RATIO.AA_NORMAL);
    });

    it('should use lower threshold for large text', () => {
      const fg = '#757575';
      const bg = '#FFFFFF';

      const normalText = meetsContrastRatio(fg, bg, 'AA', false);
      const largeText = meetsContrastRatio(fg, bg, 'AA', true);

      // Large text has lower requirement (3:1 vs 4.5:1)
      expect(normalText.required).toBe(CONTRAST_RATIO.AA_NORMAL);
      expect(largeText.required).toBe(CONTRAST_RATIO.AA_LARGE);
      expect(largeText.required).toBeLessThan(normalText.required);
    });

    it('should enforce higher standards for AAA', () => {
      const fg = '#595959';
      const bg = '#FFFFFF';

      const aa = meetsContrastRatio(fg, bg, 'AA', false);
      const aaa = meetsContrastRatio(fg, bg, 'AAA', false);

      expect(aaa.required).toBeGreaterThan(aa.required);
      expect(aaa.required).toBe(CONTRAST_RATIO.AAA_NORMAL);
    });

    it('should return correct required ratio', () => {
      const result = meetsContrastRatio('#000', '#FFF', 'AA', false);
      expect(result.required).toBe(4.5);
      expect(result.ratio).toBeCloseTo(21, 0);
    });
  });

  describe('ensureTouchTargetSize', () => {
    it('should return original size if large enough', () => {
      const result = ensureTouchTargetSize(60);
      expect(result.width).toBe(60);
      expect(result.height).toBe(60);
      expect(result.padding).toBe(0);
    });

    it('should add padding for small targets', () => {
      const result = ensureTouchTargetSize(24);
      expect(result.width).toBe(RECOMMENDED_TOUCH_TARGET_SIZE);
      expect(result.height).toBe(RECOMMENDED_TOUCH_TARGET_SIZE);
      expect(result.padding).toBeGreaterThan(0);
    });

    it('should calculate correct padding', () => {
      const iconSize = 24;
      const result = ensureTouchTargetSize(iconSize);
      const expectedPadding = (RECOMMENDED_TOUCH_TARGET_SIZE - iconSize) / 2;

      expect(result.padding).toBe(expectedPadding);
    });

    it('should meet minimum touch target size', () => {
      const result = ensureTouchTargetSize(10);
      expect(result.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
      expect(result.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_SIZE);
    });
  });

  describe('formatTimeForA11y', () => {
    it('should format seconds correctly', () => {
      expect(formatTimeForA11y(45)).toBe('45 secondes');
      expect(formatTimeForA11y(1)).toBe('1 seconde');
      expect(formatTimeForA11y(0)).toBe('0 seconde');
    });

    it('should format minutes correctly', () => {
      expect(formatTimeForA11y(60)).toBe('1 minute');
      expect(formatTimeForA11y(120)).toBe('2 minutes');
      expect(formatTimeForA11y(65)).toBe('1 minute 5 secondes');
    });

    it('should format hours correctly', () => {
      expect(formatTimeForA11y(3600)).toBe('1 heure');
      expect(formatTimeForA11y(7200)).toBe('2 heures');
      expect(formatTimeForA11y(3665)).toBe('1 heure 1 minute 5 secondes');
    });

    it('should format complex times', () => {
      const time = formatTimeForA11y(3725); // 1h 2min 5sec
      expect(time).toContain('1 heure');
      expect(time).toContain('2 minutes');
      expect(time).toContain('5 secondes');
    });

    it('should handle edge cases', () => {
      expect(formatTimeForA11y(0)).toBe('0 seconde');
      expect(formatTimeForA11y(3600)).toBe('1 heure');
      expect(formatTimeForA11y(7260)).toBe('2 heures 1 minute');
    });
  });

  describe('formatDistanceForA11y', () => {
    it('should format meters', () => {
      expect(formatDistanceForA11y(500)).toBe('500 mètres');
      expect(formatDistanceForA11y(50)).toBe('50 mètres');
    });

    it('should format kilometers', () => {
      expect(formatDistanceForA11y(1000)).toBe('1 kilomètre');
      expect(formatDistanceForA11y(2000)).toBe('2 kilomètres');
    });

    it('should format mixed km and meters', () => {
      expect(formatDistanceForA11y(1250)).toBe('1 kilomètre 250 mètres');
      expect(formatDistanceForA11y(5750)).toBe('5 kilomètres 750 mètres');
    });

    it('should handle exact kilometers', () => {
      expect(formatDistanceForA11y(3000)).toBe('3 kilomètres');
      expect(formatDistanceForA11y(10000)).toBe('10 kilomètres');
    });
  });

  describe('formatSpeedForA11y', () => {
    it('should format speed correctly', () => {
      expect(formatSpeedForA11y(50)).toBe('50 kilomètres par heure');
      expect(formatSpeedForA11y(130)).toBe('130 kilomètres par heure');
    });

    it('should round decimals', () => {
      expect(formatSpeedForA11y(85.7)).toBe('86 kilomètres par heure');
      expect(formatSpeedForA11y(85.3)).toBe('85 kilomètres par heure');
    });
  });

  describe('formatTrafficForA11y', () => {
    it('should format all traffic conditions', () => {
      expect(formatTrafficForA11y('free')).toBe('Trafic fluide');
      expect(formatTrafficForA11y('moderate')).toBe('Trafic modéré');
      expect(formatTrafficForA11y('congested')).toBe('Trafic dense');
      expect(formatTrafficForA11y('jammed')).toBe('Trafic bloqué');
    });
  });

  describe('formatPercentageForA11y', () => {
    it('should format percentages', () => {
      expect(formatPercentageForA11y(50)).toBe('50 pourcent');
      expect(formatPercentageForA11y(92.5)).toBe('93 pourcent');
      expect(formatPercentageForA11y(0)).toBe('0 pourcent');
      expect(formatPercentageForA11y(100)).toBe('100 pourcent');
    });
  });

  describe('createButtonA11y', () => {
    it('should create correct button props', () => {
      const props = createButtonA11y('Submit', 'Submits the form', false);

      expect(props.accessible).toBe(true);
      expect(props.accessibilityRole).toBe('button');
      expect(props.accessibilityLabel).toBe('Submit');
      expect(props.accessibilityHint).toBe('Submits the form');
      expect(props.accessibilityState?.disabled).toBe(false);
    });

    it('should handle disabled state', () => {
      const props = createButtonA11y('Submit', undefined, true);
      expect(props.accessibilityState?.disabled).toBe(true);
    });

    it('should work without hint', () => {
      const props = createButtonA11y('Submit');
      expect(props.accessibilityLabel).toBe('Submit');
      expect(props.accessibilityHint).toBeUndefined();
    });
  });

  describe('createSliderA11y', () => {
    it('should create correct slider props', () => {
      const props = createSliderA11y('Volume', 50, 0, 100);

      expect(props.accessible).toBe(true);
      expect(props.accessibilityRole).toBe('adjustable');
      expect(props.accessibilityLabel).toBe('Volume');
      expect(props.accessibilityValue).toEqual({
        min: 0,
        max: 100,
        now: 50,
      });
    });

    it('should include increment/decrement actions', () => {
      const props = createSliderA11y('Volume', 50, 0, 100);

      expect(props.accessibilityActions).toHaveLength(2);
      expect(props.accessibilityActions?.[0].name).toBe('increment');
      expect(props.accessibilityActions?.[1].name).toBe('decrement');
    });
  });

  describe('createSwitchA11y', () => {
    it('should create correct switch props', () => {
      const props = createSwitchA11y('Dark Mode', true);

      expect(props.accessible).toBe(true);
      expect(props.accessibilityRole).toBe('switch');
      expect(props.accessibilityLabel).toBe('Dark Mode');
      expect(props.accessibilityState?.checked).toBe(true);
    });

    it('should handle unchecked state', () => {
      const props = createSwitchA11y('Dark Mode', false);
      expect(props.accessibilityState?.checked).toBe(false);
    });
  });

  describe('createProgressA11y', () => {
    it('should create correct progress props', () => {
      const props = createProgressA11y('Download', 75, 100);

      expect(props.accessible).toBe(true);
      expect(props.accessibilityRole).toBe('progressbar');
      expect(props.accessibilityLabel).toBe('Download');
      expect(props.accessibilityValue).toEqual({
        min: 0,
        max: 100,
        now: 75,
        text: '75%',
      });
    });

    it('should calculate percentage correctly', () => {
      const props = createProgressA11y('Loading', 1, 3);
      expect(props.accessibilityValue?.text).toBe('33%');
    });
  });

  describe('WCAG Compliance', () => {
    it('should enforce minimum touch target of 44px', () => {
      expect(MIN_TOUCH_TARGET_SIZE).toBe(44);
    });

    it('should recommend touch target of 48px', () => {
      expect(RECOMMENDED_TOUCH_TARGET_SIZE).toBe(48);
    });

    it('should define AA contrast ratios', () => {
      expect(CONTRAST_RATIO.AA_NORMAL).toBe(4.5);
      expect(CONTRAST_RATIO.AA_LARGE).toBe(3);
    });

    it('should define AAA contrast ratios', () => {
      expect(CONTRAST_RATIO.AAA_NORMAL).toBe(7);
      expect(CONTRAST_RATIO.AAA_LARGE).toBe(4.5);
    });
  });

  describe('Real-world color combinations', () => {
    it('should validate FlowNav primary colors', () => {
      // Primary blue on white
      const result1 = meetsContrastRatio('#2196F3', '#FFFFFF', 'AA', false);
      expect(result1.passes).toBe(true);

      // Success green on white
      const result2 = meetsContrastRatio('#4CAF50', '#FFFFFF', 'AA', false);
      expect(result2.passes).toBe(true);
    });

    it('should validate dark mode colors', () => {
      // White text on dark background
      const result = meetsContrastRatio('#FFFFFF', '#121212', 'AA', false);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeGreaterThan(15);
    });

    it('should catch poor contrast combinations', () => {
      // Light gray on white (poor contrast)
      const result = meetsContrastRatio('#CCCCCC', '#FFFFFF', 'AA', false);
      expect(result.passes).toBe(false);
    });
  });
});
