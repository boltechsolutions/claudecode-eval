import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LeaveRequest } from '../types/leave';

type Props = {
  request: LeaveRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

const STATUS_LABEL: Record<LeaveRequest['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function LeaveRequestCard({ request, onApprove, onReject }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{request.name}</Text>
      <Text style={styles.dates}>{request.dates}</Text>
      <Text style={[styles.status, statusStyles[request.status]]}>
        {STATUS_LABEL[request.status]}
      </Text>

      {request.status === 'pending' && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.approveButton]}
            onPress={() => onApprove(request.id)}
            accessibilityRole="button"
            accessibilityLabel={`Approve leave for ${request.name}`}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.rejectButton]}
            onPress={() => onReject(request.id)}
            accessibilityRole="button"
            accessibilityLabel={`Reject leave for ${request.name}`}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  dates: {
    fontSize: 14,
    color: '#374151',
    marginTop: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#16a34a',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

const statusStyles = StyleSheet.create({
  pending: { color: '#6b7280' },
  approved: { color: '#16a34a' },
  rejected: { color: '#dc2626' },
});
