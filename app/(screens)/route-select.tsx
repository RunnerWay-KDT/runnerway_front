import { useRouter } from "expo-router";
import {
  Heart,
  MapPin,
  Plus,
  Shield,
  TrendingUp,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getIconComponent } from "../../utils/shapeIcons";

interface SavedRoute {
  id: string;
  routeName: string;
  distance: number;
  safetyScore: number;
  location: {
    address: string;
    district: string;
  };
  author: {
    id: string;
    name: string;
  };
  routeData: {
    shapeId: string;
    shapeName: string;
    iconName: string;
  };
  savedAt: string;
}

// Mock 저장된 경로 데이터
const MOCK_SAVED_ROUTES: SavedRoute[] = [
  {
    id: "route_001",
    routeName: "한강 하트 경로",
    distance: 4.2,
    safetyScore: 92,
    location: {
      address: "서울특별시 영등포구 여의도동",
      district: "여의도",
    },
    author: {
      id: "user_123",
      name: "러너왕",
    },
    routeData: {
      shapeId: "heart",
      shapeName: "하트",
      iconName: "heart",
    },
    savedAt: "2026-01-20T15:30:00Z",
  },
  {
    id: "route_002",
    routeName: "올림픽공원 별 코스",
    distance: 5.8,
    safetyScore: 88,
    location: {
      address: "서울특별시 송파구 방이동",
      district: "송파구",
    },
    author: {
      id: "user_456",
      name: "달리기조아",
    },
    routeData: {
      shapeId: "star",
      shapeName: "별",
      iconName: "star",
    },
    savedAt: "2026-01-18T10:20:00Z",
  },
  {
    id: "route_003",
    routeName: "홍대 커피 경로",
    distance: 3.5,
    safetyScore: 85,
    location: {
      address: "서울특별시 마포구 서교동",
      district: "홍대",
    },
    author: {
      id: "user_789",
      name: "카페러너",
    },
    routeData: {
      shapeId: "coffee",
      shapeName: "커피",
      iconName: "coffee",
    },
    savedAt: "2026-01-15T14:10:00Z",
  },
];

