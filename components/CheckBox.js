import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { TouchableOpacity } from 'react-native';

const CheckBox = ({
  indeterminate = false,
  checked,
  onPress,
  size = 30,
  color = '#1976D2',
  ...props
}) => (
  <TouchableOpacity onPress={onPress} {...props}>
    <MaterialIcons
      size={size}
      color={color}
      name={
        indeterminate
          ? 'indeterminate-check-box'
          : checked
          ? 'check-box'
          : 'check-box-outline-blank'
      }
    />
  </TouchableOpacity>
);

export default CheckBox;
