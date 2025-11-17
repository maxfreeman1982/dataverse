/**
 * Mock for react-native-vector-icons
 */

import React from 'react';
import { Text } from 'react-native';

const Icon = ({ name, ...props }) => {
  return React.createElement(Text, { ...props, testID: `icon-${name}` }, name);
};

export default Icon;
