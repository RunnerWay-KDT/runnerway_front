import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  Bookmark,
  MapPin,
  Shield,
  Trash2,
  User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ScreenHeader";
import { SvgPathIcon } from "../../components/SvgPathIcon";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { getIconComponent } from "../../utils/shapeIcons";
import { savedRouteApi } from "../../utils/api";
import type { SavedRouteSummary } from "../../types/api";

// 화면에 표시할 저장 경로 인터페이스
interface SavedRouteItem {
  id: string; // saved_route id
  routeId: string; // 원본 route id
  routeOptionId: string | null; // 저장된 route option id
  routeName: string;
  distance: number;
  safetyScore: number;
  svgPath: string | null; // 커스텀 경로 SVG path
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
}

/** 백엔드 SavedRouteSummary → 프론트 SavedRouteItem 변환 */
function toSavedRouteItem(r: SavedRouteSummary): SavedRouteItem {
  return {
    id: r.id,
    routeId: r.route_id,
    routeOptionId: r.route_option_id,
    routeName: r.route_name,
    distance: r.distance ?? 0,
    safetyScore: r.safety_score ?? 0,
    svgPath: r.svg_path ?? null,
    author: r.author ?? { id: "", name: "알 수 없음" },
    routeData: r.shape
      ? {
          shapeId: r.shape.shape_id,
          shapeName: r.shape.shape_name,
          iconName: r.shape.icon_name,
        }
      : { shapeId: "custom", shapeName: "커스텀", iconName: "heart" },
    savedAt: r.saved_at,
  };
}

type SortOrder = "recent" | "distance" | "safety";

export default function SavedRoutesScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<SavedRouteItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  /** 저장한 경로 목록 로드 */
  const loadRoutes = useCallback(
    async (sort: SortOrder = sortOrder) => {
      try {
        const sortMap: Record<SortOrder, string> = {
          recent: "date_desc",
          distance: "distance_desc",
          safety: "safety_desc",
        };
        const response = await savedRouteApi.getSavedRoutes({
          page: 1,
          limit: 50,
          sort: sortMap[sort],
        });

        if (response.success && response.data) {
          const items = response.data.routes.map(toSavedRouteItem);
          setRoutes(items);
        }
      } catch (error) {
        console.error("저장한 경로 조회 실패:", error);
      }
    },
    [sortOrder],
  );

  // 최초 로드
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadRoutes();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const toggleSortOrder = () => {
    let newOrder: SortOrder;
    if (sortOrder === "recent") {
      newOrder = "distance";
    } else if (sortOrder === "distance") {
      newOrder = "safety";
    } else {
      newOrder = "recent";
    }
    setSortOrder(newOrder);
    loadRoutes(newOrder);
  };

  const getSortLabel = () => {
    if (sortOrder === "recent") return "최근 저장순";
    if (sortOrder === "distance") return "거리순";
    return "안전도순";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRoutes();
    setIsRefreshing(false);
  };

  /** 저장 취소 (삭제) */
  const handleUnsave = (item: SavedRouteItem) => {
    // 스와이프 닫기
    swipeableRefs.current.get(item.id)?.close();

    Alert.alert(
      "저장 취소",
      `"${item.routeName}"을(를) 저장 목록에서 삭제하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await savedRouteApi.unsaveRoute(item.routeId);
              if (response.success) {
                setRoutes((prev) => prev.filter((r) => r.id !== item.id));
              }
            } catch (error) {
              console.error("경로 저장 취소 실패:", error);
              Alert.alert(
                "오류",
                "저장 취소에 실패했습니다. 다시 시도해주세요.",
              );
            }
          },
        },
      ],
    );
  };

  const handleRoutePress = (route: SavedRouteItem) => {
    router.push({
      pathname: "/(screens)/route-preview",
      params: {
        shapeId: route.routeData.shapeId,
        shapeName: route.routeData.shapeName,
        distance: route.distance.toString(),
        fromSaved: "true",
        routeId: route.routeId,
        routeOptionId: route.routeOptionId ?? undefined,
        routeName: route.routeName,
      },
    });
  };

  /** 스와이프 시 오른쪽에 나타나는 삭제 버튼 */
  const renderRightActions = (item: SavedRouteItem) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        activeOpacity={0.7}
        onPress={() => handleUnsave(item)}
      >
        <View style={styles.deleteActionContent}>
          <View style={styles.deleteIconContainer}>
            <Trash2 size={20} color="#f87171" />
          </View>
          <Text style={styles.deleteActionText}>삭제</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRouteCard = ({
    item,
    index,
  }: {
    item: SavedRouteItem;
    index: number;
  }) => {
    const RouteIcon = getIconComponent(item.routeData.iconName);
    const safetyColor = getSafetyColor(item.safetyScore);

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(400)}
        style={styles.cardWrapper}
      >
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current.set(item.id, ref);
            } else {
              swipeableRefs.current.delete(item.id);
            }
          }}
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
          friction={2}
        >
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleRoutePress(item)}
          >
            {/* 왼쪽: 아이콘 (커스텀 경로면 SVG path 보라색, 프리셋이면 기존 아이콘) */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: item.svgPath
                    ? `${Colors.purple[500]}20`
                    : `${Colors.emerald[500]}20`,
                },
              ]}
            >
              {item.svgPath ? (
                <SvgPathIcon
                  svgPath={item.svgPath}
                  size={32}
                  color={Colors.purple[400]}
                />
              ) : (
                <RouteIcon
                  size={32}
                  color={Colors.emerald[400]}
                  strokeWidth={1.5}
                />
              )}
            </View>

            {/* 중앙: 경로 정보 */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.routeName} numberOfLines={1}>
                  {item.routeName}
                </Text>
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

              {/* 저장 날짜 */}
              <View style={styles.dateRow}>
                <Bookmark
                  size={12}
                  color={Colors.zinc[600]}
                  fill={Colors.zinc[600]}
                />
                <Text style={styles.dateText}>{formatDate(item.savedAt)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Swipeable>
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
          onPress={toggleSortOrder}
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.emerald[500]} />
          <Text style={styles.loadingText}>경로를 불러오는 중...</Text>
        </View>
      ) : (
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
      )}
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
    overflow: "hidden",
    borderRadius: BorderRadius["2xl"],
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  deleteAction: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    width: 88,
  },
  deleteActionContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  deleteIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionText: {
    color: "#f87171",
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
