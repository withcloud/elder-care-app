import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';

import useReading from '../../hooks/useReading';

export default function Measure_SpO2_record() {

  const {getSpO2} = useReading();
  const [records, setRecord] = useState([]);

  const renderItem = ({item}) => {
    return (
      <View>
        <Text style={styles.date}>{item.time}</Text>
        <View style={styles.readingContainer}>
          <View style={styles.readingItemContainer}>
            <Text>血氧</Text>
            <Text>{item.spo2}</Text>
          </View>
          <View style={styles.readingItemContainer}>
            <Text>心率</Text>
            <Text>{item.hr}</Text>
          </View>
          <View style={{...styles.readingItemContainer, paddingBottom: 0}}>
            <Text>分析結果</Text>
            <Text>{item.result}</Text>
          </View>
        </View>
        <View style={styles.separator}></View>
      </View>
    );
  };

  useEffect(() => {
    const getData = async () => {
      const result = await getSpO2();
      if ('result' in result) {
        const arr = result.result.data.json.recordSPO2s;
        const recordArr = [];
        arr.map(item => {
          const utcDate = new Date(item.createdAt);
          const localTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
          const timeStr = JSON.stringify(localTime);
          recordArr.push({...item, time: `${timeStr.substring(1,11)}  ${timeStr.substring(12,17)}`});
        });
        setRecord([...recordArr].reverse());
      }
    };
    getData();
  }, []);

  return (
    <View>
      <FlatList
        data={records}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
  },
  readingContainer: {
    padding: 10,
  },
  readingItemContainer: {
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    height: 10,
    backgroundColor: '#E0E0E0',
  },
});
