import React from "react";
import { Switch as RNSwitch, Platform } from "react-native";
import { Colors } from "../../constants/theme";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  value,
  onValueChange,
  disabled = false,
}: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: Colors.zinc[600],
        true: Colors.emerald[500],
      }}
      thumbColor={
        Platform.OS === "android"
          ? value
            ? Colors.emerald[100]
            : Colors.zinc[100]
          : undefined
      }
      ios_backgroundColor={Colors.zinc[600]}
    />
  );
}
