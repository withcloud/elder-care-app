import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';

import useBluetooth from '../../hooks/useBluetooth';

export default function Measure_SpO2() {
  const serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  const characteristicUUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
  const prefix = 'PC-60F_SN857046';
  const deviceId = 'E9:D1:6B:E2:B3:56';
  // const deviceId = '00:00:00:86:47:6E'; // 另一個血氧機
  
  const {deviceList, isConnect, logData, requestPermissions, scanDevices, connectToDevice, startNotification, unsubscribe} = useBluetooth(serviceUUID, characteristicUUID, prefix);

  const [spo2, setSpo2] = useState(0);
  const [hr, setHr] = useState(0);
  // const [pi, setPi] = useState(0); // 暫不用

  const [isFinished, setIsFinished] = useState(false);

  const uploadData = async () => {
    if (isFinished) {
      // 檢查數值是否正常
      const is_normal = true;
      const description = '脈搏節奏律未見異常';

      // 用api傳送數據

      setIsFinished(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      let connected = false;
      let subscribed = false;
      await requestPermissions();
      setIsFinished(false);
      while (!connected) {
        connected = await connectToDevice(deviceId);
      }
      while (!subscribed) {
        subscribed = await startNotification(deviceId);
      }
    };
    initialize();

  }, []);

  // 數據處理
  useEffect(() => {
    if (logData.length > 9) {
      if (logData[3] === 7) {
        // 脈搏圖

      } else if (logData[3] === 8) {
        console.log(logData);
        setSpo2(logData[5]);
        setHr(logData[6]);

      } else if (logData[3] === 6 && logData[6] === 3) {
        console.log(logData);
        setSpo2(logData[7]);
        setHr(logData[8]);
        setIsFinished(true);
        unsubscribe();
      }
    }
  }, [logData]);


  return (
    <View>
      <Button title="掃描附近藍牙裝置" onPress={scanDevices} />
      {deviceList.length > 0 && <Text>裝置：{deviceList[0].name}</Text>}
      {/* {deviceList.map((device, index) => (
        <Text key={index}>{`・name: ${device.name}, id: ${device.id}`}</Text>
      ))} */}
      <Button title="連接藍牙" onPress={() => connectToDevice(deviceId)} />
      {isConnect && <Text>已連接至 {deviceList.length > 0 ? deviceList[0].name : 'PC-60F_SN857046'}</Text>}
      <Button title="訂閱數據" onPress={() => startNotification(deviceId)} />
      {/* <Text>output : {JSON.stringify(logData)}</Text>
      <Button title="停止訂閱" onPress={unsubscribe} />
      <Button title="連線狀態" onPress={checkConnection} /> */}

      <View style={styles.readingContainer}>
        <View style={styles.readingItem}>
          <Text style={styles.reading}>{spo2 !== 0 ? spo2 : '- -'}</Text>
          <Text style={styles.readingName}>血氧</Text>
        </View>
        {/* PI值 */}
        {/* <View style={styles.readingItem}>
          <Text style={styles.reading}>{pi !== 0 ? pi : '- -'}</Text>
          <Text style={styles.readingName}>PI</Text>
        </View> */}
        <View style={styles.readingItem}>
          <Text style={styles.reading}>{hr !== 0 ? hr : '- -'}</Text>
          <Text style={styles.readingName}>心率</Text>
        </View>
      </View>

      <Text style={styles.connect}>設備：{isConnect ? '已連接' : '未連接'}</Text>
      <TouchableOpacity style={{...styles.saveBtn, backgroundColor: isFinished ? '#02C874' : '#BEBEBE'}} onPress={uploadData}>
        <Text style={styles.saveBtnTxt}>保存結果</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  readingContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 30,
    paddingBottom: 30,
  },
  readingItem: {},
  reading: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#02C874',
    textAlign: 'center',
  },
  readingName: {
    fontSize: 15,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  connect: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
  },
  saveBtn: {
    paddingTop: 10,
    paddingBottom: 12,
    marginHorizontal: '15%',
    borderRadius: 30,
  },
  saveBtnTxt: {
    // fontSize: 12,
    textAlign: 'center',
    color: 'white',
    // borderWidth: 1,
    // borderStyle: 'solid',
    // borderColor: 'black',
  },
});
