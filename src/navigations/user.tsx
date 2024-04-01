import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import User from '../pages/user/User';

export type RootStackParamList = {
  User: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function UserNav() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="User"
        component={User}
        options={{title: '我的帳號'}}
      />
    </Stack.Navigator>
  );
}
