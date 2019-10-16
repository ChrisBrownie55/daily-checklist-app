import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback
} from 'react-native';

function Touchable(props) {
  return Platform.OS === 'android' ? (
    <TouchableNativeFeedback {...props} />
  ) : (
    <TouchableOpacity {...props} />
  );
}

export default Touchable;
