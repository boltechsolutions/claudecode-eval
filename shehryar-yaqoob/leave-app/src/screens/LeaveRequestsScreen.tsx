import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LeaveRequestCard } from '../components/LeaveRequestCard';
import { LeaveSummary } from '../components/LeaveSummary';
import { seedLeaveRequests } from '../data/seedLeaveRequests';
import { LeaveRequest, LeaveStatus, UndoAction } from '../types/leave';

function setRequestStatus(
  requests: LeaveRequest[],
  id: string,
  from: LeaveStatus,
  to: LeaveStatus
): LeaveRequest[] {
  return requests.map((request) =>
    request.id === id && request.status === from ? { ...request, status: to } : request
  );
}

export function LeaveRequestsScreen() {
  const [requests, setRequests] = useState<LeaveRequest[]>(seedLeaveRequests);
  const [history, setHistory] = useState<UndoAction[]>([]);

  const pending = requests.filter((request) => request.status === 'pending').length;
  const approved = requests.filter((request) => request.status === 'approved').length;
  const rejected = requests.filter((request) => request.status === 'rejected').length;

  function handleApprove(id: string) {
    setRequests((current) => setRequestStatus(current, id, 'pending', 'approved'));
    setHistory((current) => [
      ...current,
      { entries: [{ requestId: id, previousStatus: 'pending' }] },
    ]);
  }

  function doReject(id: string) {
    setRequests((current) => setRequestStatus(current, id, 'pending', 'rejected'));
    setHistory((current) => [
      ...current,
      { entries: [{ requestId: id, previousStatus: 'pending' }] },
    ]);
  }

  function handleApproveAll() {
    const pendingIds = requests
      .filter((request) => request.status === 'pending')
      .map((request) => request.id);

    if (pendingIds.length === 0) {
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.status === 'pending' ? { ...request, status: 'approved' } : request
      )
    );

    setHistory((current) => [
      ...current,
      { entries: pendingIds.map((id) => ({ requestId: id, previousStatus: 'pending' as const })) },
    ]);
  }

  function handleRejectPress(id: string) {
    const request = requests.find((item) => item.id === id);
    if (!request) {
      return;
    }

    Alert.alert('Reject leave?', `Reject ${request.name}'s leave for ${request.dates}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => doReject(id) },
    ]);
  }

  function handleUndo() {
    if (history.length === 0) {
      return;
    }

    const lastAction = history[history.length - 1];
    const revertMap = new Map(
      lastAction.entries.map((entry) => [entry.requestId, entry.previousStatus])
    );
    setRequests((current) =>
      current.map((request) =>
        revertMap.has(request.id)
          ? { ...request, status: revertMap.get(request.id) as LeaveStatus }
          : request
      )
    );
    setHistory((current) => current.slice(0, -1));
  }

  const undoDisabled = history.length === 0;
  const approveAllDisabled = pending === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave Requests</Text>
      <Pressable
        style={[styles.approveAllButton, approveAllDisabled && styles.approveAllButtonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Approve all"
        accessibilityState={{ disabled: approveAllDisabled }}
        disabled={approveAllDisabled}
        onPress={handleApproveAll}>
        <Text style={styles.approveAllButtonText}>Approve all</Text>
      </Pressable>
      <LeaveSummary pending={pending} approved={approved} rejected={rejected} />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeaveRequestCard
            request={item}
            onApprove={handleApprove}
            onReject={handleRejectPress}
          />
        )}
      />
      <Pressable
        style={[styles.undoButton, undoDisabled && styles.undoButtonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Undo"
        accessibilityState={{ disabled: undoDisabled }}
        disabled={undoDisabled}
        onPress={handleUndo}>
        <Text style={styles.undoButtonText}>Undo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  undoButton: {
    backgroundColor: '#444444',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  undoButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  undoButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  approveAllButton: {
    backgroundColor: '#1a7f37',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  approveAllButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  approveAllButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
