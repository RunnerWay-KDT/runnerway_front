// Kakao Maps API Configuration
// 환경 변수를 사용하여 API 키를 안전하게 관리합니다.
// .env 파일에 EXPO_PUBLIC_KAKAO_MAP_APP_KEY를 설정하세요.

import Constants from "expo-constants";

// ============================================
// API Configuration
// ============================================

const getApiBaseUrl = (): string => {
  const apiUrl =
    Constants.expoConfig?.extra?.apiBaseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    console.warn(
      "⚠️ API Base URL이 설정되지 않았습니다.\n" +
        ".env 파일에 EXPO_PUBLIC_API_BASE_URL을 설정하세요.\n" +
        "기본값: http://localhost:8000을 사용합니다.",
    );
    return "http://localhost:8000";
  }

  return apiUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/v1/auth/login",
      SIGNUP: "/api/v1/auth/signup",
      LOGOUT: "/api/v1/auth/logout",
      REFRESH: "/api/v1/auth/refresh",
    },
    USER: {
      ME: "/api/v1/users/me",
      UPDATE_PROFILE: "/api/v1/users/me",
    },
    ROUTES: {
      CUSTOM_DRAWING: "/api/v1/routes/custom-drawing",
    },
  },
};

// Expo의 환경 변수에서 API 키 가져오기
const getKakaoApiKey = (): string => {
  // Expo SDK 49+에서는 EXPO_PUBLIC_ 접두사를 사용합니다
  const apiKey =
    Constants.expoConfig?.extra?.kakaoMapAppKey ||
    process.env.EXPO_PUBLIC_KAKAO_MAP_APP_KEY;

  if (!apiKey || apiKey === "YOUR_KAKAO_APP_KEY") {
    console.warn(
      "⚠️ Kakao Map API 키가 설정되지 않았습니다.\n" +
        ".env 파일에 EXPO_PUBLIC_KAKAO_MAP_APP_KEY를 설정하세요.\n" +
        "자세한 내용은 KAKAO_MAP_SETUP.md를 참고하세요.",
    );
    return "YOUR_KAKAO_APP_KEY";
  }

  return apiKey;
};

// REST API 키 가져오기 (리버스 지오코딩용)
const getKakaoRestApiKey = (): string => {
  const restApiKey =
    Constants.expoConfig?.extra?.kakaoRestApiKey ||
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  if (!restApiKey) {
    console.warn(
      "⚠️ Kakao REST API 키가 설정되지 않았습니다.\n" +
        ".env 파일에 EXPO_PUBLIC_KAKAO_REST_API_KEY를 설정하세요.",
    );
    return "";
  }

  return restApiKey;
};

export const KAKAO_MAP_CONFIG = {
  // Kakao Developers (https://developers.kakao.com/)에서 발급받은 JavaScript 키
  APP_KEY: getKakaoApiKey(),

  // REST API 키 (리버스 지오코딩용)
  REST_API_KEY: getKakaoRestApiKey(),

  // 기본 지도 설정
  DEFAULT_CENTER: {
    lat: 37.5665, // 서울시청 위도
    lng: 126.978, // 서울시청 경도
  },

  DEFAULT_LEVEL: 5, // 지도 확대 레벨 (1~14, 숫자가 작을수록 확대)
};

// 환경 변수 설정 방법:
// 1. 프로젝트 루트에 .env 파일 생성
// 2. 다음 내용 추가:
//    EXPO_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_javascript_key
// 3. 앱 재시작
//
// 자세한 가이드는 KAKAO_MAP_SETUP.md를 참고하세요.
