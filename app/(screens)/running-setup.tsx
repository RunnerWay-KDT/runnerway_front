import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Battery, Flame, Trophy, Moon, Shield } from "lucide-react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PrimaryButton } from "../../components/PrimaryButton";
import { OptionCard } from "../../components/OptionCard";
import { Switch } from "../../components/ui/Switch";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

interface Condition {
  id: string;
  title: string;
  description: string;
  Icon: React.ElementType;
}

export default function RunningSetupScreen() {
  const router = useRouter();
  const [condition, setCondition] = useState("recovery");
  const [safetyMode, setSafetyMode] = useState(true);

  const conditions: Condition[] = [
    {
      id: "recovery",
      title: "회복 러닝",
      description: "가볍게 몸을 풀어주는 편안한 페이스",
      Icon: Battery,
    },
    {
      id: "fat-burn",
      title: "지방 연소",
      description: "적절한 심박수로 지방 연소 극대화",
      Icon: Flame,
    },
    {
      id: "challenge",
      title: "기록 도전",
      description: "목표를 향한 강도 높은 러닝",
      Icon: Trophy,
    },
  ];

  // 이전 화면(Location Setup)에서 전달받은 좌표 파라미터
  const params = useLocalSearchParams<{ startLat: string; startLng: string }>();

  const handleGenerate = () => {
    // 좌표가 없으면 진행하지 않음 (간단한 방어 코드)
    if (!params.startLat || !params.startLng) return;

    // 생성 화면으로 이동하며 데이터 전달
    router.push({
      pathname: "/(screens)/generating",
      params: {
        mode: "running",
        condition, // 선택한 컨디션 (recovery, fat-burn, challenge)
        safetyMode: safetyMode.toString(),
        startLat: params.startLat,
        startLng: params.startLng,
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
        <Animated.View entering={FadeInUp.duration(400)}>
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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginBottom: Spacing.md,
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
