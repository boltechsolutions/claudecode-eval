import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  color: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function ActionButton({
  label,
  color,
  onPress,
  accessibilityLabel,
  disabled = false,
  fullWidth = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch', paddingVertical: 14 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
