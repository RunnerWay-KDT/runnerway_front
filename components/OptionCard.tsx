import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Colors,
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from "../constants/theme";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OptionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
}

export function OptionCard({
  title,
  description,
  icon,
  selected = false,
  onPress,
}: OptionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={[
        styles.container,
        selected ? styles.selected : styles.unselected,
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.header}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.description}>{description}</Text>
        </View>
        {selected && (
          <View style={styles.checkContainer}>
            <View style={styles.check}>
              <Check size={16} color="#fff" />
            </View>
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
  },
  selected: {
    backgroundColor: `${Colors.emerald[500]}20`,
    borderColor: Colors.emerald[500],
  },
  unselected: {
    backgroundColor: Colors.zinc[900],
    borderColor: Colors.zinc[800],
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  checkContainer: {
    marginLeft: Spacing.md,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.emerald[500],
    alignItems: "center",
    justifyContent: "center",
  },
});
