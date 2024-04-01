import {ParamListBase} from '@react-navigation/native';
import {useNavigation as useNativeNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

export default function useNavigation() {
  return useNativeNavigation<NativeStackNavigationProp<ParamListBase>>();
}
