import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {Platform, PermissionsAndroid, NativeEventEmitter, NativeModules} from 'react-native';
import BleManager from 'react-native-ble-manager';

export default function useBluetooth(deviceId, serviceUUID, characteristicUUID, prefix = '') {
  const BleManagerModule = NativeModules.BleManager;
  const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

  const [deviceList, setDevviceList] = useState([]);
  const [isConnect, setIsConnect] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [logData, setLogData] = useState('');

  // 授權 & 每秒檢查連線
  useEffect(() => {
    const initialize = async () => {
      await requestPermissions();
    };
    initialize();

    const intervalId = setInterval(() => {
      checkConnection();
    }, 1000); // 1000毫秒 = 1秒

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 自動連接
  useFocusEffect(
    useCallback(() => {
      let shouldContinue = true;
      const startConnect = async () => {
        let connected = false;
        let subscribed = false;
        while (!connected && shouldContinue) {
          connected = await connectToDevice();
        }
        while (!subscribed && shouldContinue) {
          subscribed = await startNotification();
        }
      };
      if (!isSubscribed) {
        startConnect();
      }

      return () => {
        shouldContinue = false;
      };
    }, [isSubscribed])
  );

  useEffect(() => {
    // 啟用 ble-manager
    BleManager.start({showAlert: false}).then(() => {
      console.log('Module initialized');
    });

    // 連線監聽，訊號不穩也會視為斷線，不準確，棄用
    // const connection = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
    //     console.log('斷線');
    //     setIsConnect(false);
    //   },
    // );

    const subscription = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({ value, peripheral, characteristic, service }) => {
        // 處理接收到的數據
        const data = new Uint8Array(value);
        setLogData(data);
      },
    );

    return () => {
      // connection.remove();
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
  const connectToDevice = async () => {
    console.log('開始嘗試連線');
    // setIsConnect(false);
    try {
      await BleManager.connect(deviceId);
      // setIsConnect(true);
      console.log('連接成功');
      return true;
    } catch (error) {
      console.error('連接失敗', error);
      return false;
    }
  };

  // Subscribed
  const startNotification = async () => {
    try {
      await BleManager.startNotification(deviceId, serviceUUID, characteristicUUID);
      console.log('已訂閱');
      setIsSubscribed(true)
      return true;
    } catch (error) {
      console.error('訂閱失敗', error);
      return false;
    }
  };

  // check connected
  const checkConnection = async () => {
    try {
      const isConnected = await BleManager.isPeripheralConnected(deviceId, []);
      setIsConnect(isConnected); // 更新連接狀態
      // console.log(`!isConnected=${isConnected}, isSubscribed=${isSubscribed}`);
      if (!isConnected) {
        setIsSubscribed(false); // 若中斷連線，更新訂閱狀態=false
      }
      return true;
    } catch (error) {
      console.error('連接失敗', error);
      return false;
    }
  };

  // stop notification
  const unsubscribe = async () => {
    try {
      await BleManager.stopNotification(deviceId, serviceUUID, characteristicUUID);
      console.log('已停止訂閱');
    } catch (error) {
      console.error('停止訂閱失敗', error);
    }
  };


  return {
    deviceList,
    isConnect,
    isSubscribed,
    logData,
    requestPermissions,
    scanDevices,
    connectToDevice,
    startNotification,
    checkConnection,
    unsubscribe,
  };
}
