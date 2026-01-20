import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors, BorderRadius, FontSize, FontWeight } from "../constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
}

export function PrimaryButton({
  children,
  onPress,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
  loading = false,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "outline":
        return styles.outlineText;
      default:
        return styles.text;
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.button,
        getVariantStyle(),
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.zinc[100] : "#fff"}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{children}</Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primary: {
    backgroundColor: Colors.emerald[500],
  },
  secondary: {
    backgroundColor: Colors.zinc[800],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.zinc[700],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  outlineText: {
    color: Colors.zinc[100],
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
