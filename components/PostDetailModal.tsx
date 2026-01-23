import { LinearGradient } from "expo-linear-gradient";
import {
  Clock,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  TrendingUp,
  User as UserIcon,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../constants/theme";
import { getIconComponent } from "../utils/shapeIcons";
import { MapMock } from "./MapMock";

const { height } = Dimensions.get("window");

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  route: {
    name: string;
    shapeId: string;
    shapeName: string;
    iconName: string;
    distance: number;
    duration: number;
    pace: string;
    calories: number;
  };
  location: string;
  caption?: string;
  likes: number;
  comments: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

interface PostDetailModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
}

// Mock 댓글 데이터
const MOCK_COMMENTS: Comment[] = [
  {
    id: "comment_001",
    author: {
      id: "user_123",
      name: "러너왕",
    },
    content: "와 정말 멋진 경로네요! 저도 따라 달려보고 싶어요 🏃‍♂️",
    createdAt: "2026-01-22T10:30:00Z",
    likes: 12,
    isLiked: false,
  },
  {
    id: "comment_002",
    author: {
      id: "user_456",
      name: "달리기조아",
    },
    content: "여기 야경이 정말 이쁘던데 저녁에 가보세요!",
    createdAt: "2026-01-22T09:15:00Z",
    likes: 8,
    isLiked: true,
  },
  {
    id: "comment_003",
    author: {
      id: "user_789",
      name: "마라톤러버",
    },
    content: "페이스가 좋으시네요~ 부럽습니다",
    createdAt: "2026-01-22T08:45:00Z",
    likes: 5,
    isLiked: false,
  },
  {
    id: "comment_004",
    author: {
      id: "user_234",
      name: "건강달리기",
    },
    content: "저도 이 경로 자주 뛰는데 항상 좋아요 👍",
    createdAt: "2026-01-22T07:20:00Z",
    likes: 3,
    isLiked: false,
  },
  {
    id: "comment_005",
    author: {
      id: "user_567",
      name: "조깅러버",
    },
    content: "초보자도 따라하기 괜찮을까요?",
    createdAt: "2026-01-22T06:10:00Z",
    likes: 2,
    isLiked: false,
  },
  {
    id: "comment_006",
    author: {
      id: "user_890",
      name: "런데이",
    },
    content: "이 근처 카페 추천해요! 러닝 후 커피 한잔 ☕",
    createdAt: "2026-01-21T22:45:00Z",
    likes: 15,
    isLiked: false,
  },
  {
    id: "comment_007",
    author: {
      id: "user_345",
      name: "산책좋아",
    },
    content: "경치가 정말 좋은 구간이네요. 주말에 가봐야겠어요!",
    createdAt: "2026-01-21T20:30:00Z",
    likes: 6,
    isLiked: false,
  },
  {
    id: "comment_008",
    author: {
      id: "user_678",
      name: "러닝메이트",
    },
    content: "같이 뛸 분 계신가요? 평일 저녁 7시쯤 어때요?",
    createdAt: "2026-01-21T18:15:00Z",
    likes: 4,
    isLiked: false,
  },
];

