import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { StyleSheet } from "react-native";
import GorhomBottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Colors, BorderRadius, Spacing } from "../constants/theme";

export type SheetState = "collapsed" | "half" | "expanded";

interface BottomSheetProps {
  children: ReactNode | ((state: SheetState) => ReactNode);
  onStateChange?: (state: SheetState) => void;
  initialState?: SheetState;
}

export function BottomSheet({
  children,
  onStateChange,
  initialState = "half",
}: BottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);

  // Define snap points (in percentage or absolute values)
  const snapPoints = useMemo(() => [200, 400, "90%"], []);

  // Map snap point indices to state names
  const getStateFromIndex = (index: number): SheetState => {
    switch (index) {
      case 0:
        return "collapsed";
      case 1:
        return "half";
      case 2:
        return "expanded";
      default:
        return "half";
    }
  };

  const getIndexFromState = (state: SheetState): number => {
    switch (state) {
      case "collapsed":
        return 0;
      case "half":
        return 1;
      case "expanded":
        return 2;
      default:
        return 1;
    }
  };

  const [currentState, setCurrentState] =
    React.useState<SheetState>(initialState);

  useEffect(() => {
    // Set initial position
    const initialIndex = getIndexFromState(initialState);
    bottomSheetRef.current?.snapToIndex(initialIndex);
  }, [initialState]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      const newState = getStateFromIndex(index);
      setCurrentState(newState);
      if (onStateChange) {
        onStateChange(newState);
      }
    },
    [onStateChange],
  );

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      index={getIndexFromState(initialState)}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.background}
      handleStyle={styles.handleContainer}
    >
      <BottomSheetScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {typeof children === "function" ? children(currentState) : children}
      </BottomSheetScrollView>
    </GorhomBottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: `${Colors.zinc[900]}F2`,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
  },
  handleContainer: {
    backgroundColor: "transparent",
    paddingVertical: 12,
  },
  handleIndicator: {
    backgroundColor: Colors.zinc[700],
    width: 48,
    height: 6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
