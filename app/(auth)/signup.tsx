import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.name,
      );
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setErrors({ email: "회원가입에 실패했습니다" });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "회원가입에 실패했습니다";
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "6자 이상", met: formData.password.length >= 6 },
    {
      label: "비밀번호 일치",
      met:
        formData.password !== "" &&
        formData.password === formData.confirmPassword,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="회원가입" subtitle="러너웨이와 함께 시작하세요" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* 이름 입력 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>이름</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.name && styles.inputError,
                ]}
              >
                <User
                  size={20}
                  color={Colors.zinc[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="이름을 입력하세요"
                  placeholderTextColor={Colors.zinc[500]}
                  value={formData.name}
                  onChangeText={(value) => handleChange("name", value)}
                  editable={!isLoading}
                />
              </View>
              {errors.name && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.errorRow}
                >
                  <AlertCircle size={12} color={Colors.red[400]} />
                  <Text style={styles.errorText}>{errors.name}</Text>
                </Animated.View>
              )}
            </View>

            {/* 이메일 입력 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>이메일</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.email && styles.inputError,
                ]}
              >
                <Mail
                  size={20}
                  color={Colors.zinc[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={Colors.zinc[500]}
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              {errors.email && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.errorRow}
                >
                  <AlertCircle size={12} color={Colors.red[400]} />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </Animated.View>
              )}
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.password && styles.inputError,
                ]}
              >
                <Lock
                  size={20}
                  color={Colors.zinc[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor={Colors.zinc[500]}
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
              {errors.password && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.errorRow}
                >
                  <AlertCircle size={12} color={Colors.red[400]} />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </Animated.View>
              )}
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.confirmPassword && styles.inputError,
                ]}
              >
                <Lock
                  size={20}
                  color={Colors.zinc[500]}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 다시 입력하세요"
                  placeholderTextColor={Colors.zinc[500]}
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleChange("confirmPassword", value)
                  }
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
              {errors.confirmPassword && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.errorRow}
                >
                  <AlertCircle size={12} color={Colors.red[400]} />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </Animated.View>
              )}
            </View>

            {/* 비밀번호 요구사항 */}
            {formData.password.length > 0 && (
              <Animated.View
                entering={FadeInUp.duration(300)}
                style={styles.requirementsBox}
              >
                <Text style={styles.requirementsTitle}>비밀번호 요구사항</Text>
                {passwordRequirements.map((req, i) => (
                  <View key={i} style={styles.requirementRow}>
                    <CheckCircle
                      size={16}
                      color={req.met ? Colors.emerald[400] : Colors.zinc[600]}
                    />
                    <Text
                      style={[
                        styles.requirementText,
                        {
                          color: req.met
                            ? Colors.emerald[400]
                            : Colors.zinc[500],
                        },
                      ]}
                    >
                      {req.label}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            )}

            <View style={styles.buttonContainer}>
              <PrimaryButton onPress={handleSubmit} loading={isLoading}>
                회원가입
              </PrimaryButton>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsBox}>
            <Text style={styles.termsText}>
              가입함으로써 서비스 이용약관 및 개인정보 처리방침에 동의합니다
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  form: {
    marginTop: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[400],
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.zinc[900],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.red[500],
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.zinc[50],
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: 4,
  },
  errorText: {
    color: Colors.red[400],
    fontSize: FontSize.sm,
  },
  requirementsBox: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  requirementsTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.zinc[400],
    marginBottom: Spacing.md,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  requirementText: {
    fontSize: FontSize.sm,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  footerText: {
    color: Colors.zinc[500],
    fontSize: FontSize.sm,
  },
  loginLink: {
    color: Colors.emerald[500],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  termsBox: {
    marginTop: Spacing.xl,
    backgroundColor: `${Colors.zinc[900]}80`,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    padding: Spacing.md,
  },
  termsText: {
    color: Colors.zinc[500],
    fontSize: FontSize.xs,
    textAlign: "center",
  },
});
