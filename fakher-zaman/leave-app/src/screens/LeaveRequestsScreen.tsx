import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { seedLeaveRequests } from '../data/seedLeaveRequests';
import { LeaveRequest, LeaveStatus } from '../types/leave';

type StatusChange = { requestId: string; previousStatus: LeaveStatus };
type UndoEntry = { changes: StatusChange[] };

export function LeaveRequestsScreen() {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<LeaveRequest[]>(seedLeaveRequests);
  const [history, setHistory] = useState<UndoEntry[]>([]);

  const counts = useMemo(
    () =>
      requests.reduce(
        (acc, request) => {
          acc[request.status] += 1;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0 }
      ),
    [requests]
  );

  function applyStatusChange(requestId: string, status: LeaveStatus) {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    );
  }

  function pushUndoEntry(requestId: string, previousStatus: LeaveStatus) {
    setHistory((current) => [...current, { changes: [{ requestId, previousStatus }] }]);
  }

  function handleApprove(requestId: string) {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;
    pushUndoEntry(requestId, request.status);
    applyStatusChange(requestId, 'approved');
  }

  function handleReject(requestId: string) {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    Alert.alert(
      'Reject leave?',
      `Reject ${request.name}'s leave for ${request.dates}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            pushUndoEntry(requestId, request.status);
            applyStatusChange(requestId, 'rejected');
          },
        },
      ]
    );
  }

  function handleUndo() {
    if (history.length === 0) return;

    const lastEntry = history[history.length - 1];
    setRequests((current) =>
      current.map((request) => {
        const change = lastEntry.changes.find((c) => c.requestId === request.id);
        return change ? { ...request, status: change.previousStatus } : request;
      })
    );
    setHistory((current) => current.slice(0, -1));
  }

  const undoDisabled = history.length === 0;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>Leave Requests</Text>
      <Text style={styles.summary}>
        Pending: {counts.pending} · Approved: {counts.approved} · Rejected: {counts.rejected}
      </Text>

      <FlatList
        style={styles.list}
        data={requests}
        keyExtractor={(request) => request.id}
        renderItem={({ item }) => (
          <LeaveRequestCard request={item} onApprove={handleApprove} onReject={handleReject} />
        )}
      />

      <Pressable
        style={[styles.undoButton, undoDisabled && styles.undoButtonDisabled]}
        onPress={handleUndo}
        disabled={undoDisabled}
        accessibilityRole="button"
        accessibilityLabel="Undo last action"
        accessibilityState={{ disabled: undoDisabled }}
      >
        <Text style={styles.undoButtonText}>Undo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  summary: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  undoButton: {
    backgroundColor: '#374151',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  undoButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  undoButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
