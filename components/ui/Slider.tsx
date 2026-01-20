import React from "react";
import { View, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { Colors } from "../../constants/theme";

interface SliderComponentProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function SliderComponent({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}: SliderComponentProps) {
  return (
    <View style={styles.container}>
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        disabled={disabled}
        minimumTrackTintColor={Colors.emerald[500]}
        maximumTrackTintColor={Colors.zinc[700]}
        thumbTintColor={Colors.emerald[500]}
        style={styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
