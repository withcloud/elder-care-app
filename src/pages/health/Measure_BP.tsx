import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity, Alert} from 'react-native';

import useBluetooth from '../../hooks/useBluetooth';
import useNavigation from '../../hooks/useNavigation';
import useReading from '../../hooks/useReading';

export default function Measure_BP() {

  const navigation = useNavigation();
  const {uploadBp} = useReading();

  const serviceUUID = "1000";
  const characteristicUUID = "1002";
  const prefix = 'Bioland-BPM';
  const deviceId = 'CD:13:1D:00:E8:02';

  const {deviceList, isConnect, logData, requestPermissions, scanDevices, connectToDevice, startNotification, checkConnection, unsubscribe} = useBluetooth(deviceId, serviceUUID, characteristicUUID, prefix);

  const [currentBp, setCurrentBp] = useState(0);
  const [sbp, setSbp] = useState(0);
  const [dbp, setDbp] = useState(0);
  const [hr, setHr] = useState(0);
  const [side, setSide] = useState('null');

  const [isFinished, setIsFinished] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadData = async () => {
    setUploading(true);
    if (!uploading) {
      // 用api傳送數據
      const upload = async () => {
        const res = await uploadBp({
          json: {
            customerId: 'user_2eU9ZdXrlOI1UA0Jl1WNm90duK1',
            sbp,
            dbp,
            hr,
            side,
          },
        });
        if ('result' in res) {
          setCurrentBp(0);
          setSbp(0);
          setDbp(0);
          setHr(0);
          setSide('null');
          setIsFinished(false);
          setUploading(false);
        } else if ('error' in res) {
          Alert.alert('上傳資料失敗');
        }
      };
      upload();
    }
  };

  // 數據處理
  useEffect(() => {
    console.log(logData);
    if (!isFinished && logData.length > 7) {
      if (logData[1] === 8) {
        setCurrentBp(logData[5]);

      } else if (logData[1] === 14) {
        console.log(logData);
        setSbp(logData[9]);
        setDbp(logData[11]);
        setHr(logData[12]);
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

      <Button title="歷史測量記錄" onPress={() => navigation.navigate('Measure_BP_record')} />

      {isConnect ?
        <Text style={{color: 'red', marginLeft: 8}}>設備：已連接至 {deviceList.length > 0 ? deviceList[0].name : 'Bioland-BPM'}</Text>
      :
        <Text style={{marginLeft: 8}}>設備：未連接</Text>
      }

      <Text style={{textAlign: 'center', marginTop: 20}}>current BP : {currentBp}</Text>

      <View style={styles.readingContainer}>
        <View style={styles.readingItem}>
          <Text style={styles.reading}>{sbp !== 0 ? sbp : '- -'}</Text>
          <Text style={styles.readingName}>上壓</Text>
        </View>
        <View style={styles.readingItem}>
          <Text style={styles.reading}>{dbp !== 0 ? dbp : '- -'}</Text>
          <Text style={styles.readingName}>下壓</Text>
        </View>
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
