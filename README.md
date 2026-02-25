# 🏃 Runner Way

AI 기반 러닝 경로 생성 모바일 앱입니다.  
원하는 모양(하트, 별, 물고기 등)으로 GPS 아트 러닝 경로를 만들고, 실시간으로 운동을 추적할 수 있습니다.

---

## 주요 기능

- **경로 생성** — 프리셋 도형 선택 또는 직접 그리기로 나만의 러닝 경로 생성
- **실시간 운동 추적** — 거리, 시간, 페이스, 칼로리를 실시간 측정
- **카카오맵 연동** — 지도 위에 경로를 시각화하고 실시간 위치 표시
- **커뮤니티** — 다른 사용자와 경로를 공유하고, 좋아요·댓글·북마크
- **프로필 & 기록** — 운동 히스토리 관리 및 저장된 경로 모아보기

---

## 기술 스택

| 구분       | 기술                                      |
| ---------- | ----------------------------------------- |
| 프레임워크 | React Native 0.81 + Expo SDK 54           |
| 라우팅     | Expo Router (파일 기반)                   |
| 언어       | TypeScript                                |
| 상태 관리  | React Context API                         |
| 애니메이션 | React Native Reanimated                   |
| 지도       | Kakao Maps (WebView)                      |
| UI         | lucide-react-native, expo-linear-gradient |
| 스타일링   | StyleSheet (Emerald + Zinc 다크 테마)     |

---

## 프로젝트 구조

```
app/
  (auth)/        # 로그인, 회원가입
  (tabs)/         # 탭 네비게이션 (홈, 커뮤니티, 마이)
  (screens)/      # 기능 화면들
    shape-select    - 도형 선택 / 직접 그리기
    location-setup  - 출발 위치 설정
    running-setup   - 러닝 설정
    walking-setup   - 걷기 설정
    drawing-setup   - 그리기 경로 설정
    route-preview   - 경로 미리보기
    generating      - 경로 생성 중 로딩
    workout         - 실시간 운동 화면
    result          - 운동 결과
    workout-history - 운동 기록
    saved-routes    - 저장된 경로
    profile-edit    - 프로필 수정
    safety-settings - 안전 설정
components/        # 재사용 컴포넌트
constants/         # 테마, API 설정, 프리셋 도형
contexts/          # AuthContext (인증 상태 관리)
utils/             # API 통신 유틸리티
types/             # TypeScript 타입 정의
```

---

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS 에뮬레이터 또는 Expo Go 앱

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start

# 플랫폼별 실행
npm run android
npm run ios
npm run web
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 항목을 설정합니다.

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_javascript_key
EXPO_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

---

## API 연동

백엔드 API 엔드포인트 구조:

| 도메인    | 주요 엔드포인트                                                  |
| --------- | ---------------------------------------------------------------- |
| 인증      | `/api/v1/auth/login`, `signup`, `logout`, `refresh`              |
| 사용자    | `/api/v1/users/me`                                               |
| 경로 생성 | `/api/v1/routes/generate-gps-art`, `custom-drawing`, `recommend` |
| 운동      | `/api/v1/workouts/start`, `complete`, `pause`, `resume`          |
| 커뮤니티  | `/api/v1/community/feed`, `posts`, 좋아요/댓글/북마크            |
| 저장 경로 | `/api/v1/users/me/saved-routes`                                  |

---

## 화면 흐름

```
로그인/회원가입
      ↓
   홈 (탭)  ←→  커뮤니티 (탭)  ←→  마이 (탭)
      ↓
  도형 선택 / 직접 그리기
      ↓
  출발 위치 설정
      ↓
  러닝/걷기 설정
      ↓
  경로 생성 (AI)
      ↓
  경로 미리보기
      ↓
  실시간 운동
      ↓
  운동 결과
```
