import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import {
  Flame,
  Pause,
  Play,
  Square,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BottomSheet } from "../../components/BottomSheet";
import { LiveKakaoMap } from "../../components/LiveKakaoMap";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { workoutApi } from "../../utils/api";

interface LocationCoords {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState("0'00\"");
  const [sheetState, setSheetState] = useState<
    "collapsed" | "half" | "expanded"
  >("collapsed");
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    heading?: number;
  } | null>(null);
  const [actualRoute, setActualRoute] = useState<
    { lat: number; lng: number }[]
  >([]);
  const [splits, setSplits] = useState<
    { start: number; end: number; pace: string; time: number }[]
  >([]);

  // 서버에서 받은 workout ID (workouts 테이블의 id)
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  // GPS 관련 상태
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const magnetometerSubscription = useRef<{ remove: () => void } | null>(null);
  const lastLocation = useRef<LocationCoords | null>(null);
  const routeCoordinates = useRef<LocationCoords[]>([]);
  const pathUpdateCounter = useRef(0);
  const lastSplitDistance = useRef(0);
  const lastSplitTime = useRef(0);

  const targetDistance = parseFloat((params.targetDistance as string) || "4.2");
  const iconName = (params.shapeIconName as string) || "heart";

  // json 문자열 → 배열 변환
  const routePolylineParam = params.routePolyline as string | undefined;
  const workoutPolyline = (() => {
    if (!routePolylineParam) return [];
    try {
      const parsed = JSON.parse(routePolylineParam); // 문자열  -> 배열
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const mapCenter =
    workoutPolyline.length > 0
      ? {
          lat:
            workoutPolyline.reduce((s, p) => s + p.lat, 0) /
            workoutPolyline.length,
          lng:
            workoutPolyline.reduce((s, p) => s + p.lng, 0) /
            workoutPolyline.length,
        }
      : undefined;

  const progress = Math.min(distance / targetDistance, 1);
  const progressWidth = useSharedValue(0);

  // ============================================
  // 운동 시작 API 호출 → workouts 테이블에 INSERT
  // (서버에서 기존 활성 운동이 있으면 자동으로 취소 처리)
  // ============================================
  useEffect(() => {
    const startWorkoutSession = async () => {
      try {
        // GPS 권한으로 현재 위치 가져오기
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        const startWorkoutData = {
          route_id: (params.routeId as string) || null,
          route_option_id: (params.optionId as string) || null,
          route_name:
            (params.routeName as string) ||
            (params.shapeName as string) ||
            "운동",
          type: (params.routeType as string) || null,
          mode: (params.mode as string) || null,
          start_location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          started_at: new Date().toISOString(),
        };

        console.log("🚀 운동 시작 API 호출 데이터:", startWorkoutData);

        const response = await workoutApi.startWorkout(startWorkoutData);

        console.log("📥 운동 시작 API 응답:", response);

        if (response.success && response.data?.workout_id) {
          setWorkoutId(response.data.workout_id);
          console.log("✅ 운동 시작 (workout_id):", response.data.workout_id);
        } else {
          console.warn(
            "⚠️ 운동 시작 API 응답에 workout_id가 없습니다:",
            response,
          );
        }
      } catch (error) {
        console.error("❌ 운동 시작 API 실패:", error);
        // API 실패해도 로컬 운동은 계속 진행
      }
    };

    startWorkoutSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Haversine 공식으로 두 좌표 간 거리 계산 (미터)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // 지구 반지름 (미터)
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // 미터 단위
    },
    [],
  );

  // 위치 업데이트 처리
  const handleLocationUpdate = useCallback(
    (location: Location.LocationObject) => {
      const newCoords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };

      // 위치만 업데이트 (heading은 Magnetometer로 별도 관리)
      setCurrentLocation((prev) => ({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        heading: prev?.heading, // 기존 heading 유지
      }));

      // 경로에 좌표 추가
      routeCoordinates.current.push(newCoords);

      // 5개의 좌표마다 actualRoute 업데이트 (성능 최적화)
      pathUpdateCounter.current += 1;
      if (pathUpdateCounter.current >= 5) {
        pathUpdateCounter.current = 0;
        setActualRoute(
          routeCoordinates.current.map((coord) => ({
            lat: coord.latitude,
            lng: coord.longitude,
          })),
        );
      }

      // 이전 위치가 있으면 거리 계산
      if (lastLocation.current) {
        const distanceInMeters = calculateDistance(
          lastLocation.current.latitude,
          lastLocation.current.longitude,
          newCoords.latitude,
          newCoords.longitude,
        );

        // 거리가 너무 크면 (50m 이상) GPS 오류로 간주하고 무시
        if (distanceInMeters < 50 && distanceInMeters > 0) {
          setDistance((prev) => {
            const newDistance = prev + distanceInMeters / 1000; // km로 변환

            // 1km 구간 완주 시 구간 기록 저장
            const currentKm = Math.floor(newDistance);
            const lastKm = Math.floor(lastSplitDistance.current);
            if (currentKm > lastKm && currentKm > 0) {
              setTime((currentTime) => {
                const splitTimeDiff = currentTime - lastSplitTime.current;
                const mins = Math.floor(splitTimeDiff / 60);
                const secs = Math.round(splitTimeDiff % 60);

                // 30분 이상이면 -- 표시
                const splitPace =
                  mins >= 30
                    ? "--'--\""
                    : `${mins}'${secs.toString().padStart(2, "0")}"`;

                setSplits((prevSplits) => [
                  ...prevSplits,
                  {
                    start: lastKm,
                    end: currentKm,
                    pace: splitPace,
                    time: currentTime,
                  },
                ]);

                lastSplitDistance.current = newDistance;
                lastSplitTime.current = currentTime;
                return currentTime;
              });
            }

            // 페이스 계산 (시간이 있을 때만)
            setTime((currentTime) => {
              if (newDistance > 0 && currentTime > 0) {
                const currentPace = currentTime / 60 / newDistance; // 분/km
                const mins = Math.floor(currentPace);
                const secs = Math.round((currentPace - mins) * 60);

                // 30분 이상이면 -- 표시
                if (mins >= 30) {
                  setPace("--'--\"");
                } else {
                  setPace(`${mins}'${secs.toString().padStart(2, "0")}"`);
                }
              }
              return currentTime;
            });

            return newDistance;
          });
        }
      }

      lastLocation.current = newCoords;
    },
    [calculateDistance],
  );

  // GPS 권한 요청 및 위치 추적 시작
  useEffect(() => {
    let isMounted = true;

    const setupLocation = async () => {
      try {
        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "위치 권한 필요",
            "운동 기록을 위해 위치 권한이 필요합니다.",
            [{ text: "확인" }],
          );
          return;
        }

        // 현재 위치 가져오기 (초기 지도 중심)
        try {
          const currentPos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          if (isMounted) {
            setCurrentLocation({
              lat: currentPos.coords.latitude,
              lng: currentPos.coords.longitude,
              heading: 0, // 초기값은 0 (북쪽), Magnetometer가 곧 업데이트할 것
            });
          }
        } catch (error) {
          console.log("초기 위치 가져오기 실패:", error);
        }

        // 위치 추적 시작
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000, // 1초마다 업데이트
            distanceInterval: 1, // 1미터 이동 시 업데이트
          },
          (location) => {
            if (!isPaused && isMounted) {
              handleLocationUpdate(location);
            }
          },
        );
      } catch (error) {
        console.error("위치 설정 오류:", error);
        Alert.alert("오류", "위치 추적을 시작할 수 없습니다.");
      }
    };

    setupLocation();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [isPaused, handleLocationUpdate]);

  // 나침반(Magnetometer) 센서로 디바이스 방향 감지
  useEffect(() => {
    let isMounted = true;

    const startCompass = async () => {
      try {
        // Magnetometer 업데이트 간격 설정 (500ms)
        Magnetometer.setUpdateInterval(500);

        // Magnetometer 구독
        magnetometerSubscription.current = Magnetometer.addListener((data) => {
          if (!isMounted) return;

          // 자기장 데이터로 방위각(heading) 계산
          const { x, y } = data;
          let heading = Math.atan2(y, x) * (180 / Math.PI);

          // 0-360도 범위로 정규화
          if (heading < 0) {
            heading += 360;
          }

          // 현재 위치에 heading 업데이트
          setCurrentLocation((prev) => {
            if (prev) {
              return { ...prev, heading };
            }
            return prev;
          });
        });
      } catch (error) {
        console.error("나침반 센서 오류:", error);
      }
    };

    startCompass();

    return () => {
      isMounted = false;
      if (magnetometerSubscription.current) {
        magnetometerSubscription.current.remove();
      }
    };
  }, []);

  // 진행률 애니메이션
  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, { duration: 300 });
  }, [progress, progressWidth]);

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // 타이머 로직 - GPS가 거리를 업데이트하므로 시간만 관리
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStop = () => {
    // routeCoordinates → actual_path (workouts.actual_path에 저장될 데이터)
    const actualPathData = routeCoordinates.current.map((coord) => ({
      lat: coord.latitude,
      lng: coord.longitude,
      timestamp: coord.timestamp,
    }));

    // splits → workout_splits 테이블에 저장될 데이터
    const splitsData = splits.map((split) => ({
      km: split.end,
      pace: split.pace,
      duration: split.time - (splits[splits.indexOf(split) - 1]?.time || 0),
    }));

    const lastCoord =
      routeCoordinates.current[routeCoordinates.current.length - 1];

    router.replace({
      pathname: "/(screens)/result",
      params: {
        ...params,
        workoutId: workoutId || "",
        completedDistance: distance.toFixed(2),
        completedTime: time.toString(),
        averagePace: pace,
        calories: Math.round(distance * 60).toString(),
        actualPath: JSON.stringify(actualPathData),
        splitsData: JSON.stringify(splitsData),
        endLatitude: lastCoord ? lastCoord.latitude.toString() : "",
        endLongitude: lastCoord ? lastCoord.longitude.toString() : "",
        routeCompletion: Math.round(progress * 100).toString(),
      },
    });
  };

  const calories = Math.round(distance * 60);
  const remainingDistance = Math.max(0, targetDistance - distance);

  return (
    <View style={styles.container}>
      {/* Background Map */}
      <LiveKakaoMap
        routePath={iconName}
        progress={progress}
        polyline={workoutPolyline.length > 0 ? workoutPolyline : undefined}
        center={mapCenter}
        currentPosition={currentLocation || undefined}
        actualPath={actualRoute.length > 0 ? actualRoute : undefined}
      />

      {/* Top Controls */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setVoiceGuide(!voiceGuide)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          {voiceGuide ? (
            <Volume2 size={24} color={Colors.emerald[400]} />
          ) : (
            <VolumeX size={24} color={Colors.zinc[500]} />
          )}
        </TouchableOpacity>

        <View style={styles.remainingContainer}>
          <Text style={styles.remainingLabel}>남은 거리</Text>
          <Text style={styles.remainingValue}>
            {remainingDistance.toFixed(2)} km
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleStop}
          style={styles.stopButton}
          activeOpacity={0.7}
        >
          <Square size={24} color={Colors.red[400]} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet onStateChange={setSheetState}>
        {/* Main Stats */}
        <Animated.View entering={FadeInUp.duration(300)}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardEmerald]}>
              <Text style={styles.statLabel}>거리</Text>
              <Text style={styles.statValueLarge}>{distance.toFixed(2)}</Text>
              <Text style={styles.statUnit}>km</Text>
            </View>
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statLabelBlue}>시간</Text>
              <Text style={styles.statValueMedium}>{formatTime(time)}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statLabelPurple}>페이스</Text>
              <Text style={styles.statValueMedium}>{pace}</Text>
              <Text style={styles.statUnit}>/km</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>진행률</Text>
              <Text style={styles.progressValue}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[styles.progressFill, progressAnimatedStyle]}
              />
            </View>
          </View>

          {/* Pause/Resume Button */}
          <TouchableOpacity
            onPress={() => setIsPaused(!isPaused)}
            style={[
              styles.controlButton,
              isPaused ? styles.controlButtonResume : styles.controlButtonPause,
            ]}
            activeOpacity={0.8}
          >
            {isPaused ? (
              <>
                <Play size={24} color="#fff" />
                <Text style={styles.controlButtonText}>재개하기</Text>
              </>
            ) : (
              <>
                <Pause size={24} color="#fff" />
                <Text style={styles.controlButtonText}>일시정지</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Half State - Additional Stats */}
        {(sheetState === "half" || sheetState === "expanded") && (
          <Animated.View entering={FadeInUp.delay(100).duration(300)}>
            <View style={styles.divider} />
            <View style={styles.calorieCard}>
              <View style={styles.calorieHeader}>
                <Flame size={20} color={Colors.orange[400]} />
                <Text style={styles.calorieLabel}>칼로리</Text>
              </View>
              <Text style={styles.calorieValue}>{calories}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            {/* 구간 기록 - half 상태에서도 보이도록 수정 */}
            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <TrendingUp size={16} color={Colors.blue[400]} />
              <Text style={styles.sectionTitle}>구간 기록</Text>
            </View>

            <View style={styles.splitList}>
              {splits.length === 0 ? (
                <View style={styles.splitItem}>
                  <Text style={styles.splitLabel}>
                    1km 이상 달리면 구간이 표시됩니다
                  </Text>
                </View>
              ) : (
                <>
                  {splits.map((split, index) => (
                    <View key={index} style={styles.splitItem}>
                      <Text style={styles.splitLabel}>
                        {split.start}-{split.end} km
                      </Text>
                      <Text style={styles.splitValue}>{split.pace}</Text>
                    </View>
                  ))}
                </>
              )}
              <View style={styles.splitItemCurrent}>
                <Text style={styles.splitLabelCurrent}>현재 구간</Text>
                <Text style={styles.splitValueCurrent}>{pace}</Text>
              </View>
            </View>

            {isPaused && (
              <View style={styles.pausedInfo}>
                <Text style={styles.pausedTitle}>⏸️ 일시정지 중</Text>
                <Text style={styles.pausedText}>
                  준비되면 재개 버튼을 눌러주세요
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleStop}
              style={styles.stopWorkoutButton}
              activeOpacity={0.7}
            >
              <Text style={styles.stopWorkoutText}>운동 종료하기</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  remainingContainer: {
    alignItems: "center",
  },
  remainingLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  remainingValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${Colors.red[500]}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  statCardEmerald: {
    backgroundColor: `${Colors.emerald[500]}20`,
    borderColor: `${Colors.emerald[500]}30`,
  },
  statCardBlue: {
    backgroundColor: `${Colors.blue[500]}20`,
    borderColor: `${Colors.blue[500]}30`,
  },
  statCardPurple: {
    backgroundColor: `${Colors.purple[500]}20`,
    borderColor: `${Colors.purple[500]}30`,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.emerald[400],
    marginBottom: Spacing.xs,
  },
  statLabelBlue: {
    fontSize: FontSize.xs,
    color: Colors.blue[400],
    marginBottom: Spacing.xs,
  },
  statLabelPurple: {
    fontSize: FontSize.xs,
    color: Colors.purple[400],
    marginBottom: Spacing.xs,
  },
  statValueLarge: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    fontVariant: ["tabular-nums"],
  },
  statValueMedium: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    fontVariant: ["tabular-nums"],
  },
  statUnit: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  progressValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
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
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  controlButtonPause: {
    backgroundColor: Colors.amber[500],
  },
  controlButtonResume: {
    backgroundColor: Colors.emerald[500],
  },
  controlButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.zinc[800],
    marginVertical: Spacing.md,
  },
  calorieCard: {
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  calorieHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  calorieLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  calorieValue: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  calorieUnit: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  splitList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  splitItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  splitItemCurrent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${Colors.emerald[500]}10`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: `${Colors.emerald[500]}30`,
    padding: Spacing.md,
  },
  splitLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  splitLabelCurrent: {
    fontSize: FontSize.sm,
    color: Colors.emerald[400],
  },
  splitValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  splitValueCurrent: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  pausedInfo: {
    backgroundColor: `${Colors.amber[500]}10`,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.amber[500]}30`,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  pausedTitle: {
    fontSize: FontSize.sm,
    color: Colors.amber[400],
    marginBottom: Spacing.xs,
  },
  pausedText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[400],
  },
  stopWorkoutButton: {
    backgroundColor: `${Colors.red[500]}20`,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  stopWorkoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.red[400],
  },
});
