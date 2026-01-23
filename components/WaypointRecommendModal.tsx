import {
  Camera,
  Check,
  Clock,
  Coffee,
  MapPin,
  Navigation,
  Star,
  Store,
  Trees,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../constants/theme";

interface Place {
  id: number;
  name: string;
  distance: string;
  rating: number;
  time: string;
  reviews: number;
}

interface Category {
  id: string;
  name: string;
  Icon: React.ElementType;
  color: string;
  bgColor: string;
  places: Place[];
}

interface WaypointRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (waypoints: Place[]) => void;
}

const waypointCategories: Category[] = [
  {
    id: "cafe",
    name: "카페",
    Icon: Coffee,
    color: Colors.amber[400],
    bgColor: `${Colors.amber[500]}20`,
    places: [
      {
        id: 1,
        name: "스타벅스 강남점",
        distance: "0.3km",
        rating: 4.5,
        time: "4분",
        reviews: 234,
      },
      {
        id: 2,
        name: "투썸플레이스",
        distance: "0.5km",
        rating: 4.3,
        time: "7분",
        reviews: 156,
      },
      {
        id: 3,
        name: "블루보틀 서울",
        distance: "0.8km",
        rating: 4.7,
        time: "10분",
        reviews: 412,
      },
    ],
  },
  {
    id: "convenience",
    name: "편의점",
    Icon: Store,
    color: Colors.blue[400],
    bgColor: `${Colors.blue[500]}20`,
    places: [
      {
        id: 4,
        name: "GS25 역삼점",
        distance: "0.2km",
        rating: 4.2,
        time: "3분",
        reviews: 89,
      },
      {
        id: 5,
        name: "CU 강남대로점",
        distance: "0.4km",
        rating: 4.4,
        time: "5분",
        reviews: 142,
      },
      {
        id: 6,
        name: "세븐일레븐 테헤란점",
        distance: "0.6km",
        rating: 4.3,
        time: "8분",
        reviews: 201,
      },
    ],
  },
  {
    id: "park",
    name: "공원",
    Icon: Trees,
    color: Colors.emerald[400],
    bgColor: `${Colors.emerald[500]}20`,
    places: [
      {
        id: 7,
        name: "선릉공원",
        distance: "0.4km",
        rating: 4.6,
        time: "5분",
        reviews: 523,
      },
      {
        id: 8,
        name: "대모산 입구",
        distance: "1.2km",
        rating: 4.8,
        time: "15분",
        reviews: 892,
      },
      {
        id: 9,
        name: "양재천 산책로",
        distance: "1.5km",
        rating: 4.7,
        time: "18분",
        reviews: 671,
      },
    ],
  },
  {
    id: "landmark",
    name: "명소",
    Icon: Camera,
    color: Colors.purple[400],
    bgColor: `${Colors.purple[500]}20`,
    places: [
      {
        id: 10,
        name: "코엑스 별마당 도서관",
        distance: "0.9km",
        rating: 4.9,
        time: "12분",
        reviews: 1234,
      },
      {
        id: 11,
        name: "봉은사",
        distance: "1.1km",
        rating: 4.7,
        time: "14분",
        reviews: 856,
      },
      {
        id: 12,
        name: "강남역 지하상가",
        distance: "0.7km",
        rating: 4.4,
        time: "9분",
        reviews: 432,
      },
    ],
  },
];

