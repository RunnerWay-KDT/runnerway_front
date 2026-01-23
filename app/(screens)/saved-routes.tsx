import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  Bookmark,
  MapPin,
  Shield,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
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
  savedAt: string; // ISO8601
  isDeleted?: boolean;
}

// Mock 데이터
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
    savedAt: "2026-01-15T18:45:00Z",
  },
  {
    id: "route_004",
    routeName: "남산 나비 코스",
    distance: 6.2,
    safetyScore: 95,
    location: {
      address: "서울특별시 중구 예장동",
      district: "남산",
    },
    author: {
      id: "user_012",
      name: "산책러버",
    },
    routeData: {
      shapeId: "butterfly",
      shapeName: "나비",
      iconName: "sparkles",
    },
    savedAt: "2026-01-12T08:00:00Z",
  },
];

type SortOrder = "recent" | "distance" | "safety";

export default function SavedRoutesScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<SavedRoute[]>(MOCK_SAVED_ROUTES);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getSafetyColor = (score: number) => {
    if (score >= 90) return Colors.emerald[400];
    if (score >= 80) return Colors.amber[500];
    return Colors.orange[500];
  };

  const getSafetyText = (score: number) => {
    if (score >= 90) return "매우 안전";
    if (score >= 80) return "안전";
    return "주의";
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  const handleSort = () => {
    let newOrder: SortOrder;
    if (sortOrder === "recent") {
      newOrder = "distance";
    } else if (sortOrder === "distance") {
      newOrder = "safety";
    } else {
      newOrder = "recent";
    }
    setSortOrder(newOrder);

    const sorted = [...routes].sort((a, b) => {
      if (newOrder === "recent") {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      } else if (newOrder === "distance") {
        return a.distance - b.distance;
      } else {
        return b.safetyScore - a.safetyScore;
      }
    });

    setRoutes(sorted);
  };

  const getSortLabel = () => {
    if (sortOrder === "recent") return "최근 저장순";
    if (sortOrder === "distance") return "거리순";
    return "안전도순";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // TODO: 실제 API 호출
    // const response = await fetch('/api/v1/users/me/saved-routes?page=1&limit=20', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });

    // Mock: 새로고침 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsRefreshing(false);
  };

  const handleUnsave = (routeId: string, routeName: string) => {
    Alert.alert(
      "저장 취소",
      `"${routeName}"을(를) 저장 목록에서 삭제하시겠습니까?`,
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
            // DELETE /api/v1/users/me/saved-routes/${routeId}

            setRoutes((prev) => prev.filter((route) => route.id !== routeId));
          },
        },
      ],
    );
  };

  const handleRoutePress = (route: SavedRoute) => {
    // 경로 미리보기 화면으로 이동 (저장된 경로 정보 전달)
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

  const renderRouteCard = ({
    item,
    index,
  }: {
    item: SavedRoute;
    index: number;
  }) => {
    const RouteIcon = getIconComponent(item.routeData.iconName);
    const safetyColor = getSafetyColor(item.safetyScore);

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={styles.cardWrapper}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleRoutePress(item)}
        >
          {/* 왼쪽: 아이콘 */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${Colors.emerald[500]}20` },
            ]}
          >
            <RouteIcon
              size={32}
              color={Colors.emerald[400]}
              strokeWidth={1.5}
            />
          </View>

          {/* 중앙: 경로 정보 */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.routeName} numberOfLines={1}>
                {item.routeName}
              </Text>
              <TouchableOpacity
                style={styles.unsaveButton}
                onPress={() => handleUnsave(item.id, item.routeName)}
                activeOpacity={0.7}
              >
                <Bookmark
                  size={20}
                  color={Colors.emerald[500]}
                  fill={Colors.emerald[500]}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            {/* 정보 그리드 */}
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <MapPin size={14} color={Colors.zinc[500]} />
                <Text style={styles.infoText}>
                  {item.distance.toFixed(1)}km
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Shield size={14} color={safetyColor} />
                <Text style={[styles.infoText, { color: safetyColor }]}>
                  {getSafetyText(item.safetyScore)} {item.safetyScore}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <User size={14} color={Colors.zinc[500]} />
                <Text style={styles.infoText}>{item.author.name}</Text>
              </View>
            </View>

            {/* 위치 & 저장 날짜 */}
            <View style={styles.bottomRow}>
              <Text style={styles.locationText} numberOfLines={1}>
                📍 {item.location.district}
              </Text>
              <Text style={styles.dateText}>{formatDate(item.savedAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Bookmark size={64} color={Colors.zinc[700]} />
      </View>
      <Text style={styles.emptyTitle}>저장한 경로가 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        마음에 드는 경로를 찾아{"\n"}저장해보세요!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)/community")}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyButtonText}>커뮤니티 둘러보기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.totalStats}>
          <Text style={styles.totalLabel}>저장한 경로</Text>
          <Text style={styles.totalValue}>{routes.length}개</Text>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={handleSort}
          activeOpacity={0.7}
        >
          <ArrowUpDown size={16} color={Colors.zinc[400]} />
          <Text style={styles.sortText}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="저장한 경로"
        subtitle="북마크한 경로를 확인하세요"
        onBack={() => router.back()}
      />

      <FlatList
        data={routes}
        renderItem={renderRouteCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={routes.length > 0 ? renderHeader : null}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          routes.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.emerald[500]}
            colors={[Colors.emerald[500]]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalStats: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  totalLabel: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
  },
  totalValue: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.emerald[400],
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  sortText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    fontWeight: FontWeight.medium,
  },
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  routeName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    flex: 1,
    marginRight: Spacing.sm,
  },
  unsaveButton: {
    padding: 4,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    flex: 1,
    marginRight: Spacing.sm,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.zinc[900],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[300],
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.base,
    color: Colors.zinc[500],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.emerald[500],
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  emptyButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: "#fff",
  },
});
