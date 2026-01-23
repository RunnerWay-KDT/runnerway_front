import { Bookmark, Heart, MapPin, MessageCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
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

interface Route {
  id: number;
  user: string;
  shape: string;
  location: string;
  distance: string;
  likes: number;
  comments: number;
}

const routes: Route[] = [
  {
    id: 1,
    user: "러너123",
    shape: "heart",
    location: "한강공원",
    distance: "5.2km",
    likes: 142,
    comments: 23,
  },
  {
    id: 2,
    user: "달리기왕",
    shape: "star",
    location: "올림픽공원",
    distance: "6.8km",
    likes: 98,
    comments: 15,
  },
  {
    id: 3,
    user: "조깅러버",
    shape: "dog",
    location: "서울숲",
    distance: "4.5km",
    likes: 76,
    comments: 12,
  },
  {
    id: 4,
    user: "운동매니아",
    shape: "coffee",
    location: "여의도",
    distance: "3.9km",
    likes: 64,
    comments: 8,
  },
];

const shapeEmoji: Record<string, string> = {
  heart: "❤️",
  star: "⭐",
  dog: "🐕",
  coffee: "☕",
};

export default function CommunityScreen() {
  const [likedRoutes, setLikedRoutes] = useState<Set<number>>(new Set());
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState<Set<number>>(
    new Set(),
  );
  const [selectedPost, setSelectedPost] = useState<Route | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleLike = (id: number) => {
    setLikedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleBookmark = (id: number) => {
    setBookmarkedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handlePostPress = (route: Route) => {
    setSelectedPost(route);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const RouteCard = ({ route }: { route: Route }) => {
    const isLiked = likedRoutes.has(route.id);
    const isBookmarked = bookmarkedRoutes.has(route.id);

    return (
      <Animated.View entering={FadeInUp.duration(400)}>
        <TouchableOpacity
          onPress={() => handlePostPress(route)}
          activeOpacity={0.9}
        >
          <View style={styles.card}>
            <View style={styles.cardImage}>
              <Text style={styles.shapeEmoji}>{shapeEmoji[route.shape]}</Text>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{route.distance}</Text>
              </View>
              <TouchableOpacity
                style={styles.bookmarkButton}
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark(route.id);
                }}
              >
                <Bookmark
                  size={20}
                  color={isBookmarked ? Colors.amber[500] : Colors.zinc[50]}
                  fill={isBookmarked ? Colors.amber[500] : "transparent"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{route.user[0]}</Text>
                </View>
                <Text style={styles.userName}>{route.user}</Text>
              </View>

              <View style={styles.locationRow}>
                <MapPin size={16} color={Colors.zinc[400]} />
                <Text style={styles.locationText}>{route.location}</Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleLike(route.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={20}
                    color={isLiked ? Colors.red[500] : Colors.zinc[50]}
                    fill={isLiked ? Colors.red[500] : "transparent"}
                  />
                  <Text style={styles.actionText}>
                    {route.likes + (isLiked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={20} color={Colors.zinc[50]} />
                  <Text style={styles.actionText}>{route.comments}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="커뮤니티"
        subtitle="다른 러너들의 경로를 구경해보세요"
        showBackButton={false}
      />

      <Tabs defaultValue="popular" style={styles.tabs}>
        <TabsList style={styles.tabsList}>
          <TabsTrigger value="popular">인기</TabsTrigger>
          <TabsTrigger value="recent">최신</TabsTrigger>
          <TabsTrigger value="following">팔로잉</TabsTrigger>
        </TabsList>

        <TabsContent value="popular">
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </ScrollView>
        </TabsContent>

        <TabsContent value="recent">
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {[...routes].reverse().map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </ScrollView>
        </TabsContent>

        <TabsContent value="following">
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>팔로우한 사용자가 없습니다</Text>
            <TouchableOpacity>
              <Text style={styles.emptyLink}>추천 러너 보기</Text>
            </TouchableOpacity>
          </View>
        </TabsContent>
      </Tabs>

      {selectedPost && (
        <PostDetailModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          post={{
            id: selectedPost.id.toString(),
            author: {
              id: selectedPost.id.toString(),
              name: selectedPost.user,
              avatar: selectedPost.user[0],
            },
            route: {
              name: `${selectedPost.shape} 러닝 코스`,
              shapeId: selectedPost.shape.toLowerCase(),
              shapeName: selectedPost.shape,
              iconName: selectedPost.shape.toLowerCase(),
              distance: parseFloat(selectedPost.distance),
              duration: 45,
              pace: "5'30\"",
              calories: 350,
            },
            location: selectedPost.location,
            caption: `${selectedPost.shape} 모양으로 달렸습니다! 날씨도 좋고 정말 상쾌한 러닝이었어요 😊`,
            likes:
              selectedPost.likes + (likedRoutes.has(selectedPost.id) ? 1 : 0),
            comments: selectedPost.comments,
            bookmarks: 0,
            isLiked: likedRoutes.has(selectedPost.id),
            isBookmarked: bookmarkedRoutes.has(selectedPost.id),
            createdAt: new Date().toISOString(),
          }}
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
    aspectRatio: 1,
    backgroundColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  shapeEmoji: {
    fontSize: 80,
    opacity: 0.3,
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
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationText: {
    color: Colors.zinc[400],
    fontSize: FontSize.sm,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    color: Colors.zinc[500],
    marginBottom: Spacing.md,
  },
  emptyLink: {
    color: Colors.emerald[500],
  },
});
