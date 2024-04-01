import React from 'react';
// import Navigation from './navigations';
import {View, Text} from 'react-native';
import DeviceTest from './src/pages/deviceTest';

// export default function App() {
//   return <Navigation />;
// }

export default function App() {
  // console.log('app start');
  return (
    <View>
      <DeviceTest />
    </View>
  );
}
