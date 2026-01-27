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
import { Mail, Lock, AlertCircle } from "lucide-react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useAuth } from "../../contexts/AuthContext";
import { PrimaryButton } from "../../components/PrimaryButton";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요");
      return;
    }

    if (!email.includes("@")) {
      setError("올바른 이메일 형식을 입력해주세요");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setError("이메일 또는 비밀번호가 올바르지 않습니다");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "로그인에 실패했습니다";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={styles.header}
          >
            <Text style={styles.title}>러너웨이</Text>
            <Text style={styles.subtitle}>
              나만의 그림 경로로 러닝을 시작하세요
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeIn.delay(200).duration(500)}
            style={styles.form}
          >
            <View style={styles.inputContainer}>
              <Mail
                size={20}
                color={Colors.zinc[500]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor={Colors.zinc[500]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock
                size={20}
                color={Colors.zinc[500]}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor={Colors.zinc[500]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {error ? (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.errorContainer}
              >
                <AlertCircle size={16} color={Colors.red[400]} />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <PrimaryButton onPress={handleLogin} loading={isLoading}>
              로그인
            </PrimaryButton>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>계정이 없으신가요? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupLink}>회원가입</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.notice}>위치 및 알림 권한이 필요합니다</Text>
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
    paddingVertical: Spacing.xl,
    justifyContent: "center",
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    fontSize: FontSize["5xl"],
    fontWeight: FontWeight.bold,
    color: Colors.emerald[500],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.zinc[400],
  },
  form: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.zinc[900],
    borderWidth: 1,
    borderColor: Colors.zinc[800],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.red[500]}15`,
    borderWidth: 1,
    borderColor: `${Colors.red[500]}30`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.red[400],
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
  },
  forgotPassword: {
    alignItems: "flex-start",
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    color: Colors.zinc[500],
    fontSize: FontSize.sm,
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
  signupLink: {
    color: Colors.emerald[500],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  notice: {
    color: Colors.zinc[600],
    fontSize: FontSize.xs,
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
