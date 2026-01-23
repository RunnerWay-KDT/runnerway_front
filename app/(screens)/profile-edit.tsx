import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera, Check, User, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleImageSelect = () => {
    // TODO: expo-image-picker 설치 후 구현
    Alert.alert(
      "프로필 사진 변경",
      "이미지 선택 기능은 expo-image-picker 설치 후 사용 가능합니다.\n\n설치 명령어:\nnpx expo install expo-image-picker\n\n현재는 이름만 변경 가능합니다.",
      [{ text: "확인" }],
    );

    // Demo: 임시로 색상만 변경
    // setAvatar(avatar ? null : "changed");
    // setHasChanges(true);
  };

  const handleNameChange = (text: string) => {
    setName(text);
    setHasChanges(text !== user?.name || avatar !== user?.avatar);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("입력 오류", "이름을 입력해주세요.");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("입력 오류", "이름은 최소 2자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: 실제 API 호출
      // const response = await fetch('/api/v1/users/me', {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: name.trim(),
      //     avatar: avatar ? avatarBase64 : null,
      //   }),
      // });

      // Mock: 로컬 업데이트
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // AuthContext의 updateProfile 함수 사용
      if (updateProfile) {
        await updateProfile({
          name: name.trim(),
          avatar: avatar,
        });
      }

      Alert.alert("성공", "프로필이 업데이트되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      Alert.alert(
        "오류",
        "프로필 업데이트에 실패했습니다. 다시 시도해주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "재시도", onPress: handleSave },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert("변경사항 취소", "변경사항을 저장하지 않고 나가시겠습니까?", [
        { text: "계속 수정", style: "cancel" },
        { text: "나가기", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const getUserInitial = () => {
    if (name) {
      return name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="프로필 수정"
        subtitle="이름과 프로필 사진을 변경하세요"
        onBack={handleCancel}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 사진 */}
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={styles.avatarSection}
        >
          <TouchableOpacity
            onPress={handleImageSelect}
            style={styles.avatarContainer}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {avatar ? (
              <View style={styles.avatarImageContainer}>
                <Animated.Image
                  source={{ uri: avatar }}
                  style={styles.avatarImage}
                  entering={FadeInUp.duration(300)}
                />
              </View>
            ) : (
              <LinearGradient
                colors={[Colors.emerald[400], Colors.emerald[600]]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>{getUserInitial()}</Text>
              </LinearGradient>
            )}
            <View style={styles.cameraButton}>
              <Camera size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>탭하여 사진 변경</Text>
        </Animated.View>

        {/* 이름 입력 */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.formSection}
        >
          <Text style={styles.label}>이름</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.zinc[500]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="이름을 입력하세요"
              placeholderTextColor={Colors.zinc[500]}
              value={name}
              onChangeText={handleNameChange}
              maxLength={50}
              editable={!isLoading}
              autoCapitalize="words"
            />
            {name.length > 0 && (
              <TouchableOpacity
                onPress={() => handleNameChange("")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isLoading}
              >
                <X size={20} color={Colors.zinc[500]} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.charCount}>
            {name.length}/50 {name.length >= 2 && "✓"}
          </Text>
        </Animated.View>

        {/* 이메일 (읽기 전용) */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.formSection}
        >
          <Text style={styles.label}>이메일</Text>
          <View style={[styles.inputContainer, styles.inputDisabled]}>
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={user?.email || ""}
              editable={false}
            />
          </View>
          <Text style={styles.hint}>이메일은 변경할 수 없습니다</Text>
        </Animated.View>

        {/* 가입 방법 */}
        {user?.provider && user.provider !== "email" && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.providerSection}
          >
            <View style={styles.providerBadge}>
              <Text style={styles.providerText}>
                {user.provider === "kakao" ? "카카오" : user.provider} 계정
              </Text>
            </View>
          </Animated.View>
        )}

        {/* 변경사항 안내 */}
        {hasChanges && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={styles.changesNotice}
          >
            <Check size={16} color={Colors.emerald[400]} />
            <Text style={styles.changesText}>
              저장되지 않은 변경사항이 있습니다
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <View style={styles.saveButtonContainer}>
            <PrimaryButton
              onPress={handleSave}
              disabled={!hasChanges || !name.trim() || name.trim().length < 2}
              loading={isLoading}
            >
              저장하기
            </PrimaryButton>
          </View>
        </View>
      </View>
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
    paddingBottom: 120,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.sm,
  },
  avatarImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Colors.zinc[800],
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.emerald[500],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.zinc[950],
  },
  avatarHint: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[50],
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.zinc[800],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputDisabled: {
    backgroundColor: Colors.zinc[900] + "50",
    borderColor: Colors.zinc[800] + "50",
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.zinc[50],
    paddingVertical: Spacing.sm,
  },
  inputReadOnly: {
    color: Colors.zinc[500],
  },
  charCount: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
    marginTop: Spacing.xs,
  },
  providerSection: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  providerBadge: {
    backgroundColor: Colors.amber[500] + "20",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  providerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.amber[400],
  },
  changesNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.emerald[500] + "20",
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.lg,
  },
  changesText: {
    fontSize: FontSize.sm,
    color: Colors.emerald[400],
    fontWeight: FontWeight.medium,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.zinc[950]}F5`,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.zinc[800],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[300],
  },
  saveButtonContainer: {
    flex: 1,
  },
});
