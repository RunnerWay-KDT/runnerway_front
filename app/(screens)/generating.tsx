import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Loader2, Sparkles, Shield, Route } from "lucide-react-native";
import { routeApi } from "../../utils/api";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Colors, FontSize, FontWeight, Spacing } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function GeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const rotation = useSharedValue(0);

  const steps = [
    { Icon: Route, text: "경로 패턴 분석 중", color: Colors.blue[400] },
    { Icon: Shield, text: "안전 점수 계산 중", color: Colors.emerald[400] },
    { Icon: Sparkles, text: "그림 형태 보정 중", color: Colors.purple[400] },
  ];

  // 파라미터 수신
  const searchParams = useLocalSearchParams<{ 
    condition: string; 
    safetyMode: string;
    startLat: string; 
    startLng: string; 
  }>();

  useEffect(() => {
    // 로딩 애니메이션 실행
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1);

    // [핵심 로직] 경로 생성 실행
    const generateRoute = async () => {
        // 1. 진행률 시뮬레이션 (API 응답 대기 시간 동안 보여줄 UI)
        const timer = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 1 : prev));
        }, 100);

        // 2. 백엔드에 보낼 키워드 구성 (Backend logic handles distance ranges now)
        const conditionMap: Record<string, string> = {
          "flat": "목적: 평지 위주 러닝",
          "balanced": "목적: 복합 지형(밸런스) 러닝",
          "uphill": "목적: 언덕/업힐 도전 러닝"
        };
        const basePrompt = conditionMap[searchParams.condition || "flat"];
        const safetyPrompt = searchParams.safetyMode === "true" ? " (안전 우선)" : "";
        
        const handleRecommendation = async () => {
            console.log("📍 Generating Route for:", searchParams.startLat, searchParams.startLng);
            
            try {
                const lat = parseFloat(searchParams.startLat || "37.5005");
                const lng = parseFloat(searchParams.startLng || "127.0365");

                const response = await routeApi.recommendRoute({
                    lat: lat,
                    lng: lng,
                    prompt: `${basePrompt}${safetyPrompt}`
                });

                if (!response || !response.candidates) {
                    throw new Error("경로 데이터를 받아오지 못했습니다.");
                }

                // 90% -> 100%
                setProgress(100);
                
                router.replace({
                    pathname: "/(screens)/route-preview",
                    params: {
                        candidates: JSON.stringify(response.candidates), // 후보 경로 리스트 전달
                        mode: "recommend"
                    }
                });
            } catch (error) {
                console.error("Route generation error:", error);
                Alert.alert("오류", "경로 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                router.back();
            }
        };

        // 3. API 호출 및 완료 처리
        await handleRecommendation();
        clearInterval(timer);
    };

    generateRoute();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const CurrentStepIcon = steps[currentStep].Icon;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.loaderContainer, animatedStyle]}>
          <Loader2 size={80} color={Colors.emerald[500]} />
        </Animated.View>

        <Text style={styles.title}>경로 생성 중</Text>
        <Text style={styles.subtitle}>AI가 최적의 경로를 찾고 있습니다</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{progress}%</Text>
            <Text style={styles.progressText}>
              완료까지 약 {Math.ceil((100 - progress) / 20)}초
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <Animated.View
            key={currentStep}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.stepContent}
          >
            <CurrentStepIcon size={48} color={steps[currentStep].color} />
            <Text style={styles.stepText}>{steps[currentStep].text}</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  loaderContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  progressContainer: {
    width: width - Spacing.lg * 4,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.zinc[800],
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.emerald[500],
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  progressText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  stepContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContent: {
    alignItems: "center",
  },
  stepText: {
    fontSize: FontSize.lg,
    color: Colors.zinc[300],
    marginTop: Spacing.md,
  },
});
