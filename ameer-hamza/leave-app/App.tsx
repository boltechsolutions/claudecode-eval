import { StatusBar } from 'expo-status-bar';

import LeaveRequestsScreen from './app/LeaveRequestsScreen';

export default function App() {
  return (
    <>
      <LeaveRequestsScreen />
      <StatusBar style="dark" />
    </>
  );
}
