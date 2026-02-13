import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity } from "react-native";
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
import { PRESET_SVG_PATHS } from "../../constants/config";

const { width } = Dimensions.get("window");

export default function GeneratingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [estimatedRemainingSec, setEstimatedRemainingSec] = useState<number | null>(null);
  const startedRef = useRef(false);
  const cancelledRef = useRef(false);
  const rotation = useSharedValue(0);

  // 로더 회전: 마운트 시 한 번만 시작, 완료될 때까지 계속
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1);
  }, []);

  const steps = [
    { Icon: Route, text: "경로 패턴 분석 중", color: Colors.blue[400] },
    { Icon: Shield, text: "안전 점수 계산 중", color: Colors.emerald[400] },
    { Icon: Sparkles, text: "그림 형태 보정 중", color: Colors.purple[400] },
  ];

  useEffect(() => {
    cancelledRef.current = false;
    const mode = params.mode as string | undefined;

    // running: recommendRoute API
    if (mode === "running") {
      if (startedRef.current) return;
      startedRef.current = true;
      
      const run = async () => {
        const timer = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 1 : prev));
        }, 100);

        const conditionMap: Record<string, string> = {
          flat: "목적: 평지 위주 러닝",
          balanced: "목적: 복합 지형(밸런스) 러닝",
          uphill: "목적: 언덕/업힐 도전 러닝",
        };
        const condition = (params.condition as string) || "flat";
        const safetyMode = (params.safetyMode as string) || "false";
        const basePrompt = conditionMap[condition];
        const safetyPrompt = safetyMode === "true" ? " (안전 우선)" : "";

        try {
          const lat = parseFloat((params.startLat as string) || "37.5005");
          const lng = parseFloat((params.startLng as string) || "127.0365");

          const response = await routeApi.recommendRoute({
            lat,
            lng,
            prompt: `${basePrompt}${safetyPrompt}`,
          });

          if (cancelledRef.current) return;
          if (!response?.candidates) {
            throw new Error("경로 데이터를 받아오지 못했습니다.");
          }

          clearInterval(timer);
          setProgress(100);

          router.replace({
            pathname: "/(screens)/route-preview",
            params: {
              candidates: JSON.stringify(response.candidates),
              mode: "recommend",
            },
          });
        } catch (err) {
          clearInterval(timer);
          if (!cancelledRef.current) {
            Alert.alert(
              "오류",
              "경로 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
            router.back();
          }
        }
      };
      run();
      return () => {
        cancelledRef.current = true;
      }
    }

    // 그림 경로: custom / shape -> 비동기 생성(시작 후 폴링, 타임아웃 방지)
    if (mode === "custom" || mode === "shape") {
      if (startedRef.current) return;
      startedRef.current = true;

      const run = async () => {
        try {
          const targetKm = parseFloat(
            (params.targetDistanceKm as string) ||
            "5"
          );
          const startLat = parseFloat((params.startLat as string) || "37.5");
          const startLng = parseFloat((params.startLng as string) || "127");

          const body: Parameters<typeof routeApi.startGpsArtGeneration>[0] = {
            target_distance_km: targetKm,
            enable_rotation: true,
          };

          if (mode === "custom" && params.routeId) {
            body.route_id = params.routeId as string;
          } else if (mode === "shape" && params.shapeId) {
            const shapeId = params.shapeId as string;
            body.shape_id = params.shapeId as string;
            body.start = { lat: startLat, lng: startLng };
            if (params.svgPath) {
              // Decode URI component (Expo Router encodes params)
              body.svg_path = decodeURIComponent(params.svgPath as string);
            } else if (PRESET_SVG_PATHS[shapeId]) {
              body.svg_path = PRESET_SVG_PATHS[shapeId];
            }
          } else {
            setError("경로 정보가 없습니다.");
            return;
          }

          const startRes = await routeApi.startGpsArtGeneration(body);
          if (cancelledRef.current) return;
          const taskId = startRes?.data?.task_id;
          if (!taskId) {
            setError("작업을 시작하지 못했습니다.");
            return;
          }

          const pollIntervalMs = 2500;
          const poll = async (): Promise<void> => {
            if (cancelledRef.current) return;
            const statusRes = await routeApi.getRouteGenerationStatus(taskId);
            console.log('progress:', statusRes.progress, typeof statusRes.progress);
            if (cancelledRef.current) return;

            // API progress / estimated_remaining / current_step 반영
            if (typeof statusRes.progress === "number") {
              setProgress(statusRes.progress);
            }
            if (typeof statusRes.estimated_remaining === "number") {
              setEstimatedRemainingSec(statusRes.estimated_remaining)
            }
            if (statusRes.current_step != null) {
              const idx = steps.findIndex((s) => s.text.includes(statusRes.current_step ?? ""));
              if (idx > 0) setCurrentStep(idx);
            }

            if (statusRes.status === "completed" && statusRes.route_id) {
              const optionIds = Array.isArray(statusRes.option_ids)
                ? statusRes.option_ids.join(",")
                : "";
              router.replace({
                pathname: "/(screens)/route-preview",
                params: {
                  ...params,
                  routeId: statusRes.route_id,
                  optionIds,
                } as Record<string, string>,
              });
              return;
            }
            if (statusRes.status === "failed") {
              setError(statusRes.error || "경로 생성에 실패했습니다.");
              router.back();
              return;
            }
            setTimeout(poll, pollIntervalMs);
          };
          setTimeout(poll, pollIntervalMs);
        } catch (err) {
          if (!cancelledRef.current) {
            console.log("generateGpsArt error", err);
            setError("경로 생성에 실패했습니다.");
            router.back();
          }
        }
      };
      run();
      return () => {
        cancelledRef.current = true;
      }
    }

    // walking
    if (mode === "walking") {
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
    }
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
              {estimatedRemainingSec 
              ? `완료까지 약 ${estimatedRemainingSec}초` 
              : `완료까지 약 ${Math.ceil((100 - progress) / 20)}초`}
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
