import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Gauge, MapPin, Plus, Sparkles, X } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { WaypointRecommendModal } from "../../components/WaypointRecommendModal";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

interface Waypoint {
  id: number;
  name: string;
  distance: string;
  time: string;
}

interface IntensityOption {
  id: string;
  label: string;
  description: string;
}

export default function WalkingSetupScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState("moderate");
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [showWaypointModal, setShowWaypointModal] = useState(false);

  const intensityOptions: IntensityOption[] = [
    { id: "light", label: "가볍게", description: "여유로운 산책" },
    { id: "moderate", label: "보통", description: "적당한 속도" },
    { id: "brisk", label: "빠르게", description: "활기찬 워킹" },
  ];

  const handleGenerate = () => {
    setShowWaypointModal(true);
  };

  const handleFinalGenerate = (confirmedWaypoints: Waypoint[]) => {
    router.push({
      pathname: "/(screens)/generating",
      params: {
        mode: "walking",
        duration: duration.toString(),
        intensity,
        waypoints: JSON.stringify(confirmedWaypoints),
      },
    });
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="산책 설정"
        subtitle="편안한 산책을 계획해보세요"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 목표 시간 */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={Colors.emerald[400]} />
            <Text style={styles.sectionTitle}>목표 시간</Text>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeValue}>{duration}</Text>
            <Text style={styles.timeUnit}>분</Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={120}
              step={5}
              value={duration}
              onValueChange={setDuration}
              minimumTrackTintColor={Colors.emerald[500]}
              maximumTrackTintColor={Colors.zinc[700]}
              thumbTintColor={Colors.emerald[400]}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>10분</Text>
              <Text style={styles.sliderLabel}>120분</Text>
            </View>
          </View>
        </Animated.View>

        {/* 강도 선택 */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Gauge size={20} color={Colors.emerald[400]} />
            <Text style={styles.sectionTitle}>강도 선택</Text>
          </View>
          <View style={styles.intensityGrid}>
            {intensityOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setIntensity(option.id)}
                style={[
                  styles.intensityCard,
                  intensity === option.id && styles.intensityCardSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.intensityLabel,
                    intensity === option.id && styles.intensityLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.intensityDescription}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* 경유지 추가 */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={Colors.emerald[400]} />
              <Text style={styles.sectionTitle}>경유지 추가</Text>
            </View>
            <Text style={styles.optionalText}>선택사항</Text>
          </View>

          {waypoints.length > 0 && (
            <View style={styles.waypointList}>
              {waypoints.map((point, i) => (
                <View key={point.id} style={styles.waypointItem}>
                  <View style={styles.waypointIndex}>
                    <Text style={styles.waypointIndexText}>{i + 1}</Text>
                  </View>
                  <View style={styles.waypointInfo}>
                    <Text style={styles.waypointName}>{point.name}</Text>
                    <Text style={styles.waypointMeta}>
                      {point.distance} • {point.time}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeWaypoint(i)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={18} color={Colors.zinc[500]} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addWaypointButton}
            onPress={() => setShowWaypointModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color={Colors.zinc[400]} />
            <Text style={styles.addWaypointText}>경유지 추천받기</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* AI 추천 안내 */}
        {waypoints.length === 0 && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.aiHint}
          >
            <Sparkles size={20} color={Colors.purple[400]} />
            <View style={styles.aiHintText}>
              <Text style={styles.aiHintTitle}>AI 경유지 추천</Text>
              <Text style={styles.aiHintDescription}>
                경로 생성 시 주변 카페, 공원 등 추천 경유지를 확인할 수 있습니다
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton onPress={handleGenerate}>경로 생성하기</PrimaryButton>
      </View>

      <WaypointRecommendModal
        isOpen={showWaypointModal}
        onClose={() => setShowWaypointModal(false)}
        onConfirm={handleFinalGenerate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  optionalText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  timeCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    alignItems: "center",
  },
  timeValue: {
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  timeUnit: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  sliderLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  intensityGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  intensityCard: {
    flex: 1,
    padding: Spacing.md,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.zinc[800],
    alignItems: "center",
  },
  intensityCardSelected: {
    backgroundColor: `${Colors.emerald[500]}20`,
    borderColor: Colors.emerald[500],
  },
  intensityLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginBottom: Spacing.xs,
  },
  intensityLabelSelected: {
    color: Colors.emerald[400],
  },
  intensityDescription: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  waypointList: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  waypointItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  waypointIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${Colors.emerald[500]}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  waypointIndexText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  waypointInfo: {
    flex: 1,
  },
  waypointName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  waypointMeta: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    marginTop: 2,
  },
  addWaypointButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.zinc[700],
    borderStyle: "dashed",
  },
  addWaypointText: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
  },
  aiHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.purple[500]}30`,
    backgroundColor: `${Colors.purple[500]}10`,
  },
  aiHintText: {
    flex: 1,
  },
  aiHintTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.purple[400],
    marginBottom: Spacing.xs,
  },
  aiHintDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
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
});
