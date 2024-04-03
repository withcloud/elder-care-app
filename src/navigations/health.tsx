import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Health from '../pages/health/Health';
import Measure_SpO2 from '../pages/health/Measure_SpO2';
import Measure_SpO2_record from '../pages/health/Measure_SpO2_record';
import Measure_BP from '../pages/health/Measure_BP';
import Measure_BP_record from '../pages/health/Measure_BP_record';

export type RootStackParamList = {
  Health: undefined;
  Measure_SpO2: undefined;
  Measure_SpO2_record: undefined;
  Measure_BP: undefined;
  Measure_BP_record: undefined;
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
        name="Measure_SpO2_record"
        component={Measure_SpO2_record}
        options={{headerTitle: '血氧檢測記錄'}}
      />
      <Stack.Screen
        name="Measure_BP"
        component={Measure_BP}
        options={{headerTitle: '血壓檢測'}}
      />
      <Stack.Screen
        name="Measure_BP_record"
        component={Measure_BP_record}
        options={{headerTitle: '血壓檢測記錄'}}
      />
    </Stack.Navigator>
  );
}
