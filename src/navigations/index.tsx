import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HealthNav from './health';
import UserNav from './user';

export type MainNavigatorParamList = {
  HealthNav: undefined;
  UserNav: undefined;
};

const Tab = createBottomTabNavigator<MainNavigatorParamList>();

export default function MainNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="HealthNav"
          component={HealthNav}
          options={{
            title: '健康檢測',
            headerShown: false,
            // tabBarIcon: ({color, size, focused}) =>
            //   focused ? (
            //     <BeakerSolidIcon color={color} size={size} />
            //   ) : (
            //     <BeakerOutlineIcon color={color} size={size} />
            //   ),
            tabBarAccessibilityLabel: '健康檢測',
          }}
        />
        <Tab.Screen
          name="UserNav"
          component={UserNav}
          options={{
            title: '我的帳號',
            headerShown: false,
            // tabBarIcon: ({color, size, focused}) =>
            //   focused ? (
            //     <BeakerSolidIcon color={color} size={size} />
            //   ) : (
            //     <BeakerOutlineIcon color={color} size={size} />
            //   ),
            tabBarAccessibilityLabel: '我的帳號',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
