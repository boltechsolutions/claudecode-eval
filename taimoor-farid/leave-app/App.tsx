import { StatusBar } from 'expo-status-bar';
import { LeaveRequestsScreen } from './src/screens/LeaveRequestsScreen';

export default function App() {
  return (
    <>
      <LeaveRequestsScreen />
      <StatusBar style="auto" />
    </>
  );
}
