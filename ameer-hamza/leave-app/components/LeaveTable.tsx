import { StyleSheet, Text, View } from 'react-native';

import type { LeaveRequest, LeaveStatus } from '../app/LeaveRequestsScreen';
import ActionButton from './ActionButton';

type Props = {
  requests: LeaveRequest[];
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
};

const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: '#d97706',
  approved: '#16a34a',
  rejected: '#dc2626',
};

export default function LeaveTable({ requests, onApprove, onReject }: Props) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]} accessibilityRole="header">
        <Text style={[styles.nameCell, styles.headerText]}>Name</Text>
        <Text style={[styles.datesCell, styles.headerText]}>Dates</Text>
        <Text style={[styles.statusCell, styles.headerText]}>Status</Text>
      </View>

      {requests.map((request) => (
        <View key={request.id} style={styles.row}>
          <Text style={[styles.nameCell, styles.cellText]}>{request.name}</Text>
          <Text style={[styles.datesCell, styles.cellText]}>{request.dates}</Text>
          <View style={styles.statusCell}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[request.status] }]}>
              {STATUS_LABELS[request.status]}
            </Text>
            {request.status === 'pending' && (
              <View style={styles.actions}>
                <ActionButton
                  label="Approve"
                  variant="approve"
                  onPress={() => onApprove(request)}
                  accessibilityLabel={`Approve ${request.name}'s leave`}
                />
                <ActionButton
                  label="Reject"
                  variant="reject"
                  onPress={() => onReject(request)}
                  accessibilityLabel={`Reject ${request.name}'s leave`}
                />
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    backgroundColor: '#f3f4f6',
  },
  headerText: {
    fontWeight: '700',
    color: '#111827',
  },
  cellText: {
    color: '#1f2937',
  },
  nameCell: {
    flex: 1.2,
    paddingRight: 6,
  },
  datesCell: {
    flex: 1,
    paddingRight: 6,
  },
  statusCell: {
    flex: 1.4,
  },
  statusText: {
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
});
