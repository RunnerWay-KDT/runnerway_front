import { useRouter } from "expo-router";
import { Moon, Shield } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Switch } from "../../components/ui/Switch";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { settingsApi } from "../../utils/api";

export default function SafetySettingsScreen() {
  const router = useRouter();

  // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 안전 설정 상태
  const [settings, setSettings] = useState({
    nightSafetyMode: true,
    autoNightMode: true,
  });

  // 초기 설정값
  const [initialSettings, setInitialSettings] = useState(settings);

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSettings();

      if (response.success && response.data) {
        const loadedSettings = {
          nightSafetyMode: response.data.night_safety_mode,
          autoNightMode: response.data.auto_night_mode,
        };
        setSettings(loadedSettings);
        setInitialSettings(loadedSettings);
      }
    } catch (error) {
      console.error("설정 로드 실패:", error);
      Alert.alert("오류", "설정을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 뒤로가기 시 변경사항 저장
  const handleBack = async () => {
    const hasChanges =
      settings.nightSafetyMode !== initialSettings.nightSafetyMode ||
      settings.autoNightMode !== initialSettings.autoNightMode;

    if (!hasChanges) {
      router.back();
      return;
    }

    try {
      setSaving(true);

      const response = await settingsApi.updateSettings({
        night_safety_mode: settings.nightSafetyMode,
        auto_night_mode: settings.autoNightMode,
      });

      if (!response.success) {
        Alert.alert("오류", "설정 저장에 실패했습니다.");
        return;
      }

      router.back();
    } catch (error) {
      console.error("설정 저장 실패:", error);
      Alert.alert("오류", "설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader
          title="안전 설정"
          subtitle="야간 안전 모드를 설정하세요"
          onBack={handleBack}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.purple[500]} />
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="안전 설정"
        subtitle="야간 안전 모드를 설정하세요"
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={Colors.purple[500]} />
            <Text style={styles.savingText}>저장 중...</Text>
          </View>
        )}

        {/* 야간 안전 모드 섹션 */}
        <Animated.View
          entering={FadeInUp.delay(0).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>야간 안전 모드</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${Colors.purple[500]}20` },
                  ]}
                >
                  <Moon size={20} color={Colors.purple[400]} strokeWidth={2} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>야간 안전 모드</Text>
                  <Text style={styles.settingDescription}>
                    어두운 시간대에 더 안전한 경로를 추천합니다
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.nightSafetyMode}
                onValueChange={() => handleToggle("nightSafetyMode")}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${Colors.blue[500]}20` },
                  ]}
                >
                  <Moon size={20} color={Colors.blue[400]} strokeWidth={2} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>자동 야간 모드</Text>
                  <Text style={styles.settingDescription}>
                    일몰 후 자동으로 야간 모드를 활성화합니다
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoNightMode}
                onValueChange={() => handleToggle("autoNightMode")}
              />
            </View>
          </View>
        </Animated.View>

        {/* 안내 메시지 */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.infoCard}
        >
          <Shield size={24} color={Colors.purple[400]} strokeWidth={2} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>안전한 러닝을 위한 팁</Text>
            <Text style={styles.infoDescription}>
              • 야간 운동 시 밝은 색상의 옷을 착용하세요{"\n"}• 이어폰 볼륨을
              낮추고 주변 소리에 주의하세요{"\n"}• 사람이 많은 경로를 선택하세요
            </Text>
          </View>
        </Animated.View>

        {/* 하단 여백 */}
        <View style={{ height: Spacing["3xl"] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.zinc[400],
  },
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  savingText: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[500],
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[50],
  },
  settingDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginTop: 2,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: `${Colors.purple[500]}10`,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: `${Colors.purple[500]}30`,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.purple[400],
    marginBottom: Spacing.sm,
  },
  infoDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    lineHeight: 20,
  },
});
