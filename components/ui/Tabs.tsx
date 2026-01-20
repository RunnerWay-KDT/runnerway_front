import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  Colors,
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  style?: any;
}

export function Tabs({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  children,
  style,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string) => {
    if (!controlledValue) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <View style={[styles.container, style]}>{children}</View>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  style?: any;
}

export function TabsList({ children, style }: TabsListProps) {
  return <View style={[styles.list, style]}>{children}</View>;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  style?: any;
}

export function TabsTrigger({ value, children, style }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isSelected = context.value === value;

  return (
    <TouchableOpacity
      onPress={() => context.onValueChange(value)}
      style={[
        styles.trigger,
        isSelected ? styles.triggerSelected : styles.triggerUnselected,
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.triggerText,
          isSelected
            ? styles.triggerTextSelected
            : styles.triggerTextUnselected,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  style?: any;
}

export function TabsContent({ value, children, style }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (context.value !== value) {
    return null;
  }

  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  list: {
    flexDirection: "row",
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  trigger: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerSelected: {
    backgroundColor: Colors.zinc[700],
  },
  triggerUnselected: {
    backgroundColor: "transparent",
  },
  triggerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  triggerTextSelected: {
    color: Colors.zinc[50],
  },
  triggerTextUnselected: {
    color: Colors.zinc[400],
  },
  content: {
    flex: 1,
  },
});
