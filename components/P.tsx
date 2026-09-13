import { Pressable, PressableProps } from 'react-native';

/**
 * Pressable with tactile press feedback (Emil: interfaces must feel touched).
 * Scale 0.97 is felt but never noticed — drop-in replacement for Pressable.
 */
export function P({ scale = 0.97, style, ...rest }: PressableProps & { scale?: number }) {
  return (
    <Pressable
      {...rest}
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        { transform: [{ scale: state.pressed ? scale : 1 }] },
      ]}
    />
  );
}
