import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LeaveRequest, LeaveStatus } from '../types/leave';

type LeaveRequestCardProps = {
  request: LeaveRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

const STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: '#888888',
  approved: '#1a7f37',
  rejected: '#d1242f',
};

export function LeaveRequestCard({ request, onApprove, onReject }: LeaveRequestCardProps) {
  const { id, name, dates, status } = request;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.dates}>{dates}</Text>
      <Text style={[styles.status, { color: STATUS_COLORS[status] }]}>{status}</Text>

      {status === 'pending' && (
        <View style={styles.actions}>
          <Pressable
            style={styles.approveButton}
            accessibilityRole="button"
            accessibilityLabel={`Approve leave for ${name}`}
            onPress={() => onApprove(id)}>
            <Text style={styles.buttonText}>Approve</Text>
          </Pressable>
          <Pressable
            style={styles.rejectButton}
            accessibilityRole="button"
            accessibilityLabel={`Reject leave for ${name}`}
            onPress={() => onReject(id)}>
            <Text style={styles.buttonText}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  dates: {
    fontSize: 14,
    color: '#444444',
    marginTop: 2,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#1a7f37',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#d1242f',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
