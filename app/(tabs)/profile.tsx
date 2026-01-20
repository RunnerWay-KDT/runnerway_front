import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Settings,
  Trophy,
  MapPin,
  TrendingUp,
  Heart,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
} from "lucide-react-native";
import Animated, { FadeInUp, FadeInLeft } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const stats = [
    {
      label: "총 거리",
      value: user?.stats?.totalDistance || "0",
      unit: "km",
      Icon: MapPin,
    },
    {
      label: "운동 횟수",
      value: user?.stats?.totalWorkouts || "0",
      unit: "회",
      Icon: TrendingUp,
    },
    {
      label: "완성 경로",
      value: user?.stats?.completedRoutes || "0",
      unit: "개",
      Icon: Heart,
    },
  ];

  const menuItems = [
    { Icon: User, label: "프로필 수정" },
    { Icon: Trophy, label: "내 기록" },
    { Icon: Heart, label: "저장한 경로" },
    { Icon: Bell, label: "알림 설정" },
    { Icon: Shield, label: "안전 설정" },
    { Icon: Settings, label: "앱 설정" },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const getUserInitial = () => {
    if (user?.name) {
      return user.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="마이페이지" showBackButton={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={styles.profileSection}
        >
          <LinearGradient
            colors={[Colors.emerald[400], Colors.emerald[600]]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{getUserInitial()}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || "러너"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
          {user?.provider && (
            <Text style={styles.providerText}>
              {user.provider} 계정으로 로그인됨
            </Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.statsContainer}
        >
          {stats.map((stat, i) => {
            const Icon = stat.Icon;
            return (
              <View key={i} style={styles.statItem}>
                <Icon size={20} color={Colors.emerald[400]} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </Animated.View>

        {(user?.stats?.totalDistance || 0) >= 100 && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.badgeContainer}
          >
            <Trophy size={32} color={Colors.amber[400]} />
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeTitle}>러닝 마스터</Text>
              <Text style={styles.badgeSubtitle}>100km 달성 배지</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => {
            const Icon = item.Icon;
            return (
              <Animated.View
                key={i}
                entering={FadeInLeft.delay(300 + i * 50).duration(400)}
              >
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                  <View style={styles.menuItemLeft}>
                    <Icon size={20} color={Colors.zinc[400]} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.zinc[500]} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={Colors.red[400]} />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: Spacing["3xl"],
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize["4xl"],
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  userName: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
  },
  providerText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    marginTop: Spacing.xs,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: `${Colors.amber[500]}20`,
    borderWidth: 1,
    borderColor: `${Colors.amber[500]}30`,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.amber[400],
  },
  badgeSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  menuContainer: {
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuItemText: {
    fontSize: FontSize.base,
    color: Colors.zinc[50],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: FontSize.base,
    color: Colors.red[400],
  },
});
