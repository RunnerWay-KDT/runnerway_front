import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Loader2, Sparkles, Shield, Route } from "lucide-react-native";
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

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1);
  }, [rotation]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            router.replace({
              pathname: "/(screens)/route-preview",
              params: params,
            });
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [params, router, steps.length]);

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
