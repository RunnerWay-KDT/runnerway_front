import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Heart,
  Star,
  Coffee,
  Smile,
  Dog,
  Cat,
  Pencil,
  Shapes,
  Check,
} from "lucide-react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { DrawingCanvas } from "../../components/DrawingCanvas";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { routeApi } from "../../utils/api";

interface Shape {
  id: string;
  name: string;
  Icon: React.ElementType;
  iconName: string;
  distance: string;
  colors: [string, string];
}

export default function ShapeSelectScreen() {
  const router = useRouter();
  const [selectedShape, setSelectedShape] = useState("");
  const [activeMainTab, setActiveMainTab] = useState("presets");
  const [activeSubTab, setActiveSubTab] = useState("shapes");
  const [hasCustomDrawing, setHasCustomDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPathData, setSavedPathData] = useState<string>("");

  const shapes: Shape[] = [
    {
      id: "heart",
      name: "하트",
      Icon: Heart,
      iconName: "heart",
      distance: "4.2km",
      colors: [Colors.pink[500], Colors.red[500]],
    },
    {
      id: "star",
      name: "별",
      Icon: Star,
      iconName: "star",
      distance: "5.8km",
      colors: [Colors.amber[500], Colors.amber[600]],
    },
    {
      id: "coffee",
      name: "커피",
      Icon: Coffee,
      iconName: "coffee",
      distance: "3.5km",
      colors: [Colors.amber[600], Colors.orange[600]],
    },
    {
      id: "smile",
      name: "스마일",
      Icon: Smile,
      iconName: "smile",
      distance: "4.0km",
      colors: [Colors.amber[400], Colors.orange[400]],
    },
  ];

  const animals: Shape[] = [
    {
      id: "dog",
      name: "강아지",
      Icon: Dog,
      iconName: "dog",
      distance: "6.2km",
      colors: [Colors.blue[500], Colors.blue[600]],
    },
    {
      id: "cat",
      name: "고양이",
      Icon: Cat,
      iconName: "cat",
      distance: "5.5km",
      colors: [Colors.purple[500], Colors.pink[500]],
    },
  ];

  const allShapes = [...shapes, ...animals];

  const handlePresetSelect = (shapeId: string) => {
    setSelectedShape(shapeId);
  };

  const handleDrawingComplete = async (
    pathData: string,
    points: { x: number; y: number }[],
  ) => {
    // Calculate distance from points
    let totalPixelDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      totalPixelDistance += Math.sqrt(dx * dx + dy * dy);
    }
    const kmPerPixel = 2 / 350; // Rough estimation
    const distanceKm = Math.max(0.5, totalPixelDistance * kmPerPixel);

    // Save path data for later use
    setSavedPathData(pathData);
    setIsSaving(true);

    try {
      // Save to backend
      const response = await routeApi.saveCustomDrawing({
        name: `커스텀 경로 ${new Date().toLocaleString("ko-KR")}`,
        svg_path: pathData,
        location: {
          latitude: 37.5007, // 역삼역 좌표
          longitude: 127.0364,
          address: "서울특별시 강남구 역삼동",
        },
        estimated_distance: distanceKm,
      });

      if (response.success && response.data) {
        console.log("✅ 커스텀 경로 저장 성공:", response.data);
        Alert.alert(
          "저장 완료",
          `경로가 성공적으로 저장되었습니다!\nID: ${response.data.route_id}`,
        );

        // Navigate to drawing setup screen with custom drawing
        router.push({
          pathname: "/(screens)/drawing-setup",
          params: {
            mode: "custom",
            shapeName: "커스텀 경로",
            shapeIconName: "sparkles",
            shapeDistance: `${distanceKm.toFixed(1)}km`,
            customPath: pathData,
            routeId: response.data.route_id,
          },
        });
      }
    } catch (error) {
      console.error("❌ 커스텀 경로 저장 실패:", error);
      Alert.alert(
        "저장 실패",
        "경로 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrawingChange = (hasDrawing: boolean) => {
    setHasCustomDrawing(hasDrawing);
  };

  const handleGenerate = () => {
    if (activeMainTab === "presets" && selectedShape) {
      const selected = allShapes.find((s) => s.id === selectedShape);
      if (selected) {
        router.push({
          pathname: "/(screens)/drawing-setup",
          params: {
            mode: "preset",
            shapeId: selected.id,
            shapeName: selected.name,
            shapeIconName: selected.iconName,
            shapeDistance: selected.distance,
          },
        });
      }
    }
  };

  const canGenerate =
    activeMainTab === "presets" ? !!selectedShape : hasCustomDrawing;

  const ShapeCard = ({ shape }: { shape: Shape }) => {
    const Icon = shape.Icon;
    const isSelected = selectedShape === shape.id;

    return (
      <TouchableOpacity
        onPress={() => handlePresetSelect(shape.id)}
        activeOpacity={0.8}
        style={[styles.shapeCard, isSelected && styles.shapeCardSelected]}
      >
        <LinearGradient
          colors={shape.colors}
          style={styles.shapeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.shapeContent}>
          <Icon size={48} color="#fff" strokeWidth={1.5} />
          <Text style={styles.shapeName}>{shape.name}</Text>
          <Text style={styles.shapeDistance}>예상 {shape.distance}</Text>
        </View>
        {isSelected && (
          <Animated.View
            entering={ZoomIn.duration(200)}
            style={styles.checkBadge}
          >
            <Check size={16} color="#fff" strokeWidth={3} />
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const mainTabs = [
    { id: "draw", label: "직접 그리기", Icon: Pencil },
    { id: "presets", label: "프리셋", Icon: Shapes },
  ];

  const subTabs = [
    { id: "shapes", label: "도형" },
    { id: "animals", label: "동물" },
  ];

  // Custom Tab Button Component
  const TabButton = ({
    tab,
    isActive,
    onPress,
    showIcon = false,
  }: {
    tab: { id: string; label: string; Icon?: React.ElementType };
    isActive: boolean;
    onPress: () => void;
    showIcon?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      activeOpacity={0.7}
    >
      {showIcon && tab.Icon && (
        <tab.Icon
          size={16}
          color={isActive ? Colors.emerald[400] : Colors.zinc[400]}
        />
      )}
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="그림 경로 선택"
        subtitle="직접 그리거나 프리셋을 선택하세요"
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.tabsContainer}>
          {mainTabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeMainTab === tab.id}
              onPress={() => setActiveMainTab(tab.id)}
              showIcon
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeMainTab === "draw" ? (
            <Animated.View
              entering={FadeInUp.duration(400)}
              style={styles.drawingContainer}
            >
              <DrawingCanvas
                onDrawingComplete={handleDrawingComplete}
                onDrawingChange={handleDrawingChange}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.duration(400)}>
              <View style={styles.tabsContainer}>
                {subTabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeSubTab === tab.id}
                    onPress={() => setActiveSubTab(tab.id)}
                  />
                ))}
              </View>

              <View style={styles.shapeGrid}>
                {(activeSubTab === "shapes" ? shapes : animals).map((shape) => (
                  <ShapeCard key={shape.id} shape={shape} />
                ))}
              </View>

              {selectedShape && (
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  style={styles.recommendInfo}
                >
                  <Text style={styles.recommendHint}>💡 추천 정보</Text>
                  <Text style={styles.recommendText}>
                    AI가 현재 위치에서 가장 안전하고 아름다운 경로로 자동
                    생성합니다
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerStatus}>
          {activeMainTab === "presets" && selectedShape && (
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>프리셋 선택됨</Text>
            </View>
          )}
          {activeMainTab === "draw" && hasCustomDrawing && (
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: Colors.emerald[500] },
                ]}
              />
              <Text style={styles.statusText}>
                경로 그리기 완료 - 완료 버튼을 눌러주세요
              </Text>
            </View>
          )}
        </View>
        {activeMainTab === "presets" && (
          <PrimaryButton onPress={handleGenerate} disabled={!canGenerate}>
            경로 생성하기
          </PrimaryButton>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: Colors.zinc[800],
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[400],
  },
  tabTextActive: {
    color: Colors.emerald[400],
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    paddingBottom: 160,
  },
  drawingContainer: {
    flex: 1,
    marginTop: Spacing.lg,
  },
  drawingPlaceholder: {
    aspectRatio: 1,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 2,
    borderColor: Colors.zinc[800],
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  drawingText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[400],
    marginTop: Spacing.md,
  },
  drawingSubtext: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  comingSoonText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[600],
    marginTop: Spacing.md,
  },
  shapeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  shapeCard: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    position: "relative",
  },
  shapeCardSelected: {
    borderWidth: 3,
    borderColor: Colors.emerald[500],
  },
  shapeGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  shapeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.md,
  },
  shapeName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginTop: Spacing.sm,
  },
  shapeDistance: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    marginTop: Spacing.xs,
  },
  checkBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.emerald[500],
    justifyContent: "center",
    alignItems: "center",
  },
  recommendInfo: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: `${Colors.emerald[500]}10`,
    borderWidth: 1,
    borderColor: `${Colors.emerald[500]}30`,
    borderRadius: BorderRadius["2xl"],
  },
  recommendHint: {
    fontSize: FontSize.sm,
    color: Colors.emerald[400],
    marginBottom: Spacing.sm,
  },
  recommendText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[300],
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.zinc[950]}F5`,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  footerStatus: {
    marginBottom: Spacing.sm,
    minHeight: 20,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blue[500],
  },
  statusText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
});
