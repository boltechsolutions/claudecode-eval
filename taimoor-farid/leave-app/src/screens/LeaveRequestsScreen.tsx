import { useState } from 'react';
import { Alert, FlatList, Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { LeaveCard } from '../components/LeaveCard';
import { INITIAL_LEAVE_REQUESTS } from '../data/leaveRequests';
import { HistoryEntry, LeaveRequest, LeaveStatus } from '../types/leave';

export function LeaveRequestsScreen() {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const count = (status: LeaveStatus) => requests.filter((r) => r.status === status).length;

  const changeStatus = (request: LeaveRequest, next: LeaveStatus) => {
    setHistory((h) => [...h, { id: request.id, previousStatus: request.status }]);
    setRequests((rs) => rs.map((r) => (r.id === request.id ? { ...r, status: next } : r)));
  };

  const handleApprove = (request: LeaveRequest) => changeStatus(request, 'approved');

  const handleReject = (request: LeaveRequest) => {
    Alert.alert('Reject leave?', `Reject ${request.name}'s leave for ${request.dates}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => changeStatus(request, 'rejected') },
    ]);
  };

  const handleUndo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setRequests((rs) =>
      rs.map((r) => (r.id === last.id ? { ...r, status: last.previousStatus } : r)),
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leave Requests</Text>
        <Text style={styles.summary}>
          Pending: {count('pending')} · Approved: {count('approved')} · Rejected:{' '}
          {count('rejected')}
        </Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LeaveCard request={item} onApprove={handleApprove} onReject={handleReject} />
        )}
      />
      <View style={styles.footer}>
        <ActionButton
          label="Undo"
          color="#2563eb"
          accessibilityLabel="Undo last action"
          onPress={handleUndo}
          disabled={history.length === 0}
          fullWidth
        />
      </View>
    </View>
  );
}

const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 56;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { paddingTop: TOP_INSET + 8, paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827' },
  summary: { fontSize: 15, color: '#374151' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
