import {useEffect, useState} from 'react';
import {View, Text, Button, Platform, PermissionsAndroid, NativeEventEmitter, NativeModules} from 'react-native';
import BleManager from 'react-native-ble-manager';

export default function useBluetooth(serviceUUID, characteristicUUID, prefix = '') {
  const BleManagerModule = NativeModules.BleManager;
  const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

  const [deviceList, setDevviceList] = useState([]);
  const [isConnect, setIsConnect] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [logData, setLogData] = useState('');

  useEffect(() => {
    // 啟用 ble-manager
    BleManager.start({showAlert: false}).then(() => {
      console.log('Module initialized');
    });

    const connection = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
        console.log('斷線');
        setIsConnect(false);
      },
    );

    const subscription = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({ value, peripheral, characteristic, service }) => {
        // 處理接收到的數據
        const data = new Uint8Array(value);
        setLogData(data);
      },
    );

    return () => {
      connection.remove();
      subscription.remove();
    };
  }, []);

  // 請求藍牙授權
  async function requestPermissions() {
    console.log('requestPermissions');
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

  // Scan
  const scanDevices = async () => {
    setDevviceList([]);
    setIsConnect(false);
    BleManager.scan([], 5, true).then(() => {
      console.log('Scanning...');
      setTimeout(() => {
        BleManager.getDiscoveredPeripherals().then(devices => {
          // devices.map(device => console.log(device.name));
          const deviceFilter = devices.filter(item => item.name !== null && item.name.includes(prefix)); // 之後改lower case判斷
          setDevviceList(deviceFilter);
          deviceFilter.map(device => console.log(device.name));
          console.log('Scan done');
        });
      }, 3000);
    });
  };

  // Connect
  const connectToDevice = async (deviceId) => {
    console.log('開始嘗試連線');
    setIsConnect(false);
    try {
      await BleManager.connect(deviceId);
      setIsConnect(true);
      return true;
    } catch (error) {
      console.error('連接失敗', error);
      return false;
    }
  };

  // Subscribed
  const startNotification = async (deviceId) => {
    try {
      await BleManager.startNotification(deviceId, serviceUUID, characteristicUUID);
      console.log('已訂閱');
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('訂閱失敗', error);
      return false;
    }
  };

  // check connected
  // const checkConnection = async () => {
  //   const isConnected = await BleManager.isPeripheralConnected(deviceList[0].id, []);
  //   console.log('裝置是否連接：', isConnected);
  //   setIsConnect(isConnected); // 更新連接狀態
  // };

  // stop notification
  const unsubscribe = async () => {
    try {
      await BleManager.stopNotification(deviceList[0].id, serviceUUID, characteristicUUID);
      console.log('已停止訂閱');
    } catch (error) {
      console.error('停止訂閱失敗', error);
    }
  };


  return {
    deviceList,
    isConnect,
    logData,
    requestPermissions,
    scanDevices,
    connectToDevice,
    startNotification,
    // checkConnection,
    unsubscribe,
  };
}
