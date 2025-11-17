/**
 * Jest Setup File
 *
 * Global configuration and mocks for all tests
 */

// Mock AsyncStorage
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      Version: 14,
    },
    Vibration: {
      vibrate: jest.fn(),
      cancel: jest.fn(),
    },
    AccessibilityInfo: {
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
      isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
      isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
      addEventListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
      announceForAccessibility: jest.fn(),
      setAccessibilityFocus: jest.fn(),
    },
    Appearance: {
      getColorScheme: jest.fn(() => 'light'),
      addChangeListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
    Dimensions: {
      get: jest.fn(() => ({
        width: 375,
        height: 812,
      })),
      addEventListener: jest.fn(),
    },
    NativeModules: {
      ...RN.NativeModules,
      PushNotificationIOS: {
        addEventListener: jest.fn(),
        requestPermissions: jest.fn(() => Promise.resolve()),
        getInitialNotification: jest.fn(() => Promise.resolve()),
      },
    },
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MapView = (props) => React.createElement(View, props, props.children);
  MapView.Marker = (props) => React.createElement(View, props, props.children);
  MapView.Polyline = (props) => React.createElement(View, props, props.children);
  MapView.Circle = (props) => React.createElement(View, props, props.children);

  return MapView;
});

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  ProgressChart: 'ProgressChart',
  ContributionGraph: 'ContributionGraph',
  StackedBarChart: 'StackedBarChart',
}));

// Mock PushNotification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn((callback) => callback([])),
  removeAllDeliveredNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn((callback) => callback([])),
  createChannel: jest.fn(),
}));

// Mock haptic feedback
jest.mock('react-native-haptic-feedback', () => ({
  default: {
    trigger: jest.fn(),
  },
}));

// Global test utilities
global.flushPromises = () => new Promise(setImmediate);

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn((message) => {
    if (
      !message.includes('Warning: ReactDOM.render') &&
      !message.includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      originalWarn(message);
    }
  });

  console.error = jest.fn((message) => {
    if (
      !message.includes('Warning: ReactDOM.render') &&
      !message.includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      originalError(message);
    }
  });
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Extend expect with custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
