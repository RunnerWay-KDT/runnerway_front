# Runner Way - 러닝 경로 생성 앱 🏃‍♂️

React Native와 Expo를 사용하여 만든 AI 기반 러닝 경로 생성 애플리케이션입니다.
이 프로젝트 구조와 관련 기술의 자세한 내용은 GUIDE.md 를 참고하세요
이 파일은 ai의 도움을 받아 생성되었습니다.

## 시작하기

1. 의존성 패키지 설치

   ```bash
   npm install
   ```

2. 앱 실행

   ```bash
   npx expo start
   ```

실행 후 다음 옵션으로 앱을 열 수 있습니다:

- [개발 빌드](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android 에뮬레이터](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS 시뮬레이터](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) - 빠른 개발 및 테스트용

**app** 디렉토리 안의 파일을 수정하여 개발을 시작할 수 있습니다. 이 프로젝트는 [파일 기반 라우팅](https://docs.expo.dev/router/introduction)을 사용합니다.

## 주요 기능

### 인증

- 로그인 / 회원가입
- 사용자 프로필 관리

### 러닝 경로 생성

- **도형/동물 프리셋**: 하트, 별, 강아지 등 다양한 모양의 경로 선택
- **직접 그리기**: 손가락으로 원하는 경로를 직접 그려서 생성
- **AI 경로 최적화**: 현재 위치에서 가장 안전하고 아름다운 경로 자동 생성

### 운동 추적

- 실시간 거리, 시간, 페이스 측정
- 칼로리 소모량 계산
- 라이브 지도 추적

### 커뮤니티

- 다른 러너들의 경로 공유
- 인기 경로 탐색

## 프로젝트 구조

```
runnerway/
├── app/
│   ├── (auth)/          # 인증 관련 화면 (로그인, 회원가입)
│   ├── (tabs)/          # 탭 네비게이션 화면 (홈, 커뮤니티, 프로필)
│   ├── (screens)/       # 기타 화면들
│   │   ├── running-setup.tsx
│   │   ├── walking-setup.tsx
│   │   ├── shape-select.tsx
│   │   ├── generating.tsx
│   │   ├── route-preview.tsx
│   │   └── workout.tsx
│   └── _layout.tsx      # 루트 레이아웃
├── components/          # 재사용 가능한 컴포넌트
│   ├── BottomSheet.tsx
│   ├── DrawingCanvas.tsx
│   ├── MapMock.tsx
│   ├── PrimaryButton.tsx
│   └── ScreenHeader.tsx
├── constants/           # 테마 및 상수
│   └── theme.ts
└── contexts/            # React Context (인증 등)
    └── AuthContext.tsx
```

## 기술 스택

- **프레임워크**: React Native, Expo SDK 54
- **내비게이션**: Expo Router (파일 기반 라우팅)
- **애니메이션**: React Native Reanimated 4.1.1
- **제스처**: React Native Gesture Handler 2.28.0
- **UI 라이브러리**:
  - @gorhom/bottom-sheet (바텀시트)
  - react-native-svg (SVG 렌더링)
  - lucide-react-native (아이콘)
- **그래픽**: Expo Linear Gradient

## 개발 가이드

### 새 화면 추가하기

1. `app/(screens)/` 디렉토리에 새 파일 생성 (예: `new-screen.tsx`)
2. 자동으로 `/new-screen` 경로로 접근 가능

### 컴포넌트 개발

모든 공통 컴포넌트는 `components/` 디렉토리에 위치합니다:

```tsx
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
```

### 테마 사용

`constants/theme.ts`에서 일관된 디자인 시스템을 제공합니다:

```tsx
import { Colors, FontSize, Spacing, BorderRadius } from "../constants/theme";
```

## 알려진 이슈 및 해결

### iOS에서 BottomSheet가 튕기는 문제

- ✅ 해결됨: `@gorhom/bottom-sheet` 라이브러리 사용으로 안정화

### DrawingCanvas Reanimated 경고

- ✅ 해결됨: `pathData.value`를 worklet 내부에서 안전하게 처리

## 더 알아보기

Expo 개발에 대해 더 알아보려면:

- [Expo 공식 문서](https://docs.expo.dev/)
- [Expo Router 가이드](https://docs.expo.dev/router/introduction/)
- [React Native 공식 문서](https://reactnative.dev/)

## 커뮤니티

- [Expo GitHub](https://github.com/expo/expo)
- [Discord 커뮤니티](https://chat.expo.dev)

## 라이센스

이 프로젝트는 교육 및 포트폴리오 목적으로 제작되었습니다.
