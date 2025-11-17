/**
 * FlowNav - Theme System with Dark Mode
 *
 * Features:
 * - Light/Dark/Auto modes
 * - Smooth animated transitions
 * - Persistent preferences
 * - System appearance detection
 * - Theme-aware components
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Animated, useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimationPresets } from '../utils/animations';

/**
 * Theme Mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Color Palette
 */
export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Surface colors
  surface: string;
  surfaceSecondary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border colors
  border: string;
  borderLight: string;

  // Shadow colors
  shadow: string;

  // Traffic colors (for map)
  trafficFree: string;
  trafficModerate: string;
  trafficCongested: string;
  trafficJammed: string;

  // Chart colors
  chartPrimary: string;
  chartSecondary: string;
  chartTertiary: string;
}

/**
 * Light Theme Palette
 */
export const LightTheme: ColorPalette = {
  // Primary
  primary: '#2196F3',
  primaryLight: '#64B5F6',
  primaryDark: '#1976D2',

  // Secondary
  secondary: '#4CAF50',
  secondaryLight: '#81C784',
  secondaryDark: '#388E3C',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EEEEEE',

  // Surface
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFAFA',

  // Text
  text: '#212121',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Status
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Border
  border: '#E0E0E0',
  borderLight: '#F5F5F5',

  // Shadow
  shadow: '#000000',

  // Traffic
  trafficFree: '#4CAF50',
  trafficModerate: '#FFC107',
  trafficCongested: '#FF9800',
  trafficJammed: '#F44336',

  // Charts
  chartPrimary: '#2196F3',
  chartSecondary: '#4CAF50',
  chartTertiary: '#FF9800',
};

/**
 * Dark Theme Palette
 */
export const DarkTheme: ColorPalette = {
  // Primary
  primary: '#42A5F5',
  primaryLight: '#64B5F6',
  primaryDark: '#1E88E5',

  // Secondary
  secondary: '#66BB6A',
  secondaryLight: '#81C784',
  secondaryDark: '#4CAF50',

  // Background
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2C2C2C',

  // Surface
  surface: '#1E1E1E',
  surfaceSecondary: '#2C2C2C',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#212121',

  // Status
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5',

  // Border
  border: '#3C3C3C',
  borderLight: '#2C2C2C',

  // Shadow
  shadow: '#000000',

  // Traffic
  trafficFree: '#66BB6A',
  trafficModerate: '#FFD54F',
  trafficCongested: '#FFA726',
  trafficJammed: '#EF5350',

  // Charts
  chartPrimary: '#42A5F5',
  chartSecondary: '#66BB6A',
  chartTertiary: '#FFA726',
};

/**
 * Theme Context Value
 */
interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  transitionProgress: Animated.Value;
}

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Storage Key
 */
