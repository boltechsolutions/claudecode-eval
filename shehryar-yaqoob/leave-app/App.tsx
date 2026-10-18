import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { LeaveRequestsScreen } from './src/screens/LeaveRequestsScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <LeaveRequestsScreen />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
