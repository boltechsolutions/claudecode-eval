import { StyleSheet, Text, View } from 'react-native';
import { LeaveRequest, LeaveStatus } from '../types/leave';
import { ActionButton } from './ActionButton';

export const STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: '#6b7280',
  approved: '#16a34a',
  rejected: '#dc2626',
};

type Props = {
  request: LeaveRequest;
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
};

export function LeaveCard({ request, onApprove, onReject }: Props) {
  const { name, dates, status } = request;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.dates}>{dates}</Text>
        <Text style={[styles.status, { color: STATUS_COLORS[status] }]}>{status}</Text>
      </View>
      {status === 'pending' && (
        <View style={styles.actions}>
          <ActionButton
            label="Approve"
            color={STATUS_COLORS.approved}
            accessibilityLabel={`Approve leave for ${name}`}
            onPress={() => onApprove(request)}
          />
          <ActionButton
            label="Reject"
            color={STATUS_COLORS.rejected}
            accessibilityLabel={`Reject leave for ${name}`}
            onPress={() => onReject(request)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  info: { gap: 4 },
  name: { fontSize: 17, fontWeight: '600', color: '#111827' },
  dates: { fontSize: 14, color: '#374151' },
  status: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
