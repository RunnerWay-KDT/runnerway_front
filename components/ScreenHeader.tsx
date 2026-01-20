import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Colors, FontSize, FontWeight, Spacing } from "../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  showBackButton = true,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.zinc[50]} />
          </TouchableOpacity>
        )}
        <View
          style={[
            styles.titleContainer,
            !showBackButton && styles.titleContainerFull,
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
  },
  titleContainerFull: {
    marginLeft: 0,
  },
  title: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    marginTop: 4,
  },
  rightAction: {
    flexShrink: 0,
  },
});
