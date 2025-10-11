import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';
import { haptic } from '../../lib/haptics/haptic-feedback';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  scaleValue?: number;
  enableHaptic?: boolean;
}

/**
 * Animated pressable component with scale animation on press
 */
export function AnimatedPressable({
  children,
  style,
  scaleValue = 0.95,
  enableHaptic = true,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    if (enableHaptic) {
      haptic.light();
    }
    
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start();

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start();

    onPressOut?.(event);
  };

  const handlePress = (event: any) => {
    if (enableHaptic) {
      haptic.selection();
    }
    onPress?.(event);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

