import { Animated, Easing } from 'react-native';

/**
 * Animation utilities for smooth transitions and interactions
 */

export const animations = {
  /**
   * Fade in animation
   */
  fadeIn: (
    animatedValue: Animated.Value,
    duration: number = 300,
    toValue: number = 1
  ) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  /**
   * Fade out animation
   */
  fadeOut: (
    animatedValue: Animated.Value,
    duration: number = 300,
    toValue: number = 0
  ) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    });
  },

  /**
   * Scale animation (for press effects)
   */
  scale: (
    animatedValue: Animated.Value,
    toValue: number = 0.95,
    duration: number = 100
  ) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
  },

  /**
   * Spring animation (bouncy effect)
   */
  spring: (
    animatedValue: Animated.Value,
    toValue: number,
    tension: number = 40,
    friction: number = 7
  ) => {
    return Animated.spring(animatedValue, {
      toValue,
      tension,
      friction,
      useNativeDriver: true,
    });
  },

  /**
   * Slide in from bottom animation
   */
  slideInFromBottom: (
    animatedValue: Animated.Value,
    duration: number = 300
  ) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  /**
   * Slide in from right animation
   */
  slideInFromRight: (
    animatedValue: Animated.Value,
    duration: number = 300
  ) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },

  /**
   * Sequence of animations
   */
  sequence: (animations: Animated.CompositeAnimation[]) => {
    return Animated.sequence(animations);
  },

  /**
   * Parallel animations
   */
  parallel: (animations: Animated.CompositeAnimation[]) => {
    return Animated.parallel(animations);
  },

  /**
   * Staggered animations (for list items)
   */
  stagger: (delay: number, animations: Animated.CompositeAnimation[]) => {
    return Animated.stagger(delay, animations);
  },
};

/**
 * Create initial animated values
 */
export const createAnimatedValues = () => {
  return {
    opacity: new Animated.Value(0),
    scale: new Animated.Value(1),
    translateY: new Animated.Value(50),
    translateX: new Animated.Value(100),
  };
};

/**
 * Preset animation configs
 */
export const animationPresets = {
  fadeIn: {
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
  slideIn: {
    duration: 350,
    easing: Easing.out(Easing.cubic),
  },
  press: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
  },
  spring: {
    tension: 40,
    friction: 7,
  },
};

