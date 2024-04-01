import React from 'react';
import {View, Text, Button} from 'react-native';

import useNavigation from '../../hooks/useNavigation';

export default function Health() {
  const navigation = useNavigation();

  return (
    <View>
      <Button title="血氧" onPress={() => {
        navigation.navigate('Measure_SpO2')
      }} />
      <Button title="血壓" onPress={() => {
        navigation.navigate('Measure_BP')
      }} />
    </View>
  );
}
