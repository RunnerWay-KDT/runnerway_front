import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { Trash2, RotateCcw, Check } from "lucide-react-native";
import {
  Colors,
  BorderRadius,
  Spacing,
  FontSize,
  FontWeight,
} from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_SIZE = SCREEN_WIDTH - Spacing.lg * 2;

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  onDrawingComplete?: (pathData: string, points: Point[]) => void;
  onDrawingChange?: (hasDrawing: boolean) => void;
}

export function DrawingCanvas({
  onDrawingComplete,
  onDrawingChange,
}: DrawingCanvasProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [allPoints, setAllPoints] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false); // 그리기 완료 상태

  const pathData = useSharedValue("");

  const updatePathState = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const notifyDrawingChange = useCallback(
    (hasDrawing: boolean) => {
      if (onDrawingChange) {
        onDrawingChange(hasDrawing);
      }
    },
    [onDrawingChange],
  );

  const addPoint = useCallback((x: number, y: number) => {
    setAllPoints((prev) => [...prev, { x, y }]);
  }, []);

  const setStart = useCallback((x: number, y: number) => {
    setStartPoint({ x, y });
    setAllPoints([{ x, y }]);
  }, []);

  const setEnd = useCallback((x: number, y: number) => {
    setEndPoint({ x, y });
  }, []);

  const savePath = useCallback((pathStr: string) => {
    if (pathStr) {
      setPaths((prev) => [...prev, pathStr]);
      setIsDrawingComplete(true); // 그리기 완료 표시
    }
    setCurrentPath("");
  }, []);

  const gesture = Gesture.Pan()
    .onStart((event) => {
      // 이미 그림이 완료되었으면 더 이상 그릴 수 없음
      if (isDrawingComplete) {
        return;
      }

      const x = event.x;
      const y = event.y;
      pathData.value = `M ${x} ${y}`;
      runOnJS(updatePathState)(`M ${x} ${y}`);
      runOnJS(setStart)(x, y);
      runOnJS(notifyDrawingChange)(true);
    })
    .onUpdate((event) => {
      if (isDrawingComplete) {
        return;
      }

      const x = event.x;
      const y = event.y;
      const newPath = `${pathData.value} L ${x} ${y}`;
      pathData.value = newPath;
      runOnJS(updatePathState)(newPath);
      runOnJS(addPoint)(x, y);
    })
    .onEnd((event) => {
      if (isDrawingComplete) {
        return;
      }

      const x = event.x;
      const y = event.y;
      const finalPath = pathData.value;
      runOnJS(setEnd)(x, y);
      runOnJS(savePath)(finalPath);
      pathData.value = "";
    });

  const handleClear = () => {
    setPaths([]);
    setCurrentPath("");
    setAllPoints([]);
    setStartPoint(null);
    setEndPoint(null);
    setIsDrawingComplete(false); // 그리기 완료 상태 초기화
    pathData.value = "";
    notifyDrawingChange(false);
  };

  const handleUndo = () => {
    // 한 번에 그리기만 가능하므로 Undo는 전체 삭제와 동일
    handleClear();
  };

  const handleComplete = () => {
    if (paths.length > 0 && onDrawingComplete) {
      // M, L 명령어만 사용 (폐곡선 제거)
      const fullPath = paths.join(" ");

      console.log("✅ 경로 저장:", {
        path: fullPath,
        pointCount: allPoints.length,
      });

      onDrawingComplete(fullPath, allPoints);
    }
  };

  const hasDrawing = paths.length > 0 || currentPath !== "";

  // Calculate estimated distance based on points
  const calculateDistance = (): string => {
    if (allPoints.length < 2) return "0.0";

    let totalPixelDistance = 0;

    // 포인트 간 거리 계산 (폐곡선 제외)
    for (let i = 1; i < allPoints.length; i++) {
      const dx = allPoints[i].x - allPoints[i - 1].x;
      const dy = allPoints[i].y - allPoints[i - 1].y;
      totalPixelDistance += Math.sqrt(dx * dx + dy * dy);
    }

    // Convert pixels to approximate km (rough estimation)
    // Assuming canvas represents about 2km x 2km area
    const kmPerPixel = 2 / CANVAS_SIZE;
    const distanceKm = totalPixelDistance * kmPerPixel;

    return Math.max(0.5, distanceKm).toFixed(1);
  };

  return (
    <View style={styles.container}>
      {/* Canvas */}
      <GestureDetector gesture={gesture}>
        <View style={styles.canvas}>
          {/* Grid Background */}
          <View style={styles.gridBackground}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={`h-${i}`}
                style={[
                  styles.gridLine,
                  styles.gridLineHorizontal,
                  { top: (i + 1) * (CANVAS_SIZE / 11) },
                ]}
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={`v-${i}`}
                style={[
                  styles.gridLine,
                  styles.gridLineVertical,
                  { left: (i + 1) * (CANVAS_SIZE / 11) },
                ]}
              />
            ))}
          </View>

          <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.svg}>
            {/* Completed paths */}
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path}
                stroke={Colors.emerald[400]}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Current drawing path */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={Colors.emerald[400]}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 4"
              />
            )}

            {/* Start point marker */}
            {startPoint && (
              <>
                <Circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r={12}
                  fill={`${Colors.emerald[500]}40`}
                />
                <Circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r={6}
                  fill={Colors.emerald[400]}
                />
              </>
            )}

            {/* End point marker */}
            {endPoint && paths.length > 0 && (
              <>
                <Circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r={12}
                  fill={`${Colors.red[500]}40`}
                />
                <Circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r={6}
                  fill={Colors.red[400]}
                />
              </>
            )}
          </Svg>

          {/* Instructions overlay when empty */}
          {!hasDrawing && (
            <View style={styles.instructionOverlay}>
              <Text style={styles.instructionText}>
                손가락으로 원하는 경로를 그려주세요
              </Text>
              <Text style={styles.instructionSubtext}>
                ⚠️ 한 번에 그려야 합니다
              </Text>
            </View>
          )}

          {/* Drawing complete overlay */}
          {isDrawingComplete && (
            <View style={styles.completeOverlay}>
              <Text style={styles.completeText}>✓ 그리기 완료</Text>
              <Text style={styles.completeSubtext}>
                완료 버튼을 눌러 저장하세요
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>

      {/* Info Bar */}
      {hasDrawing && (
        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>예상 거리</Text>
            <Text style={styles.infoValue}>{calculateDistance()} km</Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleUndo}
          style={[
            styles.controlButton,
            !hasDrawing && styles.controlButtonDisabled,
          ]}
          disabled={!hasDrawing}
          activeOpacity={0.7}
        >
          <RotateCcw
            size={20}
            color={hasDrawing ? Colors.zinc[300] : Colors.zinc[600]}
          />
          <Text
            style={[
              styles.controlText,
              !hasDrawing && styles.controlTextDisabled,
            ]}
          >
            되돌리기
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleComplete}
          style={[
            styles.controlButton,
            styles.controlButtonPrimary,
            paths.length === 0 && styles.controlButtonDisabled,
          ]}
          disabled={paths.length === 0}
          activeOpacity={0.7}
        >
          <Check
            size={20}
            color={paths.length > 0 ? "#fff" : Colors.zinc[600]}
          />
          <Text
            style={[
              styles.controlText,
              styles.controlTextPrimary,
              paths.length === 0 && styles.controlTextDisabled,
            ]}
          >
            완료
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hint */}
      <Text style={styles.hint}>💡 시작과 끝이 일치하지 않아도 돼요!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 2,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
    position: "relative",
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: Colors.zinc[800],
  },
  gridLineHorizontal: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineVertical: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  instructionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  instructionText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[400],
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  instructionSubtext: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    textAlign: "center",
    lineHeight: 20,
  },
  completeOverlay: {
    position: "absolute",
    top: Spacing.md,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: `${Colors.blue[500]}20`,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.blue[500],
  },
  completeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.blue[400],
  },
  completeSubtext: {
    fontSize: FontSize.xs,
    color: Colors.blue[300],
    marginTop: 2,
  },
  infoBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  infoValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginTop: Spacing.lg,
    width: "100%",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.lg,
  },
  controlButtonPrimary: {
    backgroundColor: Colors.emerald[500],
  },
  controlButtonDisabled: {
    backgroundColor: Colors.zinc[900],
    opacity: 0.5,
  },
  controlText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[300],
  },
  controlTextDanger: {
    color: Colors.red[400],
  },
  controlTextPrimary: {
    color: "#fff",
  },
  controlTextDisabled: {
    color: Colors.zinc[600],
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
