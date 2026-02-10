import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch } from "react-native";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Shield, Moon, Zap, Flame, Trophy } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { OptionCard } from "../../components/OptionCard";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

export default function RunningSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [duration, setDuration] = useState(30);
  const [condition, setCondition] = useState("recovery");
  const [safetyMode, setSafetyMode] = useState(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const conditions = [
    {
      id: "recovery",
      title: "회복 러닝",
      description: "부상 없이 가볍게 뛰고 싶어요",
      Icon: Zap,
    },
    {
      id: "fat_burning",
      title: "지방 연소",
      description: "효과적으로 칼로리를 태우고 싶어요",
      Icon: Flame,
    },
    {
      id: "challenge", // Changed from 'record' to match backend logic
      title: "기록 도전",
      description: "나의 한계를 뛰어넘고 싶어요",
      Icon: Trophy,
    },
  ];

  const handleGenerate = async () => {
    let lat = params.startLat as string;
    let lng = params.startLng as string;

    // 전달받은 위치가 없으면 현재 위치 가져오기
    if (!lat || !lng) {
      try {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("위치 권한이 필요합니다.");
          setIsLoadingLocation(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude.toString();
        lng = location.coords.longitude.toString();
      } catch (error) {
        console.error("Location error:", error);
        alert("현재 위치를 가져올 수 없습니다.");
        setIsLoadingLocation(false);
        return;
      } finally {
        setIsLoadingLocation(false);
      }
    }

    router.push({
      pathname: "/(screens)/generating",
      params: {
        mode: "running",
        duration: duration.toString(),
        condition,
        safetyMode: safetyMode.toString(),
        startLat: lat,
        startLng: lng,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="러닝 설정"
        subtitle="오늘의 컨디션에 맞춰 설정해주세요"
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
              maximumValue={60}
              step={5}
              value={duration}
              onValueChange={setDuration}
              minimumTrackTintColor={Colors.emerald[500]}
              maximumTrackTintColor={Colors.zinc[700]}
              thumbTintColor={Colors.emerald[400]}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>10분</Text>
              <Text style={styles.sliderLabel}>60분</Text>
            </View>
          </View>
        </Animated.View>

        {/* 컨디션 선택 */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>컨디션 선택</Text>
          <View style={styles.conditionList}>
            {conditions.map((c, index) => (
              <OptionCard
                key={c.id}
                title={c.title}
                description={c.description}
                icon={<c.Icon size={24} color={Colors.emerald[400]} />}
                selected={condition === c.id}
                onPress={() => setCondition(c.id)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.safetyCard}
        >
          <View style={styles.safetyContent}>
            <View style={styles.safetyIcon}>
              <Shield size={20} color={Colors.emerald[400]} />
            </View>
            <View style={styles.safetyTextContainer}>
              <Text style={styles.safetyTitle}>안전 우선 모드</Text>
              <Text style={styles.safetyDescription}>
                조명이 밝고 사람이 많은 안전한 경로를 추천합니다
              </Text>
              {safetyMode && (
                <View style={styles.safetyHint}>
                  <Moon size={14} color={Colors.amber[400]} />
                  <Text style={styles.safetyHintText}>
                    야간/혼자 러닝 시 권장
                  </Text>
                </View>
              )}
            </View>
            <Switch value={safetyMode} onValueChange={setSafetyMode} />
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton onPress={handleGenerate} loading={isLoadingLocation}>
          경로 생성하기
        </PrimaryButton>
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
    marginBottom: Spacing.md,
  },
  timeCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    alignItems: "center",
  },
  timeValue: {
    fontSize: 64,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
    lineHeight: 64,
  },
  timeUnit: {
    fontSize: FontSize.xl,
    color: Colors.zinc[400],
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
    paddingHorizontal: Spacing.xs,
  },
  sliderLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  conditionList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  safetyCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
  },
  safetyContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  safetyIcon: {
    padding: Spacing.sm,
    backgroundColor: `${Colors.emerald[500]}20`,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  safetyTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  safetyTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginBottom: Spacing.xs,
  },
  safetyDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    lineHeight: 20,
  },
  safetyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  safetyHintText: {
    fontSize: FontSize.xs,
    color: Colors.amber[400],
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