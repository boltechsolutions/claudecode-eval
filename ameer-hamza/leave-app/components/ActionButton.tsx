import { Pressable, StyleSheet, Text } from 'react-native';

type Variant = 'approve' | 'reject' | 'neutral';

type Props = {
  label: string;
  onPress: () => void;
  variant: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const COLORS: Record<Variant, string> = {
  approve: '#16a34a',
  reject: '#dc2626',
  neutral: '#2563eb',
};

export default function ActionButton({
  label,
  onPress,
  variant,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? '#d1d5db' : COLORS[variant] },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  labelDisabled: {
    color: '#6b7280',
  },
});
