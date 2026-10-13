import { useReducer } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import LeaveTable from '../components/LeaveTable';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveRequest = {
  id: string;
  name: string;
  dates: string;
  status: LeaveStatus;
};

type Change = { id: string; previousStatus: LeaveStatus };

// One entry per user action, so a single Undo reverts every request that action changed.
type HistoryEntry = { changes: Change[] };

type State = { requests: LeaveRequest[]; history: HistoryEntry[] };

type Action =
  | { type: 'decide'; id: string; status: 'approved' | 'rejected' }
  | { type: 'approveAll' }
  | { type: 'undo' };

// In-memory only: every app start begins from this data with an empty undo history.
const INITIAL_REQUESTS: LeaveRequest[] = [
  { id: '1', name: 'Ali Khan', dates: '3-5 Mar', status: 'pending' },
  { id: '2', name: 'Sara Ahmed', dates: '10-12 Mar', status: 'approved' },
  { id: '3', name: 'Omar Raza', dates: '18-19 Mar', status: 'pending' },
  { id: '4', name: 'Hina Malik', dates: '24-26 Mar', status: 'pending' },
];

const INITIAL_STATE: State = { requests: INITIAL_REQUESTS, history: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'decide': {
      const target = state.requests.find((r) => r.id === action.id);
      // Ignore repeat taps once a request is no longer pending.
      if (!target || target.status !== 'pending') return state;
      return {
        requests: state.requests.map((r) =>
          r.id === action.id ? { ...r, status: action.status } : r,
        ),
        history: [
          ...state.history,
          { changes: [{ id: action.id, previousStatus: target.status }] },
        ],
      };
    }
    case 'approveAll': {
      const pending = state.requests.filter((r) => r.status === 'pending');
      if (pending.length === 0) return state;
      return {
        requests: state.requests.map((r) =>
          r.status === 'pending' ? { ...r, status: 'approved' } : r,
        ),
        history: [
          ...state.history,
          { changes: pending.map((r) => ({ id: r.id, previousStatus: r.status })) },
        ],
      };
    }
    case 'undo': {
      const last = state.history[state.history.length - 1];
      if (!last) return state;
      const previous = new Map(last.changes.map((c) => [c.id, c.previousStatus]));
      return {
        requests: state.requests.map((r) => {
          const status = previous.get(r.id);
          return status ? { ...r, status } : r;
        }),
        history: state.history.slice(0, -1),
      };
    }
  }
}

export default function LeaveRequestsScreen() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const canUndo = state.history.length > 0;
  const pendingCount = state.requests.filter((r) => r.status === 'pending').length;

  const handleApprove = (request: LeaveRequest) => {
    dispatch({ type: 'decide', id: request.id, status: 'approved' });
  };

  const handleReject = (request: LeaveRequest) => {
    Alert.alert('Reject leave?', `Reject ${request.name}'s leave for ${request.dates}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => dispatch({ type: 'decide', id: request.id, status: 'rejected' }),
      },
    ]);
  };

  const handleApproveAll = () => {
    const noun = pendingCount === 1 ? 'request' : 'requests';
    Alert.alert(`Approve ${pendingCount} pending ${noun}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => dispatch({ type: 'approveAll' }) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title} accessibilityRole="header">
        Leave Requests
      </Text>

      <View style={styles.toolbar}>
        <ActionButton
          label="Approve all"
          variant="approve"
          disabled={pendingCount === 0}
          onPress={handleApproveAll}
          accessibilityLabel={`Approve all ${pendingCount} pending requests`}
          accessibilityHint="Asks for confirmation, then approves every pending request"
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <LeaveTable
          requests={state.requests}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          label="Undo"
          variant="neutral"
          disabled={!canUndo}
          onPress={() => dispatch({ type: 'undo' })}
          accessibilityLabel="Undo last action"
          accessibilityHint="Reverts the most recent action, including Approve all"
        />
      </View>
    </View>
  );
}

// Core SafeAreaView is deprecated and no safe-area package is installed, so pad manually.
const TOP_INSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 54;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: TOP_INSET + 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  toolbar: {
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
});
