import { StyleSheet, Text } from 'react-native';

type LeaveSummaryProps = {
  pending: number;
  approved: number;
  rejected: number;
};

export function LeaveSummary({ pending, approved, rejected }: LeaveSummaryProps) {
  return (
    <Text style={styles.summary}>
      Pending: {pending} · Approved: {approved} · Rejected: {rejected}
    </Text>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: 14,
    color: '#444444',
    marginBottom: 12,
  },
});
