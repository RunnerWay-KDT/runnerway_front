import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Info,
  Lock,
  Moon,
  Shield,
  Smartphone,
  Trash2,
  Volume2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

interface SettingItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  type: "toggle" | "link" | "info";
  value?: boolean;
  route?: string;
  color?: string;
  danger?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function AppSettingsScreen() {
  const router = useRouter();

  // 설정 상태
  const [settings, setSettings] = useState({
    darkMode: true,
    pushNotification: true,
    workoutReminder: true,
    goalAchievement: true,
    communityActivity: false,
    soundEffect: true,
    vibration: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // TODO: API 호출
    // PATCH /api/v1/users/me/settings
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "계정 삭제",
      "정말로 계정을 삭제하시겠습니까?\n\n삭제된 계정은 복구할 수 없으며, 모든 운동 기록과 데이터가 영구적으로 삭제됩니다.",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            // TODO: API 호출
            // DELETE /api/v1/users/me
            Alert.alert("알림", "계정 삭제 기능은 준비 중입니다.");
          },
        },
      ],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "캐시 삭제",
      "앱 캐시를 삭제하시겠습니까?\n\n임시 저장된 이미지와 데이터가 삭제됩니다.",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            // TODO: 캐시 삭제 로직
            Alert.alert("완료", "캐시가 삭제되었습니다.");
          },
        },
      ],
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: "알림 설정",
      items: [
        {
          id: "pushNotification",
          icon: Bell,
          label: "푸시 알림",
          description: "앱 알림을 받습니다",
          type: "toggle",
          value: settings.pushNotification,
        },
        {
          id: "workoutReminder",
          icon: Bell,
          label: "운동 시작 알림",
          description: "운동 시간에 알림을 받습니다",
          type: "toggle",
          value: settings.workoutReminder,
        },
        {
          id: "goalAchievement",
          icon: Bell,
          label: "목표 달성 알림",
          description: "목표 달성 시 알림을 받습니다",
          type: "toggle",
          value: settings.goalAchievement,
        },
        {
          id: "communityActivity",
          icon: Bell,
          label: "커뮤니티 알림",
          description: "좋아요, 댓글 등의 알림을 받습니다",
          type: "toggle",
          value: settings.communityActivity,
        },
      ],
    },
    {
      title: "앱 설정",
      items: [
        {
          id: "darkMode",
          icon: Moon,
          label: "다크 모드",
          description: "어두운 테마를 사용합니다",
          type: "toggle",
          value: settings.darkMode,
        },
        {
          id: "soundEffect",
          icon: Volume2,
          label: "효과음",
          description: "앱 효과음을 재생합니다",
          type: "toggle",
          value: settings.soundEffect,
        },
        {
          id: "vibration",
          icon: Smartphone,
          label: "진동",
          description: "알림 시 진동을 사용합니다",
          type: "toggle",
          value: settings.vibration,
        },
      ],
    },
    {
      title: "보안",
      items: [
        {
          id: "safetySettings",
          icon: Shield,
          label: "안전 설정",
          description: "야간 모드, 긴급 연락처",
          type: "link",
          route: "/(screens)/safety-settings",
        },
        {
          id: "privacy",
          icon: Lock,
          label: "개인정보 처리방침",
          type: "link",
        },
      ],
    },
    {
      title: "앱 정보",
      items: [
        {
          id: "version",
          icon: Info,
          label: "앱 버전",
          description: "1.0.0",
          type: "info",
        },
        {
          id: "clearCache",
          icon: Trash2,
          label: "캐시 삭제",
          description: "임시 데이터 삭제",
          type: "link",
          color: Colors.orange[500],
        },
        {
          id: "deleteAccount",
          icon: Trash2,
          label: "계정 삭제",
          description: "모든 데이터가 삭제됩니다",
          type: "link",
          danger: true,
        },
      ],
    },
  ];

  const handleItemPress = (item: SettingItem) => {
    if (item.type === "toggle") {
      handleToggle(item.id as keyof typeof settings);
    } else if (item.type === "link") {
      if (item.id === "deleteAccount") {
        handleDeleteAccount();
      } else if (item.id === "clearCache") {
        handleClearCache();
      } else if (item.route) {
        router.push(item.route as any);
      } else if (item.id === "privacy") {
        Alert.alert("알림", "개인정보 처리방침 페이지로 이동합니다.");
      }
    }
  };

  const renderSettingItem = (item: SettingItem, index: number) => {
    const IconComponent = item.icon;
    const iconColor = item.danger
      ? Colors.red[500]
      : item.color || Colors.zinc[400];
    const labelColor = item.danger ? Colors.red[500] : Colors.zinc[50];

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        activeOpacity={item.type === "info" ? 1 : 0.7}
        onPress={() => handleItemPress(item)}
        disabled={item.type === "info"}
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.danger
                  ? `${Colors.red[500]}20`
                  : `${iconColor}20`,
              },
            ]}
          >
            <IconComponent size={20} color={iconColor} strokeWidth={2} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: labelColor }]}>
              {item.label}
            </Text>
            {item.description && (
              <Text style={styles.settingDescription}>{item.description}</Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === "toggle" && (
            <Switch
              value={item.value || false}
              onValueChange={() =>
                handleToggle(item.id as keyof typeof settings)
              }
            />
          )}
          {item.type === "link" && (
            <ChevronRight size={20} color={Colors.zinc[600]} />
          )}
          {item.type === "info" && (
            <Text style={styles.infoValue}>{item.description}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingSection, sectionIndex: number) => (
    <Animated.View
      key={section.title}
      entering={FadeInUp.delay(sectionIndex * 100).duration(400)}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map((item, index) => renderSettingItem(item, index))}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="앱 설정"
        subtitle="알림 및 앱 환경을 설정하세요"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map((section, index) => renderSection(section, index))}

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
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
});