const THEME_STORAGE_KEY = '@flownav:theme_mode';

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const transitionProgress = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  /**
   * Determine if dark mode is active
   */
  const computeIsDark = (themeMode: ThemeMode): boolean => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  };

  /**
   * Load saved theme preference
   */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
          const themeMode = savedMode as ThemeMode;
          setModeState(themeMode);
          const dark = computeIsDark(themeMode);
          setIsDark(dark);
          transitionProgress.setValue(dark ? 1 : 0);
        }
      } catch (error) {
        console.error('[Theme] Failed to load theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  /**
   * Update theme when system appearance changes (if mode is 'auto')
   */
  useEffect(() => {
    if (mode === 'auto') {
      const dark = systemColorScheme === 'dark';
      if (dark !== isDark) {
        setIsDark(dark);
        animateThemeTransition(dark);
      }
    }
  }, [systemColorScheme, mode]);

  /**
   * Animate theme transition
   */
  const animateThemeTransition = (toDark: boolean) => {
    Animated.timing(transitionProgress, {
      toValue: toDark ? 1 : 0,
      duration: AnimationPresets.duration.standard,
      easing: AnimationPresets.easing.standard,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Set theme mode
   */
  const setMode = async (newMode: ThemeMode) => {
    try {
      // Save preference
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);

      // Update state
      setModeState(newMode);
      const dark = computeIsDark(newMode);
      setIsDark(dark);

      // Animate transition
      animateThemeTransition(dark);
    } catch (error) {
      console.error('[Theme] Failed to save theme preference:', error);
    }
  };

  /**
   * Toggle between light and dark
   */
  const toggleTheme = async () => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    await setMode(newMode);
  };

  /**
   * Current color palette
   */
  const colors = isDark ? DarkTheme : LightTheme;

  const value: ThemeContextValue = {
    mode,
    isDark,
    colors,
    setMode,
    toggleTheme,
    transitionProgress,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook: useTheme
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

/**
 * Hook: useThemedStyles
 *
 * Create styles that automatically update with theme changes
 */
export const useThemedStyles = <T extends {}>(
  styleFactory: (colors: ColorPalette, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();
  return styleFactory(colors, isDark);
};

/**
 * Animated Theme Background
 *
 * Background that smoothly transitions between light and dark
 */
interface AnimatedThemeBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export const AnimatedThemeBackground: React.FC<AnimatedThemeBackgroundProps> = ({
  children,
  style,
}) => {
  const { transitionProgress, colors } = useTheme();

  const backgroundColor = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [LightTheme.background, DarkTheme.background],
  });

  return (
    <Animated.View
      style={[
        { flex: 1, backgroundColor },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Animated Theme Text
 *
 * Text that smoothly transitions color with theme changes
 */
interface AnimatedThemeTextProps {
  children: React.ReactNode;
  style?: any;
  type?: 'primary' | 'secondary' | 'tertiary';
}

export const AnimatedThemeText: React.FC<AnimatedThemeTextProps> = ({
  children,
  style,
  type = 'primary',
}) => {
  const { transitionProgress } = useTheme();

  const colorMap = {
    primary: {
      light: LightTheme.text,
      dark: DarkTheme.text,
    },
    secondary: {
      light: LightTheme.textSecondary,
      dark: DarkTheme.textSecondary,
    },
    tertiary: {
      light: LightTheme.textTertiary,
      dark: DarkTheme.textTertiary,
    },
  };

  const textColor = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [colorMap[type].light, colorMap[type].dark],
  });

  return (
    <Animated.Text style={[{ color: textColor }, style]}>
      {children}
    </Animated.Text>
  );
};

/**
 * Theme Toggle Button
 *
 * Button to toggle between light/dark themes
 */
interface ThemeToggleButtonProps {
  style?: any;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ style }) => {
  const { isDark, toggleTheme, transitionProgress } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    // Animate button press
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        ...AnimationPresets.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...AnimationPresets.spring.snappy,
        useNativeDriver: true,
      }),
    ]).start();

    await toggleTheme();
  };

  // Rotate icon during transition
  const rotation = transitionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }, { rotate: rotation }],
        },
        style,
      ]}
    >
      <Animated.Text
        onPress={handlePress}
        style={{
          fontSize: 32,
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </Animated.Text>
    </Animated.View>
  );
};

/**
 * Theme Mode Selector
 *
 * Radio buttons for light/dark/auto selection
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ThemeModeSelectorProps {
  onModeChange?: (mode: ThemeMode) => void;
}

export const ThemeModeSelector: React.FC<ThemeModeSelectorProps> = ({
  onModeChange,
}) => {
  const { mode, setMode, colors } = useTheme();

  const modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: 'Clair', icon: 'white-balance-sunny' },
    { value: 'dark', label: 'Sombre', icon: 'moon-waning-crescent' },
    { value: 'auto', label: 'Auto', icon: 'theme-light-dark' },
  ];

  const handleSelect = async (selectedMode: ThemeMode) => {
    await setMode(selectedMode);
    onModeChange?.(selectedMode);
  };

  return (
    <View style={themeStyles.container}>
      {modes.map((modeOption) => {
        const isSelected = mode === modeOption.value;
        return (
          <TouchableOpacity
            key={modeOption.value}
            style={[
              themeStyles.modeButton,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleSelect(modeOption.value)}
            activeOpacity={0.7}
          >
            <Icon
              name={modeOption.icon}
              size={32}
              color={isSelected ? colors.textInverse : colors.text}
            />
            <Text
              style={[
                themeStyles.modeLabel,
                {
                  color: isSelected ? colors.textInverse : colors.text,
                },
              ]}
            >
              {modeOption.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const themeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 2,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default {
  ThemeProvider,
  useTheme,
  useThemedStyles,
  AnimatedThemeBackground,
  AnimatedThemeText,
  ThemeToggleButton,
  ThemeModeSelector,
  LightTheme,
  DarkTheme,
};