export default function RouteSelectScreen() {
  const router = useRouter();
  const [savedRoutes] = useState<SavedRoute[]>(MOCK_SAVED_ROUTES);
  const [selectedTab, setSelectedTab] = useState<"saved" | "new">("saved");

  const handleCreateNewRoute = () => {
    // 새 경로 생성 - 도형 선택 화면으로 이동
    router.push("/(screens)/shape-select");
  };

  const handleSelectRoute = (route: SavedRoute) => {
    // 선택한 경로로 운동 시작 준비
    router.push({
      pathname: "/(screens)/route-preview",
      params: {
        shapeId: route.routeData.shapeId,
        shapeName: route.routeData.shapeName,
        distance: route.distance.toString(),
        fromSaved: "true",
        routeId: route.id,
        routeName: route.routeName,
      },
    });
  };

  const renderSavedRoute = ({
    item,
    index,
  }: {
    item: SavedRoute;
    index: number;
  }) => {
    const RouteIcon = getIconComponent(item.routeData.iconName);

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).springify()}
        style={styles.routeCard}
      >
        <TouchableOpacity
          style={styles.routeCardContent}
          onPress={() => handleSelectRoute(item)}
          activeOpacity={0.7}
        >
          {/* 아이콘 영역 */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <RouteIcon width={28} height={28} color={Colors.emerald[400]} />
            </View>
          </View>

          {/* 경로 정보 */}
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{item.routeName}</Text>

            <View style={styles.routeMetaRow}>
              <View style={styles.metaItem}>
                <MapPin size={14} color={Colors.zinc[500]} />
                <Text style={styles.metaText}>{item.location.district}</Text>
              </View>

              <View style={styles.metaItem}>
                <TrendingUp size={14} color={Colors.zinc[500]} />
                <Text style={styles.metaText}>{item.distance}km</Text>
              </View>

              <View style={styles.metaItem}>
                <Shield size={14} color={Colors.emerald[500]} />
                <Text style={styles.safetyText}>{item.safetyScore}점</Text>
              </View>
            </View>

            <View style={styles.authorRow}>
              <User size={12} color={Colors.zinc[600]} />
              <Text style={styles.authorText}>{item.author.name}</Text>
            </View>
          </View>

          {/* 선택 버튼 */}
          <View style={styles.selectButton}>
            <Text style={styles.selectButtonText}>선택</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="경로 선택" showBackButton />

      {/* 탭 선택 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "saved" && styles.tabActive]}
          onPress={() => setSelectedTab("saved")}
          activeOpacity={0.7}
        >
          <Heart
            size={20}
            color={
              selectedTab === "saved" ? Colors.emerald[400] : Colors.zinc[500]
            }
            fill={selectedTab === "saved" ? Colors.emerald[400] : "transparent"}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === "saved" && styles.tabTextActive,
            ]}
          >
            저장된 경로 ({savedRoutes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "new" && styles.tabActive]}
          onPress={() => setSelectedTab("new")}
          activeOpacity={0.7}
        >
          <Plus
            size={20}
            color={
              selectedTab === "new" ? Colors.emerald[400] : Colors.zinc[500]
            }
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === "new" && styles.tabTextActive,
            ]}
          >
            새 경로 생성
          </Text>
        </TouchableOpacity>
      </View>

      {/* 컨텐츠 */}
      {selectedTab === "saved" ? (
        <View style={styles.content}>
          {savedRoutes.length === 0 ? (
            <Animated.View
              entering={FadeInDown.springify()}
              style={styles.emptyState}
            >
              <Heart size={64} color={Colors.zinc[700]} />
              <Text style={styles.emptyTitle}>저장된 경로가 없습니다</Text>
              <Text style={styles.emptyDescription}>
                커뮤니티에서 마음에 드는 경로를 저장하거나{"\n"}새로운 경로를
                생성해보세요
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateNewRoute}
                activeOpacity={0.8}
              >
                <Plus size={20} color={Colors.zinc[950]} />
                <Text style={styles.createButtonText}>새 경로 만들기</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <FlatList
              data={savedRoutes}
              renderItem={renderSavedRoute}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.newRouteContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.newRouteSection}
          >
            {/* 새 경로 생성 옵션 */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>✨ 나만의 경로 만들기</Text>
              <Text style={styles.infoDescription}>
                원하는 도형을 선택하고{"\n"}AI가 안전한 경로를 생성해드립니다
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateNewRoute}
              activeOpacity={0.8}
            >
              <Plus size={24} color={Colors.zinc[950]} />
              <Text style={styles.primaryButtonText}>도형 선택하러 가기</Text>
            </TouchableOpacity>

            {/* 기능 안내 */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Shield size={20} color={Colors.emerald[400]} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>안전한 경로</Text>
                  <Text style={styles.featureDescription}>
                    AI가 조명, 유동인구를 고려해 안전한 경로를 추천합니다
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Heart size={20} color={Colors.emerald[400]} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>다양한 도형</Text>
                  <Text style={styles.featureDescription}>
                    하트, 별, 커피 등 원하는 모양으로 달릴 수 있습니다
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <MapPin size={20} color={Colors.emerald[400]} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>현재 위치 기반</Text>
                  <Text style={styles.featureDescription}>
                    지금 있는 곳에서 바로 시작할 수 있는 경로를 만듭니다
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.zinc[900],
    borderWidth: 2,
    borderColor: Colors.zinc[800],
  },
  tabActive: {
    backgroundColor: Colors.zinc[800],
    borderColor: Colors.emerald[500],
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[500],
  },
  tabTextActive: {
    color: Colors.emerald[400],
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  routeCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
  },
  routeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.emerald[500] + "30",
  },
  routeInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  routeName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[100],
    marginBottom: 2,
  },
  routeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  safetyText: {
    fontSize: FontSize.xs,
    color: Colors.emerald[500],
    fontWeight: FontWeight.semibold,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[600],
  },
  selectButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.emerald[500],
  },
  selectButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[950],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[200],
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emerald[500],
  },
  createButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[950],
  },
  newRouteContent: {
    padding: Spacing.lg,
  },
  newRouteSection: {
    gap: Spacing.xl,
  },
  infoBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.zinc[900],
    borderWidth: 2,
    borderColor: Colors.emerald[500] + "30",
    alignItems: "center",
  },
  infoTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[100],
    marginBottom: Spacing.sm,
  },
  infoDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.emerald[500],
  },
  primaryButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[950],
  },
  featuresContainer: {
    gap: Spacing.lg,
  },
  featureItem: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.zinc[900],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[200],
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    lineHeight: 18,
  },
});
