import { useRouter } from "expo-router";
import {
  AlertTriangle,
  MapPin,
  Moon,
  Phone,
  Shield,
  User,
} from "lucide-react-native";
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
import { ScreenHeader } from "../../components/ScreenHeader";
import { Switch } from "../../components/ui/Switch";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from "../../constants/theme";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export default function SafetySettingsScreen() {
  const router = useRouter();

  // 안전 설정 상태
  const [settings, setSettings] = useState({
    nightSafetyMode: true,
    autoNightMode: true,
    shareLocation: false,
    sosButton: true,
  });

  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([{ id: "1", name: "엄마", phone: "010-1234-5678" }]);

  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // TODO: API 호출
    // PATCH /api/v1/users/me/safety-settings
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert("알림", "이름과 전화번호를 모두 입력해주세요.");
      return;
    }

    // 전화번호 형식 간단 검증
    const phoneRegex = /^[0-9-]{10,15}$/;
    if (!phoneRegex.test(newContactPhone.replace(/-/g, ""))) {
      Alert.alert("알림", "올바른 전화번호 형식을 입력해주세요.");
      return;
    }

    if (emergencyContacts.length >= 3) {
      Alert.alert("알림", "긴급 연락처는 최대 3명까지 등록할 수 있습니다.");
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
    };

    setEmergencyContacts((prev) => [...prev, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    setIsAddingContact(false);

    // TODO: API 호출
    // POST /api/v1/users/me/emergency-contacts
  };

  const handleDeleteContact = (contactId: string) => {
    Alert.alert("연락처 삭제", "이 긴급 연락처를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setEmergencyContacts((prev) =>
            prev.filter((c) => c.id !== contactId),
          );
          // TODO: API 호출
          // DELETE /api/v1/users/me/emergency-contacts/{contactId}
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="안전 설정"
        subtitle="야간 모드와 긴급 연락처를 설정하세요"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 야간 안전 모드 섹션 */}
        <Animated.View
          entering={FadeInUp.delay(0).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>야간 안전 모드</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${Colors.purple[500]}20` },
                  ]}
                >
                  <Moon size={20} color={Colors.purple[400]} strokeWidth={2} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>야간 안전 모드</Text>
                  <Text style={styles.settingDescription}>
                    어두운 시간대에 더 안전한 경로를 추천합니다
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.nightSafetyMode}
                onValueChange={() => handleToggle("nightSafetyMode")}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${Colors.blue[500]}20` },
                  ]}
                >
                  <Moon size={20} color={Colors.blue[400]} strokeWidth={2} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>자동 야간 모드</Text>
                  <Text style={styles.settingDescription}>
                    일몰 후 자동으로 야간 모드를 활성화합니다
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.autoNightMode}
                onValueChange={() => handleToggle("autoNightMode")}
              />
            </View>
          </View>
        </Animated.View>

        {/* 위치 공유 섹션 */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>위치 공유</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${Colors.emerald[500]}20` },
                  ]}
                >
                  <MapPin
                    size={20}
                    color={Colors.emerald[400]}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>실시간 위치 공유</Text>
                  <Text style={styles.settingDescription}>
                    운동 중 긴급 연락처에 위치를 공유합니다
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.shareLocation}
                onValueChange={() => handleToggle("shareLocation")}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${Colors.red[500]}20` },
                  ]}
                >
                  <AlertTriangle
                    size={20}
                    color={Colors.red[400]}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>SOS 버튼</Text>
                  <Text style={styles.settingDescription}>
                    위급 상황 시 빠르게 도움을 요청합니다
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.sosButton}
                onValueChange={() => handleToggle("sosButton")}
              />
            </View>
          </View>
        </Animated.View>

        {/* 긴급 연락처 섹션 */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>긴급 연락처</Text>
            <Text style={styles.contactCount}>
              {emergencyContacts.length}/3
            </Text>
          </View>

          <View style={styles.sectionContent}>
            {emergencyContacts.map((contact, index) => (
              <View key={contact.id} style={styles.contactItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${Colors.emerald[500]}20` },
                    ]}
                  >
                    <User
                      size={20}
                      color={Colors.emerald[400]}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{contact.name}</Text>
                    <Text style={styles.settingDescription}>
                      {contact.phone}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteContact(contact.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* 연락처 추가 폼 */}
            {isAddingContact ? (
              <View style={styles.addContactForm}>
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>이름</Text>
                    <TextInput
                      style={styles.input}
                      value={newContactName}
                      onChangeText={setNewContactName}
                      placeholder="예: 엄마"
                      placeholderTextColor={Colors.zinc[600]}
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 1.5 }]}>
                    <Text style={styles.inputLabel}>전화번호</Text>
                    <TextInput
                      style={styles.input}
                      value={newContactPhone}
                      onChangeText={setNewContactPhone}
                      placeholder="010-0000-0000"
                      placeholderTextColor={Colors.zinc[600]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingContact(false);
                      setNewContactName("");
                      setNewContactPhone("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddContact}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addContactButton}
                onPress={() => setIsAddingContact(true)}
                activeOpacity={0.7}
                disabled={emergencyContacts.length >= 3}
              >
                <Phone size={20} color={Colors.emerald[400]} strokeWidth={2} />
                <Text style={styles.addContactText}>
                  {emergencyContacts.length >= 3
                    ? "최대 3명까지 등록 가능"
                    : "긴급 연락처 추가"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* 안내 메시지 */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.infoCard}
        >
          <Shield size={24} color={Colors.emerald[400]} strokeWidth={2} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>안전한 러닝을 위한 팁</Text>
            <Text style={styles.infoDescription}>
              • 야간 운동 시 밝은 색상의 옷을 착용하세요{"\n"}• 이어폰 볼륨을
              낮추고 주변 소리에 주의하세요{"\n"}• 사람이 많은 경로를 선택하세요
            </Text>
          </View>
        </Animated.View>

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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.zinc[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactCount: {
    fontSize: FontSize.sm,
    color: Colors.zinc[500],
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
  contactItem: {
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
  deleteButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  deleteButtonText: {
    fontSize: FontSize.sm,
    color: Colors.red[500],
    fontWeight: FontWeight.medium,
  },
  addContactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  addContactText: {
    fontSize: FontSize.base,
    color: Colors.emerald[400],
    fontWeight: FontWeight.medium,
  },
  addContactForm: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.zinc[800],
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.zinc[50],
    borderWidth: 1,
    borderColor: Colors.zinc[700],
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.zinc[800],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: FontSize.base,
    color: Colors.zinc[400],
    fontWeight: FontWeight.medium,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.emerald[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: FontSize.base,
    color: "#fff",
    fontWeight: FontWeight.semibold,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: `${Colors.emerald[500]}10`,
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
    borderColor: `${Colors.emerald[500]}30`,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.emerald[400],
    marginBottom: Spacing.sm,
  },
  infoDescription: {
    fontSize: FontSize.sm,
    color: Colors.zinc[400],
    lineHeight: 20,
  },
});
