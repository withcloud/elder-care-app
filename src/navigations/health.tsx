import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Health from '../pages/health/Health';
import Measure_SpO2 from '../pages/health/Measure_SpO2';
import Measure_BP from '../pages/health/Measure_BP';

export type RootStackParamList = {
  Health: undefined;
  Measure_SpO2: undefined;
  Measure_BP: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function HealthNav() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Health"
        component={Health}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Measure_SpO2"
        component={Measure_SpO2}
        options={{headerTitle: '血氧檢測'}}
      />
      <Stack.Screen
        name="Measure_BP"
        component={Measure_BP}
        options={{headerTitle: '血壓檢測'}}
      />
    </Stack.Navigator>
  );
}
