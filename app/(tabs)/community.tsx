import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Bookmark, Heart, MapPin, MessageCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { KakaoMap } from "../../components/KakaoMap";
import { PostDetailModal } from "../../components/PostDetailModal";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { communityApi } from "../../utils/api";

// ============================================
// 타입 정의 (백엔드 응답과 일치)
// ============================================
interface Author {
  id: string;
  name: string;
  avatar_url?: string | null;
}

interface FeedPost {
  id: string;
  author: Author;
  route_name: string;
  shape_id?: string | null;
  shape_name?: string | null;
  shape_icon?: string | null;
  distance: number;
  duration: number;
  pace?: string | null;
  calories?: number | null;
  location?: string | null;
  caption?: string | null;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  actual_path?: { lat: number; lng: number; timestamp?: string }[] | null;
  start_latitude?: number | null;
  start_longitude?: number | null;
  created_at: string;
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortMode, setSortMode] = useState<"latest" | "popular">("popular");

  // 모달 상태
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ============================================
  // 피드 로드
  // ============================================
  const loadFeed = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);

        const response = await communityApi.getFeed({
          page: 1,
          limit: 20,
          sort: sortMode === "popular" ? "popular" : "latest",
        });

        if (response?.data?.posts) {
          setPosts(response.data.posts);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("피드 로드 실패:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sortMode],
  );

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed(true);
  }, [loadFeed]);

  // ============================================
  // 좋아요 토글
  // ============================================
  const toggleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1,
            }
          : p,
      ),
    );

    if (selectedPost?.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              is_liked: !prev.is_liked,
              like_count: prev.is_liked
                ? prev.like_count - 1
                : prev.like_count + 1,
            }
          : null,
      );
    }

    try {
      if (post.is_liked) {
        await communityApi.unlikePost(postId);
      } else {
        await communityApi.likePost(postId);
      }
    } catch (error) {
      console.error("좋아요 실패:", error);
      // Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_liked: post.is_liked,
                like_count: post.like_count,
              }
            : p,
        ),
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                is_liked: post.is_liked,
                like_count: post.like_count,
              }
            : null,
        );
      }
    }
  };

  // ============================================
  // 북마크 토글
  // ============================================
  const toggleBookmark = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_bookmarked: !p.is_bookmarked,
              bookmark_count: p.is_bookmarked
                ? p.bookmark_count - 1
                : p.bookmark_count + 1,
            }
          : p,
      ),
    );

    if (selectedPost?.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              is_bookmarked: !prev.is_bookmarked,
              bookmark_count: prev.is_bookmarked
                ? prev.bookmark_count - 1
                : prev.bookmark_count + 1,
            }
          : null,
      );
    }

    try {
      if (post.is_bookmarked) {
        await communityApi.unbookmarkPost(postId);
      } else {
        await communityApi.bookmarkPost(postId);
      }
    } catch (error) {
      console.error("북마크 실패:", error);
      // Rollback
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                is_bookmarked: post.is_bookmarked,
                bookmark_count: post.bookmark_count,
              }
            : p,
        ),
      );
      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                is_bookmarked: post.is_bookmarked,
                bookmark_count: post.bookmark_count,
              }
            : null,
        );
      }
    }
  };

  // ============================================
  // 포스트 선택 (모달 열기)
  // ============================================
  const handlePostPress = (post: FeedPost) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    loadFeed(true);
    setSelectedPost(null);
  };

  // ============================================
  // 시간 포맷
  // ============================================
  const formatTimeAgo = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "방금 전";
      if (diffMinutes < 60) return `${diffMinutes}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;

      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    } catch {
      return "";
    }
  };

  // ============================================
  // 카드 컴포넌트
  // ============================================
  const RouteCard = ({ post }: { post: FeedPost }) => (
    <Animated.View entering={FadeInUp.duration(400)}>
      <TouchableOpacity
        onPress={() => handlePostPress(post)}
        activeOpacity={0.9}
      >
        <View style={styles.card}>
          <View style={styles.cardImage}>
            <View style={styles.mapFill} pointerEvents="none">
              <KakaoMap
                routePath={""}
                actualPath={
                  post.actual_path
                    ? post.actual_path.map((p) => ({
                        lat: p.lat,
                        lng: p.lng,
                      }))
                    : []
                }
                center={
                  post.start_latitude && post.start_longitude
                    ? {
                        lat: post.start_latitude,
                        lng: post.start_longitude,
                      }
                    : post.actual_path && post.actual_path.length > 0
                      ? {
                          lat: post.actual_path[0].lat,
                          lng: post.actual_path[0].lng,
                        }
                      : undefined
                }
              />
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {post.distance.toFixed(1)}km
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bookmarkButton}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                toggleBookmark(post.id);
              }}
            >
              <Bookmark
                size={20}
                color={post.is_bookmarked ? Colors.amber[500] : Colors.zinc[50]}
                fill={post.is_bookmarked ? Colors.amber[500] : "transparent"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.author.name?.[0] || "?"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{post.author.name}</Text>
                <Text style={styles.routeName}>
                  {post.route_name || "러닝 코스"}
                </Text>
              </View>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(post.created_at)}
              </Text>
            </View>

            {post.location ? (
              <View style={styles.locationRow}>
                <MapPin size={14} color={Colors.zinc[400]} />
                <Text style={styles.locationText}>{post.location}</Text>
              </View>
            ) : null}

            {post.caption ? (
              <Text style={styles.captionText} numberOfLines={2}>
                {post.caption}
              </Text>
            ) : null}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleLike(post.id);
                }}
                activeOpacity={0.7}
              >
                <Heart
                  size={20}
                  color={post.is_liked ? Colors.red[500] : Colors.zinc[50]}
                  fill={post.is_liked ? Colors.red[500] : "transparent"}
                />
                <Text style={styles.actionText}>{post.like_count}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <MessageCircle size={20} color={Colors.zinc[50]} />
                <Text style={styles.actionText}>{post.comment_count}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // ============================================
  // 피드 리스트 렌더링
  // ============================================
  const renderFeed = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.emerald[500]} />
          <Text style={styles.centerStateText}>피드를 불러오는 중...</Text>
        </View>
      );
    }

    if (posts.length === 0) {
      return (
        <View style={styles.centerState}>
          <MessageCircle size={48} color={Colors.zinc[600]} />
          <Text style={styles.centerStateText}>아직 게시물이 없습니다</Text>
          <Text style={styles.centerStateSubtext}>
            러닝을 완료하고 첫 게시물을 올려보세요!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.emerald[500]}
            colors={[Colors.emerald[500]]}
          />
        }
      >
        {posts.map((post) => (
          <RouteCard key={post.id} post={post} />
        ))}
      </ScrollView>
    );
  };

  // ============================================
  // PostDetailModal에 전달할 Post 변환
  // ============================================
  const toModalPost = (feedPost: FeedPost) => ({
    id: feedPost.id,
    author: {
      id: feedPost.author.id,
      name: feedPost.author.name,
      avatar: feedPost.author.avatar_url || undefined,
    },
    route: {
      name: feedPost.route_name || "러닝 코스",
      shapeId: feedPost.shape_id || "",
      shapeName: feedPost.shape_name || "",
      iconName: feedPost.shape_icon || "heart",
      distance: feedPost.distance,
      duration: feedPost.duration,
      pace: feedPost.pace || "",
      calories: feedPost.calories || 0,
    },
    location: feedPost.location || "",
    caption: feedPost.caption || undefined,
    likes: feedPost.like_count,
    comments: feedPost.comment_count,
    bookmarks: feedPost.bookmark_count,
    isLiked: feedPost.is_liked,
    isBookmarked: feedPost.is_bookmarked,
    createdAt: feedPost.created_at,
    actualPath: feedPost.actual_path
      ? feedPost.actual_path.map((p) => ({ lat: p.lat, lng: p.lng }))
      : undefined,
    startLatitude: feedPost.start_latitude ?? undefined,
    startLongitude: feedPost.start_longitude ?? undefined,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="커뮤니티"
        subtitle="다른 러너들의 경로를 구경해보세요"
        showBackButton={false}
      />

      <Tabs
        defaultValue="popular"
        style={styles.tabs}
        onValueChange={(value: string) =>
          setSortMode(value as "popular" | "latest")
        }
      >
        <TabsList style={styles.tabsList}>
          <TabsTrigger value="popular">인기</TabsTrigger>
          <TabsTrigger value="latest">최신</TabsTrigger>
        </TabsList>

        <TabsContent value="popular">{renderFeed()}</TabsContent>
        <TabsContent value="latest">{renderFeed()}</TabsContent>
      </Tabs>

      {selectedPost && (
        <PostDetailModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          post={toModalPost(selectedPost)}
          onLike={() => toggleLike(selectedPost.id)}
          onBookmark={() => toggleBookmark(selectedPost.id)}
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
  tabs: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  tabsList: {
    marginTop: Spacing.md,
  },
  scrollContent: {
    paddingBottom: Spacing["2xl"],
  },
  card: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
  },
  cardImage: {
    aspectRatio: 1.4,
    backgroundColor: Colors.zinc[800],
    position: "relative",
    overflow: "hidden",
  },
  mapFill: {
    ...StyleSheet.absoluteFillObject,
  },
  distanceBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: `${Colors.zinc[900]}CC`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  distanceText: {
    color: Colors.zinc[50],
    fontSize: FontSize.sm,
  },
  bookmarkButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: `${Colors.zinc[900]}CC`,
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  cardContent: {
    padding: Spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.emerald[500]}30`,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.emerald[400],
    fontWeight: FontWeight.bold,
  },
  userName: {
    color: Colors.zinc[50],
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  routeName: {
    color: Colors.zinc[400],
    fontSize: FontSize.xs,
  },
  timeAgo: {
    color: Colors.zinc[500],
    fontSize: FontSize.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  locationText: {
    color: Colors.zinc[400],
    fontSize: FontSize.sm,
  },
  captionText: {
    color: Colors.zinc[300],
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionText: {
    color: Colors.zinc[50],
    fontSize: FontSize.sm,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    minHeight: 300,
  },
  centerStateText: {
    color: Colors.zinc[400],
    fontSize: FontSize.base,
    marginTop: Spacing.md,
  },
  centerStateSubtext: {
    color: Colors.zinc[500],
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
