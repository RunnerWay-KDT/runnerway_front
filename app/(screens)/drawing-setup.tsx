import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Route } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

export default function DrawingSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [duration, setDuration] = useState(30);

  // 시속 4km 기준으로 예상 거리 계산
  const WALKING_SPEED_KM_PER_HOUR = 5;
  const estimatedDistance = (
    (duration / 60) *
    WALKING_SPEED_KM_PER_HOUR
  ).toFixed(1);

  const handleGenerate = () => {
    // 프리셋 모드인 경우
    if (params.mode === "preset") {
      router.push({
        pathname: "/(screens)/generating",
        params: {
          mode: "shape",
          shapeId: params.shapeId,
          shapeName: params.shapeName,
          shapeIconName: params.shapeIconName,
          shapeDistance: params.shapeDistance,
          targetDuration: duration.toString(),
          targetDistanceKm: estimatedDistance,
          startLat: params.startLat as string | undefined,
          startLng: params.startLng as string | undefined,
        },
      });
    }
    // 직접 그리기 모드인 경우
    else if (params.mode === "custom") {
      router.push({
        pathname: "/(screens)/generating",
        params: {
          mode: "custom",
          shapeName: params.shapeName,
          shapeIconName: params.shapeIconName,
          shapeDistance: params.shapeDistance,
          customPath: params.customPath,
          svgPath: params.customPath, // route-preview에서 사용할 svgPath
          routeId: params.routeId,
          targetDuration: duration.toString(),
          targetDistanceKm: estimatedDistance,
          startLat: params.startLat as string | undefined,
          startLng: params.startLng as string | undefined,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="목표 설정"
        subtitle="원하는 운동 시간을 설정하세요"
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

        {/* 예상 거리 정보 */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Route size={20} color={Colors.emerald[400]} />
            <Text style={styles.sectionTitle}>예상 거리</Text>
          </View>
          <View style={styles.distanceCard}>
            <View style={styles.distanceInfo}>
              <Text style={styles.distanceValue}>{estimatedDistance}</Text>
              <Text style={styles.distanceUnit}>km</Text>
            </View>
            <Text style={styles.distanceDescription}>
              시속 4km 기준으로 계산된 예상 거리입니다
            </Text>
          </View>
        </Animated.View>

        {/* 안내 메시지 */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.infoCard}
        >
          <Text style={styles.infoTitle}>💡 참고 사항</Text>
          <Text style={styles.infoText}>
            • 실제 소요 시간은 개인의 걸음 속도에 따라 다를 수 있어요{"\n"}•
            신호등, 경사도 등 환경에 따라 시간이 달라질 수 있어요{"\n"}• 편안한
            페이스로 걷는 것을 권장해요
          </Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton onPress={handleGenerate}>경로 생성하기</PrimaryButton>
      </View>
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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  timeCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  timeValue: {
    fontSize: 64,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
    textAlign: "center",
  },
  timeUnit: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[400],
    textAlign: "center",
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  sliderLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  distanceCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    alignItems: "center",
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.md,
  },
  distanceValue: {
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  distanceUnit: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[400],
    marginLeft: Spacing.xs,
  },
  distanceDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  infoTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.zinc[950],
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
    padding: Spacing.lg,
  },
});