export function WaypointRecommendModal({
  isOpen,
  onClose,
  onConfirm,
}: WaypointRecommendModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("cafe");
  const [selectedWaypoints, setSelectedWaypoints] = useState<Place[]>([]);

  const currentCategory = waypointCategories.find(
    (cat) => cat.id === selectedCategory,
  );
  const CategoryIcon = currentCategory?.Icon || Coffee;

  const toggleWaypoint = (place: Place) => {
    setSelectedWaypoints((prev) => {
      const isSelected = prev.some((p) => p.id === place.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== place.id);
      } else {
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, place];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedWaypoints);
    setSelectedWaypoints([]);
    onClose();
  };

  const handleSkip = () => {
    onConfirm([]);
    setSelectedWaypoints([]);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View entering={ZoomIn.duration(200)} style={styles.modal}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>경유지 추천</Text>
              <Text style={styles.subtitle}>산책 중 들를 곳을 선택하세요</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.zinc[400]} />
            </TouchableOpacity>
          </View>

          {/* 카테고리 탭 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {waypointCategories.map((category) => {
              const Icon = category.Icon;
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: isActive
                        ? category.bgColor
                        : Colors.zinc[800],
                    },
                  ]}
                >
                  <Icon
                    size={16}
                    color={isActive ? category.color : Colors.zinc[400]}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isActive ? category.color : Colors.zinc[400] },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 장소 리스트 */}
          <ScrollView
            style={styles.placeList}
            showsVerticalScrollIndicator={false}
          >
            {currentCategory?.places.map((place) => {
              const isSelected = selectedWaypoints.some(
                (p) => p.id === place.id,
              );
              return (
                <TouchableOpacity
                  key={place.id}
                  onPress={() => toggleWaypoint(place)}
                  style={[
                    styles.placeCard,
                    isSelected && styles.placeCardSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <Animated.View
                      entering={ZoomIn.duration(200)}
                      style={styles.checkMark}
                    >
                      <Check size={14} color="#fff" />
                    </Animated.View>
                  )}

                  <View style={styles.placeContent}>
                    <View style={styles.placeHeader}>
                      <CategoryIcon size={18} color={currentCategory?.color} />
                      <Text style={styles.placeName}>{place.name}</Text>
                    </View>

                    <View style={styles.placeInfo}>
                      <View style={styles.infoItem}>
                        <Navigation size={12} color={Colors.zinc[500]} />
                        <Text style={styles.infoText}>{place.distance}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Clock size={12} color={Colors.zinc[500]} />
                        <Text style={styles.infoText}>{place.time}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Star
                          size={12}
                          color={Colors.amber[400]}
                          fill={Colors.amber[400]}
                        />
                        <Text style={styles.infoText}>{place.rating}</Text>
                      </View>
                    </View>

                    <Text style={styles.reviewsText}>
                      리뷰 {place.reviews}개
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 선택 정보 및 버튼 */}
          <View style={styles.footer}>
            {selectedWaypoints.length > 0 && (
              <View style={styles.selectionInfo}>
                <View style={styles.selectionHeader}>
                  <MapPin size={16} color={Colors.emerald[400]} />
                  <Text style={styles.selectionTitle}>
                    선택된 경유지 ({selectedWaypoints.length}/3)
                  </Text>
                </View>
                {selectedWaypoints.map((waypoint, index) => (
                  <View key={waypoint.id} style={styles.selectedItem}>
                    <Text style={styles.selectedIndex}>{index + 1}.</Text>
                    <Text style={styles.selectedName}>{waypoint.name}</Text>
                    <Text style={styles.selectedDistance}>
                      ({waypoint.distance})
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>건너뛰기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  selectedWaypoints.length === 0 &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={selectedWaypoints.length === 0}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    selectedWaypoints.length === 0 &&
                      styles.confirmButtonTextDisabled,
                  ]}
                >
                  {selectedWaypoints.length > 0
                    ? `${selectedWaypoints.length}개 선택 완료`
                    : "경유지 선택"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helpText}>최대 3개까지 선택할 수 있습니다</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.md,
  },
  modal: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },
  title: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  closeButton: {
    padding: Spacing.sm,
  },
  categoryContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  placeList: {
    maxHeight: 400,
    padding: Spacing.md,
  },
  placeCard: {
    padding: Spacing.md,
    backgroundColor: `${Colors.zinc[800]}50`,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.zinc[800],
    marginBottom: Spacing.sm,
  },
  placeCardSelected: {
    backgroundColor: `${Colors.emerald[500]}10`,
    borderColor: `${Colors.emerald[500]}50`,
  },
  checkMark: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.emerald[500],
    justifyContent: "center",
    alignItems: "center",
  },
  placeContent: {
    paddingRight: Spacing.xl,
  },
  placeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  placeName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },
  placeInfo: {
    flexDirection: "row",
    alignItems: "center",
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
  reviewsText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
  },
  selectionInfo: {
    backgroundColor: `${Colors.emerald[500]}10`,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: `${Colors.emerald[500]}30`,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  selectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.emerald[400],
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  selectedIndex: {
    color: Colors.emerald[400],
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },
  selectedName: {
    color: Colors.zinc[300],
    fontSize: FontSize.sm,
  },
  selectedDistance: {
    color: Colors.zinc[500],
    fontSize: FontSize.sm,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.emerald[500],
    borderRadius: BorderRadius.xl,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.zinc[800],
  },
  confirmButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: "#fff",
  },
  confirmButtonTextDisabled: {
    color: Colors.zinc[600],
  },
  helpText: {
    fontSize: FontSize.xs,
    color: Colors.zinc[500],
    textAlign: "center",
  },
});