export function PostDetailModal({
  visible,
  onClose,
  post,
  onLike,
  onBookmark,
}: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때마다 댓글 초기화
  useEffect(() => {
    if (visible) {
      setComments(MOCK_COMMENTS);
      setNewComment("");
    }
  }, [visible]);

  if (!post) return null;

  const RouteIcon = getIconComponent(post.route.iconName);

  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return isoString; // 잘못된 형식이면 원본 반환
      }
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
      return isoString;
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // TODO: API 호출
    // POST /api/v1/community/posts/{postId}/comments

    // Mock: 댓글 추가
    const mockComment: Comment = {
      id: `comment_${Date.now()}`,
      author: {
        id: "current_user",
        name: "나",
      },
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => [mockComment, ...prev]);
    setNewComment("");
    setIsSubmitting(false);
  };

  const handleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    );

    // TODO: API 호출
    // POST /api/v1/community/comments/{commentId}/like
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
        keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 80}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.keyboardView}>
          <View style={styles.modalContainer}>
            {/* 헤더 */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.authorAvatar}>
                  <UserIcon size={20} color={Colors.zinc[400]} />
                </View>
                <View>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <Text style={styles.postDate}>
                    {formatDate(post.createdAt)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X size={24} color={Colors.zinc[400]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1, minHeight: 400 }}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* 지도 영역 */}
              <View style={styles.mapSection}>
                <View style={styles.mapContainer}>
                  <MapMock routePath={post.route.shapeId} />
                </View>
                <LinearGradient
                  colors={["transparent", Colors.zinc[950]]}
                  style={styles.mapGradient}
                />
              </View>

              {/* 경로 정보 */}
              <View style={styles.routeInfo}>
                <View style={styles.routeHeader}>
                  <View
                    style={[
                      styles.routeIconContainer,
                      { backgroundColor: `${Colors.emerald[500]}20` },
                    ]}
                  >
                    <RouteIcon
                      size={24}
                      color={Colors.emerald[400]}
                      strokeWidth={1.5}
                    />
                  </View>
                  <View style={styles.routeText}>
                    <Text style={styles.routeName}>{post.route.name}</Text>
                    <View style={styles.locationRow}>
                      <MapPin size={12} color={Colors.zinc[500]} />
                      <Text style={styles.locationText}>{post.location}</Text>
                    </View>
                  </View>
                </View>

                {/* 통계 */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <MapPin size={16} color={Colors.emerald[400]} />
                    <Text style={styles.statValue}>
                      {post.route.distance.toFixed(1)}
                    </Text>
                    <Text style={styles.statLabel}>km</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Clock size={16} color={Colors.blue[400]} />
                    <Text style={styles.statValue}>{post.route.duration}</Text>
                    <Text style={styles.statLabel}>분</Text>
                  </View>
                  <View style={styles.statItem}>
                    <TrendingUp size={16} color={Colors.purple[400]} />
                    <Text style={styles.statValue}>{post.route.pace}</Text>
                    <Text style={styles.statLabel}>/km</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Flame size={16} color={Colors.orange[400]} />
                    <Text style={styles.statValue}>{post.route.calories}</Text>
                    <Text style={styles.statLabel}>kcal</Text>
                  </View>
                </View>
              </View>

              {/* 캡션 */}
              {post.caption && (
                <View style={styles.captionSection}>
                  <Text style={styles.caption}>{post.caption}</Text>
                </View>
              )}

              {/* 좋아요/북마크 */}
              <View style={styles.actionsBar}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onLike(post.id)}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={24}
                    color={post.isLiked ? Colors.red[500] : Colors.zinc[400]}
                    fill={post.isLiked ? Colors.red[500] : "transparent"}
                  />
                  <Text
                    style={[
                      styles.actionCount,
                      post.isLiked && { color: Colors.red[500] },
                    ]}
                  >
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <View style={styles.actionButton}>
                  <MessageCircle size={24} color={Colors.zinc[400]} />
                  <Text style={styles.actionCount}>{comments.length}</Text>
                </View>
              </View>

              {/* 댓글 섹션 */}
              <View style={styles.commentsSection}>
                <View style={styles.commentsSectionHeader}>
                  <MessageCircle size={18} color={Colors.zinc[400]} />
                  <Text style={styles.commentsTitle}>
                    댓글 {comments.length}
                  </Text>
                </View>

                {comments.length === 0 ? (
                  <View style={styles.emptyComments}>
                    <MessageCircle size={48} color={Colors.zinc[700]} />
                    <Text style={styles.emptyText}>첫 댓글을 남겨보세요!</Text>
                  </View>
                ) : (
                  <View style={styles.commentsList}>
                    {comments.map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <View style={styles.commentHeader}>
                          <UserIcon size={16} color={Colors.zinc[500]} />
                          <Text style={styles.commentAuthor}>
                            {comment.author.name}
                          </Text>
                          <Text style={styles.commentTime}>
                            · {formatDate(comment.createdAt)}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>
                          {comment.content}
                        </Text>
                        {comment.likes > 0 && (
                          <TouchableOpacity
                            style={styles.commentLike}
                            onPress={() => handleCommentLike(comment.id)}
                            activeOpacity={0.7}
                          >
                            <Heart
                              size={12}
                              color={
                                comment.isLiked
                                  ? Colors.red[500]
                                  : Colors.zinc[600]
                              }
                              fill={
                                comment.isLiked
                                  ? Colors.red[500]
                                  : "transparent"
                              }
                            />
                            <Text
                              style={[
                                styles.commentLikeCount,
                                comment.isLiked && { color: Colors.red[500] },
                              ]}
                            >
                              {comment.likes}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* 댓글 입력 */}
            <View style={styles.commentInput}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="댓글을 입력하세요..."
                placeholderTextColor={Colors.zinc[600]}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newComment.trim() || isSubmitting) &&
                    styles.sendButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                activeOpacity={0.7}
              >
                <Send
                  size={18}
                  color={
                    newComment.trim() && !isSubmitting
                      ? Colors.zinc[950]
                      : Colors.zinc[500]
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardView: {
    width: "100%",
    maxHeight: height * 0.9,
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.zinc[950],
    borderRadius: BorderRadius["2xl"],
    width: "90%",
    height: height * 0.7,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.zinc[800],
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  postDate: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.zinc[900],
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mapSection: {
    position: "relative",
  },
  mapContainer: {
    height: 250,
    backgroundColor: Colors.zinc[900],
    overflow: "hidden",
  },
  mapGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  routeInfo: {
    padding: Spacing.lg,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  routeText: {
    flex: 1,
  },
  routeName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  captionSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  caption: {
    fontSize: FontSize.base,
    color: Colors.zinc[300],
    lineHeight: 22,
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.zinc[800],
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionCount: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    fontWeight: FontWeight.medium,
  },
  commentsSection: {
    padding: Spacing.lg,
    minHeight: 250,
    paddingBottom: Spacing.md,
  },
  commentsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  commentsTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[300],
  },
  commentsList: {
    gap: Spacing.sm,
  },
  emptyComments: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.zinc[500],
    marginTop: Spacing.md,
  },
  commentItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  commentAuthor: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[300],
  },
  commentTime: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  commentText: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  commentLikeCount: {
    fontSize: FontSize.xs,
    color: Colors.zinc[600],
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
    backgroundColor: Colors.zinc[950],
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.zinc[100],
    maxHeight: 80,
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.zinc[700],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emerald[500],
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.zinc[800],
    opacity: 0.6,
  },
});
