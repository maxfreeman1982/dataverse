/**
 * Tests for Theme Context
 *
 * Tests theme provider, mode switching, persistence,
 * and animated transitions
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeProvider,
  useTheme,
  LightTheme,
  DarkTheme,
} from '../ThemeContext';

// Test component that uses theme
const TestComponent = () => {
  const { mode, isDark, colors, setMode, toggleTheme } = useTheme();

  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="isDark">{String(isDark)}</Text>
      <Text testID="bgColor">{colors.background}</Text>
      <Text testID="textColor">{colors.text}</Text>
      <Text
        testID="toggle"
        onPress={toggleTheme}
      >
        Toggle
      </Text>
      <Text
        testID="setLight"
        onPress={() => setMode('light')}
      >
        Light
      </Text>
      <Text
        testID="setDark"
        onPress={() => setMode('dark')}
      >
        Dark
      </Text>
      <Text
        testID="setAuto"
        onPress={() => setMode('auto')}
      >
        Auto
      </Text>
    </>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('ThemeProvider', () => {
    it('should provide default light theme', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(getByTestId('mode').children[0]).toBe('auto');
      expect(getByTestId('bgColor').children[0]).toBe(LightTheme.background);
      expect(getByTestId('textColor').children[0]).toBe(LightTheme.text);
    });

    it('should provide theme colors', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const bgColor = getByTestId('bgColor').children[0];
      expect(bgColor).toBeTruthy();
      expect(typeof bgColor).toBe('string');
      expect(bgColor).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should throw error when useTheme used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within ThemeProvider');

      console.error = originalError;
    });
  });

  describe('Mode Switching', () => {
    it('should switch to dark mode', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        getByTestId('setDark').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('mode').children[0]).toBe('dark');
        expect(getByTestId('isDark').children[0]).toBe('true');
        expect(getByTestId('bgColor').children[0]).toBe(DarkTheme.background);
      });
    });

    it('should switch to light mode', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // First set to dark
      await act(async () => {
        getByTestId('setDark').props.onPress();
      });

      // Then set to light
      await act(async () => {
        getByTestId('setLight').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('mode').children[0]).toBe('light');
        expect(getByTestId('isDark').children[0]).toBe('false');
        expect(getByTestId('bgColor').children[0]).toBe(LightTheme.background);
      });
    });

    it('should toggle theme', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const initialIsDark = getByTestId('isDark').children[0];

      await act(async () => {
        getByTestId('toggle').props.onPress();
      });

      await waitFor(() => {
        const newIsDark = getByTestId('isDark').children[0];
        expect(newIsDark).not.toBe(initialIsDark);
      });
    });
  });

  describe('Persistence', () => {
    it('should save mode to AsyncStorage', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        getByTestId('setDark').props.onPress();
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          '@flownav:theme_mode',
          'dark'
        );
      });
    });

    it('should load saved mode from AsyncStorage', async () => {
      // Pre-populate storage
      await AsyncStorage.setItem('@flownav:theme_mode', 'dark');

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(getByTestId('mode').children[0]).toBe('dark');
      });
    });

    it('should handle corrupted storage data', async () => {
      // Pre-populate with invalid mode
      await AsyncStorage.setItem('@flownav:theme_mode', 'invalid-mode');

      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should fall back to default (auto)
      await waitFor(() => {
        expect(getByTestId('mode').children[0]).toBe('auto');
      });
    });
  });

  describe('Color Palettes', () => {
    it('should have complete light theme palette', () => {
      expect(LightTheme).toHaveProperty('primary');
      expect(LightTheme).toHaveProperty('secondary');
      expect(LightTheme).toHaveProperty('background');
      expect(LightTheme).toHaveProperty('text');
      expect(LightTheme).toHaveProperty('success');
      expect(LightTheme).toHaveProperty('error');
      expect(LightTheme).toHaveProperty('warning');
      expect(LightTheme).toHaveProperty('trafficFree');
      expect(LightTheme).toHaveProperty('chartPrimary');
    });

    it('should have complete dark theme palette', () => {
      expect(DarkTheme).toHaveProperty('primary');
      expect(DarkTheme).toHaveProperty('secondary');
      expect(DarkTheme).toHaveProperty('background');
      expect(DarkTheme).toHaveProperty('text');
      expect(DarkTheme).toHaveProperty('success');
      expect(DarkTheme).toHaveProperty('error');
      expect(DarkTheme).toHaveProperty('warning');
      expect(DarkTheme).toHaveProperty('trafficFree');
      expect(DarkTheme).toHaveProperty('chartPrimary');
    });

    it('should have dark backgrounds in dark theme', () => {
      const lightBg = LightTheme.background;
      const darkBg = DarkTheme.background;

      // Dark theme background should be darker (lower RGB values)
      const lightBrightness = parseInt(lightBg.substring(1), 16);
      const darkBrightness = parseInt(darkBg.substring(1), 16);

      expect(darkBrightness).toBeLessThan(lightBrightness);
    });

    it('should have light text in dark theme', () => {
      const lightText = LightTheme.text;
      const darkText = DarkTheme.text;

      // Dark theme text should be lighter
      const lightTextBrightness = parseInt(lightText.substring(1), 16);
      const darkTextBrightness = parseInt(darkText.substring(1), 16);

      expect(darkTextBrightness).toBeGreaterThan(lightTextBrightness);
    });

    it('should have proper contrast ratios', () => {
      // Light theme: dark text on light background
      expect(LightTheme.text).toMatch(/^#[0-2]/); // Dark color
      expect(LightTheme.background).toMatch(/^#[E-F]/); // Light color

      // Dark theme: light text on dark background
      expect(DarkTheme.text).toMatch(/^#[E-F]/); // Light color
      expect(DarkTheme.background).toMatch(/^#[0-2]/); // Dark color
    });
  });

  describe('Auto Mode', () => {
    it('should follow system color scheme in auto mode', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        getByTestId('setAuto').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('mode').children[0]).toBe('auto');
        // Should use system preference (mocked as 'light' in jest.setup.js)
        expect(getByTestId('isDark').children[0]).toBe('false');
      });
    });
  });

  describe('Transition Animation', () => {
    it('should provide transition progress value', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Just verify the component renders without crashing
      // Actual animation testing would require more complex setup
      expect(getByTestId('mode')).toBeTruthy();
    });
  });

  describe('Theme Consistency', () => {
    it('should maintain color relationships across themes', () => {
      // Primary light should be related to primary
      expect(LightTheme.primaryLight).not.toBe(LightTheme.primary);
      expect(DarkTheme.primaryLight).not.toBe(DarkTheme.primary);

      // Background secondary should be different from primary background
      expect(LightTheme.backgroundSecondary).not.toBe(LightTheme.background);
      expect(DarkTheme.backgroundSecondary).not.toBe(DarkTheme.background);
    });

    it('should have distinct traffic colors', () => {
      const lightTraffic = [
        LightTheme.trafficFree,
        LightTheme.trafficModerate,
        LightTheme.trafficCongested,
        LightTheme.trafficJammed,
      ];

      const darkTraffic = [
        DarkTheme.trafficFree,
        DarkTheme.trafficModerate,
        DarkTheme.trafficCongested,
        DarkTheme.trafficJammed,
      ];

      // All colors should be unique
      expect(new Set(lightTraffic).size).toBe(4);
      expect(new Set(darkTraffic).size).toBe(4);
    });

    it('should have valid hex colors', () => {
      const validateHexColor = (color: string) => {
        return /^#[0-9A-F]{6}$/i.test(color);
      };

      Object.values(LightTheme).forEach((color) => {
        expect(validateHexColor(color)).toBe(true);
      });

      Object.values(DarkTheme).forEach((color) => {
        expect(validateHexColor(color)).toBe(true);
      });
    });
  });

  describe('Multiple Theme Switches', () => {
    it('should handle rapid mode changes', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        getByTestId('setDark').props.onPress();
        getByTestId('setLight').props.onPress();
        getByTestId('setDark').props.onPress();
        getByTestId('setAuto').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('mode').children[0]).toBe('auto');
      });

      // Should have saved all changes
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(4);
    });

    it('should maintain state consistency during transitions', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await act(async () => {
        getByTestId('setDark').props.onPress();
      });

      await waitFor(() => {
        const mode = getByTestId('mode').children[0];
        const isDark = getByTestId('isDark').children[0];
        const bgColor = getByTestId('bgColor').children[0];

        // All should be consistent
        expect(mode).toBe('dark');
        expect(isDark).toBe('true');
        expect(bgColor).toBe(DarkTheme.background);
      });
    });
  });
});
