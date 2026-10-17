import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LeaveRequestsScreen } from './src/screens/LeaveRequestsScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <LeaveRequestsScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
