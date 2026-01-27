import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Navigation } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationPickerMap from "../../components/LocationPickerMap";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";

export default function LocationSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ workoutType?: string }>();
  const workoutType = params.workoutType || "running";

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleLocationSelected = (location: { lat: number; lng: number }) => {
    console.log("Location selected:", location);
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert("위치 선택", "위치를 선택해주세요");
      return;
    }

    const navigationParams = {
      startLat: selectedLocation.lat.toString(),
      startLng: selectedLocation.lng.toString(),
    };

    if (workoutType === "running") {
      router.push({
        pathname: "/(screens)/running-setup",
        params: navigationParams,
      });
    } else if (workoutType === "walking") {
      router.push({
        pathname: "/(screens)/walking-setup",
        params: navigationParams,
      });
    } else if (workoutType === "shape") {
      router.push({
        pathname: "/(screens)/shape-select",
        params: navigationParams,
      });
    }
  };

  const getTitle = () => {
    switch (workoutType) {
      case "running":
        return "러닝 출발 위치";
      case "walking":
        return "산책 출발 위치";
      case "shape":
        return "도형 그리기 출발 위치";
      default:
        return "출발 위치 설정";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.zinc[50]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <LocationPickerMap onLocationSelected={handleLocationSelected} />
      </View>

      <Animated.View entering={FadeInUp.duration(300)} style={styles.infoPanel}>
        <View style={styles.infoHeader}>
          <MapPin size={20} color={Colors.emerald[400]} />
          <Text style={styles.infoTitle}>출발 위치</Text>
        </View>

        <View style={styles.instructionContainer}>
          <Navigation size={16} color={Colors.zinc[500]} />
          <Text style={styles.instructionText}>
            지도를 드래그하여 정확한 출발 위치를 지정하세요
          </Text>
        </View>

        <PrimaryButton onPress={handleConfirm} style={styles.confirmButton}>
          이 위치에서 시작
        </PrimaryButton>

        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            핀은 고정되어 있고 지도를 움직여 위치를 조정할 수 있습니다
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.zinc[950] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.zinc[900],
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  mapContainer: { flex: 1 },
  infoPanel: {
    backgroundColor: Colors.zinc[900],
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  instructionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  instructionText: { fontSize: FontSize.sm, color: Colors.zinc[400], flex: 1 },
  confirmButton: { marginBottom: Spacing.md },
  hintContainer: {
    backgroundColor: Colors.emerald[500] + "15",
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.emerald[500] + "30",
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.emerald[400],
    textAlign: "center",
    lineHeight: 18,
  },
});
