import React, {useState, useEffect} from 'react';
import {View, Text, Button, Platform, PermissionsAndroid, NativeEventEmitter, NativeModules} from 'react-native';

import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function DeviceTest() {

  const [deviceList, setDevviceList] = useState([]);
  const [isConnect, setIsConnect] = useState(false);

  const serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  const characteristicUUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

  // 啟用 ble-manager
  BleManager.start({showAlert: false}).then(() => {
    console.log('Module initialized');
  });

  // 請求藍牙授權
  async function requestPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      // For Android 12 and above
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];
      const result = await PermissionsAndroid.requestMultiple(permissions);
      console.log('request : ', result);
    } else if (Platform.OS === 'android') {
      // For below Android 12
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      console.log('request : ', result);
    }
  }
  requestPermissions();

  // scan device
  const scanDevices = async () => {
    setDevviceList([]);
    setIsConnect(false);
    BleManager.scan([], 5, true).then(() => {
      console.log('Scanning...');
      setTimeout(() => {
        BleManager.getDiscoveredPeripherals().then(devices => {
          console.log('Discovered devices:', devices[0]);
          // devices.map(device => console.log(device.name));
          const deviceFilter = devices.filter(item => item.name !== null && item.name.includes('PC')); // lower case
          console.log('Discovered devices:', deviceFilter[0]);
          setDevviceList(deviceFilter);
          deviceFilter.map(device => console.log(device.name));
          console.log('Scan done');
        });
      }, 3000);
    });
  };

  // connect device
  const connectToDevice = async () => {
    try {
      await BleManager.connect(deviceList[0].id);
      setIsConnect(true);
    } catch (error) {
      console.error('連接失敗', error);
    }
  };
  
  // 連接成功後，訂閱通知
  const notification = async () => {
      await BleManager.startNotification(deviceList[0].id, serviceUUID, characteristicUUID);
      bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({ value, peripheral, characteristic, service }) => {
        // 處理接收到的數據
        const data = new Uint8Array(value);
        console.log('data', data);
      });
      console.log('已訂閱')
  };

  // check connect
  // const checkConnection = async () => {
  //   const isConnected = await BleManager.isPeripheralConnected(deviceList[0].id, []);
  //   console.log('裝置是否連接：', isConnected);
  //   setIsConnect(isConnected); // 更新連接狀態
  // };

  // stop notification
  // const unsubscribe = async () => {
  //   try {
  //     await BleManager.stopNotification(deviceList[0].id, serviceUUID, characteristicUUID);
  //     console.log('已停止訂閱');
  //   } catch (error) {
  //     console.error('停止訂閱失敗', error);
  //   }
  // };

  return (
    <View>
      <Button title="掃描附近藍牙裝置" onPress={scanDevices} />
      {deviceList.length > 0 && <Text>裝置：{deviceList[0].name}</Text>}
      {/* {deviceList.map((device, index) => (
        <Text key={index}>{`・name: ${device.name}, id: ${device.id}`}</Text>
      ))} */}
      <Button title="連接藍牙" onPress={connectToDevice} />
      {isConnect && <Text>已連接至 {deviceList[0].name}</Text>}
      <Button title="訂閱數據" onPress={notification} />
    </View>
  );
}
