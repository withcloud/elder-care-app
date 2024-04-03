import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity, Alert} from 'react-native';

import useBluetooth from '../../hooks/useBluetooth';
import useNavigation from '../../hooks/useNavigation';
import useReading from '../../hooks/useReading';

export default function Measure_SpO2() {

  const navigation = useNavigation();
  const {uploadSpO2} = useReading();

  const serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  const characteristicUUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
  const prefix = 'PC-60F_SN857046';
  const deviceId = 'E9:D1:6B:E2:B3:56';
  // const deviceId = '00:00:00:86:47:6E'; // 另一台血氧機
  
  const {deviceList, isConnect, isSubscribed, logData, requestPermissions, scanDevices, connectToDevice, startNotification, checkConnection, unsubscribe} = useBluetooth(deviceId, serviceUUID, characteristicUUID, prefix);

  const [currentPulse, setCurrentPulse] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [hr, setHr] = useState(0);
  const [isNormal, setIiNormal] = useState(true);
  const [result, setResult] = useState('')

  const [isFinished, setIsFinished] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadData = async () => {
    setUploading(true);
    // 用api傳送數據
    const upload = async () => {
      const res = await uploadSpO2({
        json: {
          customerId: 'user_2eU9ZdXrlOI1UA0Jl1WNm90duK1',
          spo2,
          pi: '0',
          hr,
          isNormal,
          result,
        },
      });
      if ('result' in res) {
        setCurrentPulse(0);
        setSpo2(0);
        setHr(0);
        setIsFinished(false);
        setUploading(false);
      } else if ('error' in res) {
        Alert.alert('上傳資料失敗');
      }
    };
    upload();
  };

  // 數據處理
  useEffect(() => {
    if (!isFinished && logData.length > 9) {
      if (logData[3] === 7) {
        // 脈搏圖
        if (logData[5] < 180) setCurrentPulse(logData[5]);
        // console.log(logData)

      } else if (logData[3] === 8) {
        // console.log(logData);
        setSpo2(logData[5]);
        setHr(logData[6]);

      } else if (logData[3] === 6 && logData[6] === 3) {
        // 檢查數值是否正常
        // console.log(logData);
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
      <Button title="連接藍牙" onPress={() => connectToDevice()} />
      <Button title="訂閱數據" onPress={() => startNotification()} />
      {/* <Text>output : {JSON.stringify(logData)}</Text>
      <Button title="停止訂閱" onPress={unsubscribe} />
      <Button title="連線狀態" onPress={checkConnection} /> */}

      <Button title="歷史測量記錄" onPress={() => navigation.navigate('Measure_SpO2_record')} />

      {isConnect ?
        <Text style={{color: 'red', marginLeft: 8}}>設備：已連接至 {deviceList.length > 0 ? deviceList[0].name : 'PC-60F_SN857046'}</Text>
      :
        <Text style={{marginLeft: 8}}>設備：未連接</Text>
      }

      <Text style={{textAlign: 'center', marginTop: 20}}>current Pulse : {currentPulse}</Text>

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

      {isFinished && <Text style={styles.finished}>測量完成</Text>}
      <TouchableOpacity 
      style={{...styles.saveBtn, backgroundColor: isFinished ? '#02C874' : '#BEBEBE'}} 
      disabled={!isFinished || uploading}
      onPress={uploadData}>
        <Text style={styles.saveBtnTxt}>保存結果</Text>
      </TouchableOpacity>

      <Text>isConnect: {JSON.stringify(isConnect)}</Text>
      <Text>isSubscribed: {JSON.stringify(isSubscribed)}</Text>
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
  finished: {
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
