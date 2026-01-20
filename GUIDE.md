# Runner Way 개발자 가이드 📚

이 문서는 Runner Way 프로젝트의 모든 구성요소를 신입 개발자도 완벽하게 이해할 수 있도록 상세하게 설명합니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [개발 환경 설정](#2-개발-환경-설정)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [핵심 개념](#4-핵심-개념)
5. [라우팅 시스템](#5-라우팅-시스템)
6. [상태 관리](#6-상태-관리)
7. [컴포넌트 상세 명세](#7-컴포넌트-상세-명세)
8. [화면별 상세 명세](#8-화면별-상세-명세)
9. [스타일링 시스템](#9-스타일링-시스템)
10. [애니메이션 가이드](#10-애니메이션-가이드)
11. [제스처 처리](#11-제스처-처리)
12. [유틸리티 함수](#12-유틸리티-함수)
13. [타입 정의](#13-타입-정의)
14. [트러블슈팅](#14-트러블슈팅)
15. [성능 최적화](#15-성능-최적화)
16. [배포 가이드](#16-배포-가이드)

---

## 1. 프로젝트 개요

### 1.1 Runner Way란?

Runner Way는 AI 기반 러닝 경로 생성 모바일 애플리케이션입니다. 사용자가 원하는 모양(하트, 별, 동물 등)으로 러닝 경로를 생성하고, 실시간으로 운동을 추적할 수 있습니다.

### 1.2 핵심 기능

| 기능        | 설명                                          |
| ----------- | --------------------------------------------- |
| 경로 생성   | 프리셋 도형 또는 직접 그리기로 러닝 경로 생성 |
| 운동 추적   | 실시간 거리, 시간, 페이스, 칼로리 측정        |
| 사용자 인증 | 로그인/회원가입 시스템                        |
| 커뮤니티    | 경로 공유 및 탐색                             |

### 1.3 기술 스택 상세

```
┌─────────────────────────────────────────────────────────────┐
│                        Runner Way                           │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                   │
│  ├── React Native 0.81.5 (UI 프레임워크)                    │
│  ├── lucide-react-native (아이콘)                           │
│  └── expo-linear-gradient (그라데이션)                      │
├─────────────────────────────────────────────────────────────┤
│  Navigation                                                 │
│  └── Expo Router 6.0.21 (파일 기반 라우팅)                  │
├─────────────────────────────────────────────────────────────┤
│  Animation & Gesture                                        │
│  ├── react-native-reanimated 4.1.1 (고성능 애니메이션)      │
│  ├── react-native-gesture-handler 2.28.0 (터치 제스처)      │
│  └── @gorhom/bottom-sheet 5.x (바텀시트)                    │
├─────────────────────────────────────────────────────────────┤
│  Graphics                                                   │
│  └── react-native-svg (SVG 렌더링)                          │
├─────────────────────────────────────────────────────────────┤
│  Platform                                                   │
│  └── Expo SDK 54 (네이티브 기능 접근)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 개발 환경 설정

### 2.1 필수 설치 항목

```bash
# Node.js 18 이상 필요
node --version  # v18.x.x 이상 확인

# npm 또는 yarn
npm --version   # 9.x.x 이상 권장
```

### 2.2 프로젝트 설치

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd runnerway

# 2. 의존성 설치
npm install

# 3. 개발 서버 시작
npx expo start
```

### 2.3 개발 도구

| 도구                  | 용도          | 설치 방법                                   |
| --------------------- | ------------- | ------------------------------------------- |
| VS Code               | 코드 편집기   | https://code.visualstudio.com               |
| Expo Go               | 모바일 테스트 | App Store / Play Store                      |
| React Native Debugger | 디버깅        | `brew install --cask react-native-debugger` |

### 2.4 VS Code 권장 확장

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## 3. 프로젝트 구조

### 3.1 전체 디렉토리 구조

```
runnerway/
│
├── app/                          # 📱 화면 및 라우팅 (Expo Router)
│   │
│   ├── _layout.tsx               # 🔧 루트 레이아웃 (앱 전체 설정)
│   │
│   ├── (auth)/                   # 🔐 인증 그룹 (미로그인 사용자용)
│   │   ├── _layout.tsx           #    인증 그룹 레이아웃
│   │   ├── login.tsx             #    로그인 화면
│   │   └── signup.tsx            #    회원가입 화면
│   │
│   ├── (tabs)/                   # 📑 탭 네비게이션 그룹
│   │   ├── _layout.tsx           #    탭 레이아웃 설정
│   │   ├── index.tsx             #    홈 탭 (기본 화면)
│   │   ├── community.tsx         #    커뮤니티 탭
│   │   └── profile.tsx           #    프로필 탭
│   │
│   └── (screens)/                # 📄 일반 화면 그룹
│       ├── _layout.tsx           #    스크린 그룹 레이아웃
│       ├── running-setup.tsx     #    러닝 설정
│       ├── walking-setup.tsx     #    걷기 설정
│       ├── shape-select.tsx      #    도형 선택 / 직접 그리기
│       ├── generating.tsx        #    경로 생성 중
│       ├── route-preview.tsx     #    경로 미리보기
│       ├── workout.tsx           #    운동 진행 중
│       └── result.tsx            #    운동 결과
│
├── components/                   # 🧩 재사용 컴포넌트
│   ├── BottomSheet.tsx           #    바텀시트 컴포넌트
│   ├── DrawingCanvas.tsx         #    그리기 캔버스
│   ├── MapMock.tsx               #    지도 목업
│   ├── PrimaryButton.tsx         #    주요 버튼
│   ├── ScreenHeader.tsx          #    화면 헤더
│   └── LiveMapMock.tsx           #    실시간 지도 목업
│
├── contexts/                     # 🌐 전역 상태 관리
│   └── AuthContext.tsx           #    인증 컨텍스트
│
├── constants/                    # 📐 상수 및 테마
│   └── theme.ts                  #    디자인 시스템 정의
│
├── utils/                        # 🔧 유틸리티 함수
│   └── shapeIcons.ts             #    도형 아이콘 매핑
│
├── assets/                       # 🎨 정적 자원
│   └── images/                   #    이미지 파일
│
├── app.json                      # ⚙️ Expo 앱 설정
├── package.json                  # 📦 프로젝트 의존성
├── tsconfig.json                 # 📝 TypeScript 설정
└── README.md                     # 📖 프로젝트 소개
```

### 3.2 파일 명명 규칙

| 유형      | 규칙          | 예시                |
| --------- | ------------- | ------------------- |
| 화면 파일 | kebab-case    | `running-setup.tsx` |
| 컴포넌트  | PascalCase    | `PrimaryButton.tsx` |
| 유틸리티  | camelCase     | `shapeIcons.ts`     |
| 상수      | camelCase     | `theme.ts`          |
| 레이아웃  | `_layout.tsx` | `app/_layout.tsx`   |

---

## 4. 핵심 개념

### 4.1 React Native 기초

React Native는 JavaScript로 네이티브 모바일 앱을 개발할 수 있게 해주는 프레임워크입니다.

#### 4.1.1 웹 vs React Native 컴포넌트 비교

| 웹 (HTML)       | React Native         | 설명           |
| --------------- | -------------------- | -------------- |
| `<div>`         | `<View>`             | 컨테이너 요소  |
| `<p>`, `<span>` | `<Text>`             | 텍스트 표시    |
| `<img>`         | `<Image>`            | 이미지 표시    |
| `<button>`      | `<TouchableOpacity>` | 터치 가능 요소 |
| `<input>`       | `<TextInput>`        | 텍스트 입력    |
| `<ul>`          | `<FlatList>`         | 리스트 표시    |

#### 4.1.2 기본 컴포넌트 예시

```tsx
// 웹 방식 (React)
<div className="container">
  <p>Hello World</p>
  <button onClick={handleClick}>Click</button>
</div>

// React Native 방식
<View style={styles.container}>
  <Text>Hello World</Text>
  <TouchableOpacity onPress={handleClick}>
    <Text>Click</Text>
  </TouchableOpacity>
</View>
```

### 4.2 Expo란?

Expo는 React Native 개발을 더 쉽게 만들어주는 플랫폼입니다.

```
┌────────────────────────────────────────────────────┐
│                     Expo의 역할                      │
├────────────────────────────────────────────────────┤
│                                                    │
│  개발자 코드 (JavaScript/TypeScript)               │
│       ↓                                            │
│  Expo SDK (카메라, 위치, 알림 등 네이티브 기능)    │
│       ↓                                            │
│  React Native (네이티브 브릿지)                    │
│       ↓                                            │
│  iOS / Android 네이티브 앱                         │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Expo의 장점

1. **빠른 개발**: 네이티브 코드 없이 앱 개발 가능
2. **OTA 업데이트**: 앱스토어 심사 없이 코드 업데이트
3. **Expo Go**: 즉시 모바일에서 테스트
4. **풍부한 API**: 카메라, 위치, 푸시 알림 등

### 4.3 TypeScript 기초

TypeScript는 JavaScript에 타입 시스템을 추가한 언어입니다.

#### 4.3.1 기본 타입

```typescript
// 기본 타입
const name: string = "Runner";
const age: number = 25;
const isActive: boolean = true;

// 배열 타입
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ["Kim", "Lee"];

// 객체 타입 (인터페이스)
interface User {
  id: number;
  name: string;
  email?: string; // ? = 선택적 속성 (Optional)
}

const user: User = {
  id: 1,
  name: "Kim",
};
```

#### 4.3.2 함수 타입

```typescript
// 함수 매개변수와 반환값 타입
function add(a: number, b: number): number {
  return a + b;
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;

// 콜백 함수 타입
type OnChange = (value: string) => void;

const handleChange: OnChange = (value) => {
  console.log(value);
};
```

#### 4.3.3 React Native에서의 타입

```typescript
// Props 인터페이스 정의
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary"; // 유니온 타입
}

// 타입이 적용된 컴포넌트
function Button({ title, onPress, disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

---

## 5. 라우팅 시스템

### 5.1 Expo Router 개요

Expo Router는 파일 시스템 기반 라우팅을 제공합니다. 파일 경로가 곧 URL 경로가 됩니다.

```
파일 경로                      →    URL 경로
─────────────────────────────────────────────
app/index.tsx                 →    /
app/(tabs)/index.tsx          →    / (탭 홈)
app/(tabs)/community.tsx      →    /community
app/(auth)/login.tsx          →    /login
app/(screens)/workout.tsx     →    /workout
```

### 5.2 라우트 그룹

괄호 `()`로 감싼 폴더는 **라우트 그룹**입니다. URL에 영향을 주지 않고 레이아웃을 공유합니다.

```
app/
├── (auth)/           ← 그룹: URL에 'auth' 포함 안됨
│   ├── login.tsx     → /login
│   └── signup.tsx    → /signup
└── (tabs)/           ← 그룹: URL에 'tabs' 포함 안됨
    ├── index.tsx     → /
    └── profile.tsx   → /profile
```

### 5.3 레이아웃 (\_layout.tsx)

`_layout.tsx` 파일은 해당 폴더와 하위 폴더의 레이아웃을 정의합니다.

#### 5.3.1 루트 레이아웃 (`app/_layout.tsx`)

```typescript
// app/_layout.tsx - 앱 전체의 최상위 레이아웃

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    // 제스처 핸들러의 루트 컴포넌트 (필수)
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 인증 상태를 전역으로 제공 */}
      <AuthProvider>
        {/* Stack: 화면을 쌓아서 전환하는 네비게이터 */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(screens)" />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
```

#### 5.3.2 탭 레이아웃 (`app/(tabs)/_layout.tsx`)

```typescript
// app/(tabs)/_layout.tsx - 하단 탭 네비게이션 설정

import { Tabs } from "expo-router";
import { Home, Users, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#10b981", // 활성 탭 색상
        tabBarInactiveTintColor: "#71717a", // 비활성 탭 색상
        tabBarStyle: {
          backgroundColor: "#18181b",
          borderTopColor: "#27272a",
        },
      }}
    >
      {/* 각 탭 화면 정의 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "커뮤니티",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### 5.4 화면 전환 (Navigation)

#### 5.4.1 기본 네비게이션

```typescript
import { useRouter } from "expo-router";

function MyComponent() {
  const router = useRouter();

  // 화면 이동 방법들
  const navigateExamples = () => {
    // 1. push: 새 화면을 스택에 추가
    router.push("/workout");

    // 2. replace: 현재 화면을 대체 (뒤로가기 불가)
    router.replace("/login");

    // 3. back: 이전 화면으로 돌아가기
    router.back();
  };
}
```

#### 5.4.2 파라미터 전달

```typescript
// 파라미터와 함께 화면 이동
router.push({
  pathname: "/(screens)/generating",
  params: {
    mode: "shape",
    shapeId: "heart",
    shapeName: "하트",
    shapeDistance: "4.2km",
  },
});

// 파라미터 받기
import { useLocalSearchParams } from "expo-router";

function GeneratingScreen() {
  const { mode, shapeId, shapeName, shapeDistance } = useLocalSearchParams<{
    mode: string;
    shapeId: string;
    shapeName: string;
    shapeDistance: string;
  }>();

  console.log(shapeName); // "하트"
}
```

### 5.5 인증 기반 라우팅

```typescript
// app/_layout.tsx 내부

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // 로딩 중에는 아무것도 안함

    // segments[0]은 현재 최상위 라우트 그룹
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // 미인증 사용자가 보호된 페이지 접근 시 → 로그인으로
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // 인증된 사용자가 로그인 페이지 접근 시 → 홈으로
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading, segments]);
}
```

---

## 6. 상태 관리

### 6.1 React 상태 관리 기초

#### 6.1.1 useState - 컴포넌트 내부 상태

```typescript
import { useState } from "react";

function Counter() {
  // count: 현재 상태값
  // setCount: 상태를 변경하는 함수
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>카운트: {count}</Text>
      <Button title="증가" onPress={() => setCount(count + 1)} />

      {/* 함수형 업데이트 (이전 값 기반) */}
      <Button title="증가" onPress={() => setCount((prev) => prev + 1)} />
    </View>
  );
}
```

#### 6.1.2 useEffect - 부수 효과 처리

```typescript
import { useState, useEffect } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // 컴포넌트 마운트 시 실행
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // 클린업 함수: 컴포넌트 언마운트 시 실행
    return () => {
      clearInterval(interval);
    };
  }, []); // 빈 배열: 마운트/언마운트 시에만 실행

  return <Text>경과 시간: {seconds}초</Text>;
}
```

#### 의존성 배열의 의미

```typescript
// 1. 빈 배열: 마운트 시 1번만 실행
useEffect(() => {}, []);

// 2. 의존성 있음: 해당 값이 변경될 때마다 실행
useEffect(() => {
  console.log("count가 변경됨:", count);
}, [count]);

// 3. 배열 생략: 매 렌더링마다 실행 (주의!)
useEffect(() => {});
```

### 6.2 Context API - 전역 상태 관리

Context는 props 전달 없이 컴포넌트 트리 전체에 데이터를 공유합니다.

#### 6.2.1 Context 생성 및 Provider

```typescript
// contexts/AuthContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

// 1. Context에 저장될 데이터 타입 정의
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// 2. Context 생성 (초기값 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider 컴포넌트 생성
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      // const response = await api.login(email, password);

      // 목업 데이터
      const mockUser = { id: "1", name: "사용자", email };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
  };

  // 회원가입 함수
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const mockUser = { id: "1", name, email };
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  };

  // 4. Context 값 제공
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // user가 있으면 true
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 5. 커스텀 훅으로 편리하게 사용
export function useAuth() {
  const context = useContext(AuthContext);

  // Provider 밖에서 사용 시 에러
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용 가능합니다");
  }

  return context;
}
```

#### 6.2.2 Context 사용

```typescript
// 어떤 컴포넌트에서든 사용 가능
import { useAuth } from "../contexts/AuthContext";

function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Text>로그인이 필요합니다</Text>;
  }

  return (
    <View>
      <Text>안녕하세요, {user?.name}님!</Text>
      <Button title="로그아웃" onPress={logout} />
    </View>
  );
}
```

### 6.3 useCallback과 useMemo

#### 6.3.1 useCallback - 함수 메모이제이션

```typescript
// useCallback 없이
function Parent() {
  const handleClick = () => {
    console.log("클릭");
  };
  // handleClick은 매 렌더링마다 새로운 함수 생성
  return <Child onClick={handleClick} />;
}

// useCallback 사용
function Parent() {
  const handleClick = useCallback(() => {
    console.log("클릭");
  }, []); // 의존성 배열이 비어있으면 최초 1번만 생성
  // handleClick은 동일한 참조 유지
  return <Child onClick={handleClick} />;
}
```

#### 6.3.2 useMemo - 값 메모이제이션

```typescript
function ExpensiveComponent({ items }) {
  // items가 변경될 때만 재계산
  const sortedItems = useMemo(() => {
    console.log("정렬 중...");
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return (
    <FlatList
      data={sortedItems}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

---

## 7. 컴포넌트 상세 명세

### 7.1 BottomSheet

바텀에서 올라오는 시트 컴포넌트입니다. `@gorhom/bottom-sheet` 라이브러리를 사용합니다.

#### 파일 위치

`components/BottomSheet.tsx`

#### Props 인터페이스

```typescript
interface BottomSheetProps {
  // 바텀시트 내부에 렌더링될 내용
  // 함수 형태로 전달하면 현재 상태를 인자로 받음
  children: ReactNode | ((state: SheetState) => ReactNode);

  // 시트 상태 변경 시 호출되는 콜백
  onStateChange?: (state: SheetState) => void;

  // 초기 시트 상태 (기본값: "half")
  initialState?: SheetState;
}

// 시트의 3가지 상태
type SheetState = "collapsed" | "half" | "expanded";
```

#### 사용 예시

```typescript
import { BottomSheet, SheetState } from "../components/BottomSheet";

function MyScreen() {
  const [sheetState, setSheetState] = useState<SheetState>("half");

  return (
    <View style={{ flex: 1 }}>
      <MapMock />

      <BottomSheet onStateChange={setSheetState}>
        {/* 방법 1: 일반 children */}
        <Text>바텀시트 내용</Text>

        {/* 방법 2: 함수로 상태에 따른 렌더링 */}
        {(state) =>
          state === "expanded" ? <FullContent /> : <MinimalContent />
        }
      </BottomSheet>
    </View>
  );
}
```

#### 구현 상세

```typescript
// components/BottomSheet.tsx

import GorhomBottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export function BottomSheet({
  children,
  onStateChange,
  initialState = "half",
}: BottomSheetProps) {
  const bottomSheetRef = useRef<GorhomBottomSheet>(null);

  // 스냅 포인트: 멈추는 위치들
  // [200, 400, "90%"] = collapsed, half, expanded
  const snapPoints = useMemo(() => [200, 400, "90%"], []);

  // 인덱스 → 상태 변환
  const getStateFromIndex = (index: number): SheetState => {
    switch (index) {
      case 0:
        return "collapsed";
      case 1:
        return "half";
      case 2:
        return "expanded";
      default:
        return "half";
    }
  };

  // 시트 위치 변경 핸들러
  const handleSheetChanges = useCallback(
    (index: number) => {
      const newState = getStateFromIndex(index);
      if (onStateChange) {
        onStateChange(newState);
      }
    },
    [onStateChange],
  );

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
    >
      {/* 스크롤 가능한 컨텐츠 영역 */}
      <BottomSheetScrollView>
        {typeof children === "function" ? children(currentState) : children}
      </BottomSheetScrollView>
    </GorhomBottomSheet>
  );
}
```

### 7.2 DrawingCanvas

손가락으로 경로를 그릴 수 있는 캔버스 컴포넌트입니다.

#### 파일 위치

`components/DrawingCanvas.tsx`

#### Props 인터페이스

```typescript
interface DrawingCanvasProps {
  // 그리기 완료 시 호출 (SVG 경로 데이터와 좌표 배열)
  onDrawingComplete?: (pathData: string, points: Point[]) => void;

  // 그리기 상태 변경 시 호출 (그림이 있는지 여부)
  onDrawingChange?: (hasDrawing: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}
```

#### 핵심 구현 로직

```typescript
// 1. 상태 관리
const [paths, setPaths] = useState<string[]>([]); // 완성된 경로들
const [currentPath, setCurrentPath] = useState(""); // 현재 그리고 있는 경로
const [startPoint, setStartPoint] = useState<Point>(); // 시작점
const [endPoint, setEndPoint] = useState<Point>(); // 끝점

// 2. Reanimated의 SharedValue (UI 스레드에서 사용)
const pathData = useSharedValue("");

// 3. Pan Gesture 설정
const gesture = Gesture.Pan()
  .onStart((event) => {
    "worklet"; // UI 스레드에서 실행
    const { x, y } = event;

    // SVG 경로 시작: M = MoveTo
    pathData.value = `M ${x} ${y}`;

    // JS 스레드에서 상태 업데이트 (runOnJS 필수)
    runOnJS(setStartPoint)({ x, y });
  })
  .onUpdate((event) => {
    "worklet";
    const { x, y } = event;

    // SVG 경로에 선 추가: L = LineTo
    pathData.value = `${pathData.value} L ${x} ${y}`;
    runOnJS(updatePathState)(pathData.value);
  })
  .onEnd((event) => {
    "worklet";
    runOnJS(savePath)(pathData.value);
    pathData.value = "";
  });

// 4. SVG로 렌더링
return (
  <GestureDetector gesture={gesture}>
    <Svg width={SIZE} height={SIZE}>
      {/* 완성된 경로들 */}
      {paths.map((path, index) => (
        <Path
          key={index}
          d={path} // SVG 경로 데이터
          stroke="#10b981" // 선 색상
          strokeWidth={4} // 선 두께
          fill="none" // 채우기 없음
        />
      ))}

      {/* 현재 그리는 중인 경로 (점선) */}
      {currentPath && (
        <Path
          d={currentPath}
          stroke="#10b981"
          strokeWidth={4}
          fill="none"
          strokeDasharray="8 4" // 점선 패턴
        />
      )}
    </Svg>
  </GestureDetector>
);
```

#### SVG 경로 데이터 (d 속성) 이해

```
M 100 100    → Move to (100, 100) - 펜을 들고 이동
L 200 200    → Line to (200, 200) - 현재 위치에서 선 그리기
Z            → Close path - 시작점으로 돌아가며 닫기

예시:
"M 10 10 L 90 10 L 90 90 L 10 90 Z"
→ (10,10)에서 시작해서 사각형을 그림
```

### 7.3 PrimaryButton

앱 전체에서 사용하는 주요 버튼 컴포넌트입니다.

#### 파일 위치

`components/PrimaryButton.tsx`

#### Props 인터페이스

```typescript
interface PrimaryButtonProps {
  children: ReactNode; // 버튼 텍스트 또는 내용
  onPress?: () => void; // 클릭 핸들러
  disabled?: boolean; // 비활성화 여부
  variant?: "primary" | "secondary" | "outline"; // 스타일 변형
  loading?: boolean; // 로딩 상태
  style?: ViewStyle; // 추가 스타일
}
```

#### 구현 상세 (애니메이션 포함)

```typescript
export function PrimaryButton({
  children,
  onPress,
  disabled = false,
  variant = "primary",
  loading = false,
}: PrimaryButtonProps) {
  // 애니메이션을 위한 SharedValue
  const scale = useSharedValue(1);

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 누르는 순간 축소
  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  // 떼는 순간 복원
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.button, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </AnimatedTouchable>
  );
}
```

### 7.4 ScreenHeader

화면 상단의 헤더 컴포넌트입니다.

#### 파일 위치

`components/ScreenHeader.tsx`

#### Props 인터페이스

```typescript
interface ScreenHeaderProps {
  title: string; // 제목
  subtitle?: string; // 부제목 (선택)
  onBack?: () => void; // 뒤로가기 커스텀 핸들러
  rightAction?: ReactNode; // 오른쪽 액션 버튼
  showBackButton?: boolean; // 뒤로가기 버튼 표시 여부
}
```

#### 사용 예시

```typescript
<ScreenHeader
  title="경로 생성"
  subtitle="AI가 최적의 경로를 찾고 있습니다"
  onBack={() => router.back()}
  rightAction={
    <TouchableOpacity onPress={handleShare}>
      <Share size={24} color="#fff" />
    </TouchableOpacity>
  }
/>
```

### 7.5 MapMock

지도 대신 사용하는 목업 컴포넌트입니다. 실제 앱에서는 `react-native-maps`로 교체합니다.

#### 파일 위치

`components/MapMock.tsx`

#### Props 인터페이스

```typescript
interface MapMockProps {
  routePath?: string; // 도형 이름 또는 아이콘 이름
  showRoute?: boolean; // 경로 표시 여부
  style?: ViewStyle; // 추가 스타일
}
```

---

## 8. 화면별 상세 명세

### 8.1 화면 흐름도

```
┌─────────────────────────────────────────────────────────────┐
│                        앱 시작                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  인증 확인      │
                    └───────┬────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
     ┌────────────────┐         ┌────────────────┐
     │   미인증 상태   │         │   인증됨 상태   │
     └───────┬────────┘         └───────┬────────┘
              │                           │
              ▼                           ▼
     ┌────────────────┐         ┌────────────────┐
     │     Login      │         │   Home (탭)    │
     └───────┬────────┘         └───────┬────────┘
              │                           │
              ▼                           ▼
     ┌────────────────┐    ┌──────────────────────────────┐
     │    Signup      │    │                              │
     └────────────────┘    ▼                              ▼
                    ┌─────────────┐               ┌─────────────┐
                    │   Running   │               │   Walking   │
                    │    Setup    │               │    Setup    │
                    └──────┬──────┘               └──────┬──────┘
                           │                              │
                           └──────────────┬───────────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │  Shape Select  │
                                 │  (도형/그리기)  │
                                 └───────┬────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │   Generating   │
                                 │  (경로 생성중)  │
                                 └───────┬────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │ Route Preview  │
                                 │  (경로 미리보기) │
                                 └───────┬────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │    Workout     │
                                 │   (운동 진행)   │
                                 └───────┬────────┘
                                          │
                                          ▼
                                 ┌────────────────┐
                                 │    Result      │
                                 │   (운동 결과)   │
                                 └────────────────┘
```

### 8.2 로그인 화면 (login.tsx)

#### 파일 위치

`app/(auth)/login.tsx`

#### 화면 구성요소

| 요소          | 설명                             |
| ------------- | -------------------------------- |
| 앱 로고/제목  | Runner Way 로고 및 환영 메시지   |
| 이메일 입력   | TextInput - 이메일 형식 검증     |
| 비밀번호 입력 | TextInput - secureTextEntry 적용 |
| 로그인 버튼   | PrimaryButton - 로그인 실행      |
| 회원가입 링크 | 회원가입 화면으로 이동           |

#### 상태 관리

```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const { login } = useAuth();

const handleLogin = async () => {
  // 유효성 검사
  if (!email.trim() || !password.trim()) {
    setError("이메일과 비밀번호를 입력해주세요");
    return;
  }

  try {
    setLoading(true);
    setError("");
    await login(email, password);
    // 로그인 성공 시 _layout.tsx의 useEffect가 자동으로 홈으로 이동
  } catch (err) {
    setError("로그인에 실패했습니다");
  } finally {
    setLoading(false);
  }
};
```

### 8.3 홈 화면 (index.tsx)

#### 파일 위치

`app/(tabs)/index.tsx`

#### 화면 구성요소

```
┌────────────────────────────────────────┐
│  🏃 Runner Way              [알림 🔔]   │  ← 헤더
├────────────────────────────────────────┤
│                                        │
│  안녕하세요, [사용자명]님!              │  ← 환영 메시지
│  오늘도 즐거운 러닝 되세요              │
│                                        │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  🏃 러닝 시작하기               →│  │  ← 러닝 카드
│  │  현재 위치에서 바로 시작         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  🚶 걷기 시작하기               →│  │  ← 걷기 카드
│  │  가벼운 산책을 즐겨보세요        │  │
│  └──────────────────────────────────┘  │
│                                        │
├────────────────────────────────────────┤
│  이번 주 활동                          │  ← 통계 섹션
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ 12.5km │ │ 2시간  │ │ 580   │     │
│  │  거리  │ │  시간  │ │ 칼로리 │     │
│  └────────┘ └────────┘ └────────┘     │
│                                        │
└────────────────────────────────────────┘
```

### 8.4 도형 선택 화면 (shape-select.tsx)

#### 파일 위치

`app/(screens)/shape-select.tsx`

#### 탭 구조

```
┌────────────────────────────────────────┐
│  ← 그림 경로 선택                       │
│    직접 그리거나 프리셋을 선택하세요      │
├────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ✏️ 직접그리기 │  │ 📦 프리셋   │      │  ← 메인 탭
│  └─────────────┘  └─────────────┘      │
├────────────────────────────────────────┤
```

#### 직접 그리기 탭

```typescript
{
  activeMainTab === "draw" && (
    <DrawingCanvas
      onDrawingComplete={(pathData, points) => {
        // 경로 데이터와 좌표 배열을 generating 화면으로 전달
        router.push({
          pathname: "/(screens)/generating",
          params: {
            mode: "custom",
            customPath: pathData,
          },
        });
      }}
      onDrawingChange={(hasDrawing) => {
        setHasCustomDrawing(hasDrawing);
      }}
    />
  );
}
```

#### 프리셋 탭

```typescript
// 도형 데이터 구조
interface Shape {
  id: string; // 고유 ID
  name: string; // 표시 이름
  Icon: React.ElementType; // Lucide 아이콘 컴포넌트
  iconName: string; // 아이콘 이름 (문자열로 전달용)
  distance: string; // 예상 거리
  colors: string[]; // 그라데이션 색상
}

const shapes: Shape[] = [
  {
    id: "heart",
    name: "하트",
    Icon: Heart,
    iconName: "heart",
    distance: "4.2km",
    colors: ["#ec4899", "#ef4444"],
  },
  // ... 더 많은 도형들
];
```

### 8.5 경로 생성 화면 (generating.tsx)

#### 파일 위치

`app/(screens)/generating.tsx`

#### 화면 상태

```
1. 초기 상태 (0-30%): "경로 분석 중..."
2. 중간 상태 (30-70%): "최적 경로 계산 중..."
3. 완료 상태 (70-100%): "거의 완료되었습니다..."
4. 완료: route-preview로 자동 이동
```

#### 애니메이션 구현

```typescript
// 진행률 애니메이션
const progress = useSharedValue(0);

useEffect(() => {
  // 0에서 1까지 3초 동안 애니메이션
  progress.value = withTiming(1, {
    duration: 3000,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  // 3초 후 다음 화면으로 이동
  const timer = setTimeout(() => {
    router.replace({
      pathname: "/(screens)/route-preview",
      params: {
        /* 파라미터 전달 */
      },
    });
  }, 3000);

  return () => clearTimeout(timer);
}, []);

// 회전 애니메이션 (로딩 인디케이터)
const rotation = useSharedValue(0);

useEffect(() => {
  rotation.value = withRepeat(
    withTiming(360, { duration: 1000, easing: Easing.linear }),
    -1, // -1 = 무한 반복
    false, // reverse 없음
  );
}, []);
```

### 8.6 운동 화면 (workout.tsx)

#### 파일 위치

`app/(screens)/workout.tsx`

#### 화면 구성

```
┌────────────────────────────────────────┐
│                                        │
│            [지도 영역]                  │
│     (현재 위치 + 경로 표시)             │
│                                        │
├──────────┬───────────┬─────────────────┤
│   ⏸️     │           │      ⏹️         │  ← 컨트롤 버튼
│  일시정지 │           │      중지       │
└──────────┴───────────┴─────────────────┘
┌────────────────────────────────────────┐
│  ─────────────────────────────────     │  ← BottomSheet (드래그 가능)
│                                        │
│  ┌──────────┐ ┌──────────┐            │
│  │  2.45    │ │  15:30   │            │
│  │   km     │ │   시간   │            │
│  └──────────┘ └──────────┘            │
│                                        │
│  페이스: 6'20"/km                      │
│  칼로리: 245 kcal                      │
│                                        │
│  [운동 종료하기]                        │
│                                        │
└────────────────────────────────────────┘
```

#### 타이머 및 거리 계산

```typescript
// 시간 상태 (초 단위)
const [time, setTime] = useState(0);
const [isRunning, setIsRunning] = useState(true);

// 타이머 효과
useEffect(() => {
  let interval: NodeJS.Timeout;

  if (isRunning) {
    interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  }

  return () => clearInterval(interval);
}, [isRunning]);

// 시간 포맷팅 함수
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// 페이스 계산 (분/km)
const calculatePace = (distance: number, timeInSeconds: number): string => {
  if (distance === 0) return "-'--\"";

  const paceInSeconds = timeInSeconds / distance;
  const paceMinutes = Math.floor(paceInSeconds / 60);
  const paceSeconds = Math.floor(paceInSeconds % 60);

  return `${paceMinutes}'${paceSeconds.toString().padStart(2, "0")}"`;
};
```

---

## 9. 스타일링 시스템

### 9.1 테마 시스템 개요

#### 파일 위치

`constants/theme.ts`

테마 시스템은 앱 전체에서 일관된 디자인을 유지하기 위한 상수들을 정의합니다.

### 9.2 색상 (Colors)

```typescript
// constants/theme.ts

export const Colors = {
  // 회색 계열 (배경, 텍스트 등)
  zinc: {
    50: "#fafafa", // 가장 밝은 회색
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa", // 보조 텍스트
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a", // 카드 배경
    900: "#18181b", // 메인 배경
    950: "#09090b", // 가장 어두운 배경
  },

  // 메인 색상 (버튼, 강조)
  emerald: {
    400: "#34d399", // 밝은 에메랄드
    500: "#10b981", // 메인 에메랄드
    600: "#059669", // 어두운 에메랄드
  },

  // 보조 색상들
  blue: {
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
  },

  purple: {
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
  },

  // 상태 색상
  red: {
    400: "#f87171",
    500: "#ef4444",
  },

  yellow: {
    400: "#facc15",
    500: "#eab308",
  },
};
```

#### 색상 사용 패턴

```typescript
// 배경
backgroundColor: Colors.zinc[950]; // 가장 어두운 배경
backgroundColor: Colors.zinc[900]; // 카드 배경
backgroundColor: Colors.zinc[800]; // 입력창 배경

// 텍스트
color: Colors.zinc[50]; // 기본 텍스트 (밝은)
color: Colors.zinc[400]; // 보조 텍스트 (흐린)

// 강조
backgroundColor: Colors.emerald[500]; // 버튼 배경
color: Colors.emerald[400]; // 강조 텍스트

// 투명도 적용
backgroundColor: `${Colors.emerald[500]}20`; // 20% 투명도
```

### 9.3 타이포그래피 (Typography)

```typescript
// 폰트 크기
export const FontSize = {
  xs: 12, // 아주 작은 텍스트 (캡션)
  sm: 14, // 작은 텍스트 (보조 설명)
  md: 16, // 기본 텍스트
  lg: 18, // 약간 큰 텍스트
  xl: 20, // 큰 텍스트 (소제목)
  "2xl": 24, // 더 큰 텍스트 (제목)
  "3xl": 30, // 매우 큰 텍스트
  "4xl": 36, // 대형 텍스트
  "5xl": 48, // 초대형 텍스트
};

// 폰트 두께
export const FontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};
```

#### 타이포그래피 사용 예시

```typescript
// 제목
<Text style={{
  fontSize: FontSize["2xl"],    // 24px
  fontWeight: FontWeight.bold,  // 700
  color: Colors.zinc[50],
}}>
  경로 생성
</Text>

// 본문
<Text style={{
  fontSize: FontSize.md,        // 16px
  fontWeight: FontWeight.normal, // 400
  color: Colors.zinc[400],
}}>
  설명 텍스트입니다
</Text>
```

### 9.4 간격 (Spacing)

```typescript
export const Spacing = {
  xs: 4, // 아주 작은 간격
  sm: 8, // 작은 간격
  md: 12, // 중간 간격
  lg: 16, // 기본 간격 (가장 많이 사용)
  xl: 20, // 큰 간격
  "2xl": 24, // 더 큰 간격
  "3xl": 32, // 매우 큰 간격
  "4xl": 40, // 초대형 간격
};
```

#### 간격 사용 패턴

```typescript
const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg, // 16px 전체 패딩
    paddingHorizontal: Spacing.lg, // 좌우 패딩
    paddingVertical: Spacing.md, // 상하 패딩
  },

  row: {
    flexDirection: "row",
    gap: Spacing.sm, // 요소 간 간격 8px
  },

  card: {
    marginBottom: Spacing.md, // 카드 간 간격 12px
  },
});
```

### 9.5 테두리 반경 (BorderRadius)

```typescript
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  full: 9999, // 완전한 원형
};
```

#### 테두리 반경 사용 예시

```typescript
// 버튼
borderRadius: BorderRadius.lg; // 12px

// 카드
borderRadius: BorderRadius["2xl"]; // 20px

// 원형 아바타
borderRadius: BorderRadius.full; // 9999px (완전한 원)
```

### 9.6 StyleSheet 작성 패턴

```typescript
import { StyleSheet } from "react-native";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../constants/theme";

const styles = StyleSheet.create({
  // 컨테이너 스타일
  container: {
    flex: 1,
    backgroundColor: Colors.zinc[950],
  },

  // 헤더 영역
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.zinc[800],
  },

  // 제목 텍스트
  title: {
    fontSize: FontSize["2xl"],
    fontWeight: FontWeight.bold,
    color: Colors.zinc[50],
  },

  // 카드 스타일
  card: {
    backgroundColor: Colors.zinc[900],
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  // 버튼 스타일
  button: {
    backgroundColor: Colors.emerald[500],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
```

---

## 10. 애니메이션 가이드

### 10.1 React Native Reanimated 소개

Reanimated는 React Native에서 고성능 애니메이션을 구현하기 위한 라이브러리입니다.

#### 기존 Animated vs Reanimated

```
┌────────────────────────────────────────────────────┐
│                 일반 Animated                       │
│  JS Thread → Bridge → UI Thread                    │
│  (느림, 프레임 드롭 가능)                           │
├────────────────────────────────────────────────────┤
│                 Reanimated                          │
│  UI Thread에서 직접 실행                            │
│  (60fps 부드러운 애니메이션)                        │
└────────────────────────────────────────────────────┘
```

### 10.2 기본 개념

#### 10.2.1 SharedValue

SharedValue는 UI 스레드와 JS 스레드 모두에서 접근 가능한 값입니다.

```typescript
import { useSharedValue } from "react-native-reanimated";

function MyComponent() {
  // SharedValue 생성 (초기값 0)
  const translateX = useSharedValue(0);

  // 값 변경
  translateX.value = 100; // 직접 할당

  // 애니메이션과 함께 값 변경
  translateX.value = withSpring(100);
  translateX.value = withTiming(100, { duration: 500 });
}
```

#### 10.2.2 useAnimatedStyle

SharedValue의 변화에 따라 스타일을 업데이트합니다.

```typescript
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

function AnimatedBox() {
  const translateX = useSharedValue(0);

  // SharedValue가 변경될 때마다 스타일 업데이트
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[styles.box, animatedStyle]}>
      <Text>움직이는 박스</Text>
    </Animated.View>
  );
}
```

### 10.3 애니메이션 함수

#### 10.3.1 withTiming - 시간 기반 애니메이션

```typescript
import { withTiming, Easing } from "react-native-reanimated";

// 기본 사용
translateX.value = withTiming(100);

// 옵션 지정
translateX.value = withTiming(100, {
  duration: 500, // 500ms
  easing: Easing.bezier(0.25, 0.1, 0.25, 1), // 이징 함수
});

// 콜백 (완료 시 실행)
translateX.value = withTiming(100, {}, (finished) => {
  if (finished) {
    console.log("애니메이션 완료!");
  }
});
```

#### 10.3.2 withSpring - 스프링 물리 애니메이션

```typescript
import { withSpring } from "react-native-reanimated";

// 기본 사용 (자연스러운 바운스)
scale.value = withSpring(1.2);

// 옵션 지정
scale.value = withSpring(1.2, {
  damping: 15, // 감쇠 (높을수록 빨리 멈춤)
  stiffness: 400, // 강성 (높을수록 빠르게 움직임)
  mass: 1, // 질량
});
```

#### 10.3.3 withRepeat - 반복 애니메이션

```typescript
import { withRepeat, withTiming } from "react-native-reanimated";

// 무한 반복 (로딩 스피너 등)
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1, // -1 = 무한 반복
  false, // reverse = false (역방향 없음)
);

// 3번 반복
scale.value = withRepeat(
  withSpring(1.2),
  3, // 3번 반복
  true, // reverse = true (왕복)
);
```

#### 10.3.4 withSequence - 연속 애니메이션

```typescript
import { withSequence, withTiming } from "react-native-reanimated";

// 순차적으로 실행
translateX.value = withSequence(
  withTiming(100, { duration: 300 }), // 1. 오른쪽으로
  withTiming(0, { duration: 300 }), // 2. 원래 위치로
  withTiming(-100, { duration: 300 }), // 3. 왼쪽으로
  withTiming(0, { duration: 300 }), // 4. 원래 위치로
);
```

### 10.4 Entering/Exiting 애니메이션

컴포넌트가 마운트/언마운트될 때 자동으로 실행되는 애니메이션입니다.

```typescript
import Animated, {
  FadeInUp,
  FadeOutDown,
  ZoomIn,
} from "react-native-reanimated";

function MyComponent() {
  return (
    <Animated.View
      entering={FadeInUp.duration(300)} // 나타날 때
      exiting={FadeOutDown.duration(200)} // 사라질 때
    >
      <Text>애니메이션되는 컴포넌트</Text>
    </Animated.View>
  );
}
```

#### 사용 가능한 프리셋 애니메이션

| 이름                           | 설명                 |
| ------------------------------ | -------------------- |
| `FadeIn` / `FadeOut`           | 투명도 변화          |
| `FadeInUp` / `FadeInDown`      | 페이드 + 위/아래에서 |
| `SlideInLeft` / `SlideInRight` | 좌/우에서 슬라이드   |
| `ZoomIn` / `ZoomOut`           | 확대/축소            |
| `BounceIn`                     | 바운스 효과          |
| `FlipInX` / `FlipInY`          | 뒤집기 효과          |

### 10.5 실전 예제: 버튼 누르기 애니메이션

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AnimatedButton({ onPress, children }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    // 누르면 약간 작아짐
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    // 떼면 원래 크기로
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.button, animatedStyle]}
      activeOpacity={1} // 기본 opacity 효과 제거
    >
      {children}
    </AnimatedTouchable>
  );
}
```

---

## 11. 제스처 처리

### 11.1 React Native Gesture Handler 소개

Gesture Handler는 네이티브 제스처를 처리하기 위한 라이브러리입니다.

#### 설정 (이미 완료됨)

```typescript
// app/_layout.tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 앱 내용 */}
    </GestureHandlerRootView>
  );
}
```

### 11.2 Gesture 객체

#### 11.2.1 Pan Gesture (드래그)

```typescript
import { Gesture, GestureDetector } from "react-native-gesture-handler";

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      // 제스처 시작: 현재 위치 저장
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      // 드래그 중: 위치 업데이트
      translateX.value = event.translationX + context.value.x;
      translateY.value = event.translationY + context.value.y;
    })
    .onEnd((event) => {
      // 제스처 종료: 필요시 스냅 등 처리
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
```

#### 11.2.2 Tap Gesture (탭)

```typescript
const tapGesture = Gesture.Tap()
  .numberOfTaps(2) // 더블 탭
  .onStart(() => {
    console.log("더블 탭 시작");
  })
  .onEnd(() => {
    scale.value = withSpring(scale.value === 1 ? 2 : 1);
  });
```

#### 11.2.3 Pinch Gesture (핀치 줌)

```typescript
const scale = useSharedValue(1);
const savedScale = useSharedValue(1);

const pinchGesture = Gesture.Pinch()
  .onUpdate((event) => {
    scale.value = savedScale.value * event.scale;
  })
  .onEnd(() => {
    savedScale.value = scale.value;
  });
```

### 11.3 제스처 설정 옵션

```typescript
const gesture = Gesture.Pan()
  // 수직 방향으로 10px 이상 움직여야 제스처 시작
  .activeOffsetY([-10, 10])

  // 수평 방향으로 20px 이상 움직이면 제스처 취소
  .failOffsetX([-20, 20])

  // 최소 이동 거리
  .minDistance(10)

  // UI 스레드에서 실행
  .onStart(() => {
    "worklet";
    // ...
  });
```

### 11.4 Worklet과 runOnJS

제스처 핸들러는 UI 스레드에서 실행됩니다. JS 함수를 호출하려면 `runOnJS`를 사용해야 합니다.

```typescript
import { runOnJS } from "react-native-reanimated";

function MyComponent() {
  // JS 스레드에서 실행되는 함수
  const updateState = (value: number) => {
    setState(value);
  };

  const gesture = Gesture.Pan().onUpdate((event) => {
    "worklet"; // UI 스레드에서 실행됨을 명시

    // SharedValue 직접 변경 가능
    translateX.value = event.translationX;

    // JS 함수 호출 시 runOnJS 필수!
    runOnJS(updateState)(event.translationX);
  });
}
```

#### ⚠️ 주의사항

```typescript
// ❌ 잘못된 사용 - worklet에서 JS 함수 직접 호출
.onUpdate((event) => {
  "worklet";
  setState(event.translationX);  // 에러 발생!
});

// ✅ 올바른 사용 - runOnJS 사용
.onUpdate((event) => {
  "worklet";
  runOnJS(setState)(event.translationX);  // 정상 작동
});

// ❌ 잘못된 사용 - worklet에서 console.log
.onUpdate((event) => {
  "worklet";
  console.log(event.translationX);  // 경고 발생!
});
```

---

## 12. 유틸리티 함수

### 12.1 아이콘 매핑 (shapeIcons.ts)

#### 파일 위치

`utils/shapeIcons.ts`

문자열 아이콘 이름을 실제 아이콘 컴포넌트로 변환합니다.

```typescript
// utils/shapeIcons.ts

import {
  Heart,
  Star,
  Coffee,
  Dog,
  Cat,
  Smile,
  Sparkles,
} from "lucide-react-native";
import { ElementType } from "react";

// 아이콘 이름과 컴포넌트 매핑
const iconMap: Record<string, ElementType> = {
  heart: Heart,
  star: Star,
  coffee: Coffee,
  dog: Dog,
  cat: Cat,
  smile: Smile,
  sparkles: Sparkles,
};

/**
 * 문자열 아이콘 이름을 컴포넌트로 변환
 * @param iconName - 아이콘 이름 (예: "heart", "star")
 * @returns Lucide 아이콘 컴포넌트 또는 기본 아이콘
 */
export function getIconComponent(iconName: string): ElementType {
  return iconMap[iconName] || Heart; // 없으면 Heart 반환
}
```

#### 사용 예시

```typescript
import { getIconComponent } from "../utils/shapeIcons";

function ShapeDisplay({ iconName }: { iconName: string }) {
  const Icon = getIconComponent(iconName);

  return (
    <View>
      <Icon size={48} color="#10b981" />
    </View>
  );
}

// 사용
<ShapeDisplay iconName="heart" />  // Heart 아이콘 표시
<ShapeDisplay iconName="unknown" />  // Heart 아이콘 표시 (기본값)
```

### 12.2 시간 포맷팅 함수

```typescript
/**
 * 초를 MM:SS 또는 HH:MM:SS 형식으로 변환
 * @param seconds - 총 초
 * @returns 포맷팅된 시간 문자열
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 예시
formatTime(65); // "1:05"
formatTime(3665); // "1:01:05"
```

### 12.3 거리 계산 함수

```typescript
/**
 * 두 좌표 사이의 거리 계산 (Haversine 공식)
 * @param lat1, lon1 - 시작 좌표
 * @param lat2, lon2 - 끝 좌표
 * @returns 거리 (km)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

---

## 13. 타입 정의

### 13.1 전역 타입

```typescript
// types/index.ts (필요시 생성)

// 사용자 정보
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: Date;
}

// 운동 기록
export interface Workout {
  id: string;
  userId: string;
  distance: number; // km
  duration: number; // seconds
  calories: number;
  pace: string; // "6'30\""
  route: RouteData;
  createdAt: Date;
}

// 경로 데이터
export interface RouteData {
  id: string;
  name: string;
  shape: string; // "heart", "star", "custom"
  coordinates: Coordinate[];
  distance: number;
}

// 좌표
export interface Coordinate {
  latitude: number;
  longitude: number;
}

// 경로 파라미터 (화면 간 전달)
export interface RouteParams {
  mode: "shape" | "custom";
  shapeId?: string;
  shapeName?: string;
  shapeIconName?: string;
  shapeDistance?: string;
  customPath?: string;
}
```

### 13.2 컴포넌트 Props 타입

```typescript
// 버튼 Props
interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

// 헤더 Props
interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

// 카드 Props
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}
```

---

## 14. 트러블슈팅

### 14.1 일반적인 문제와 해결책

#### 문제 1: "Text strings must be rendered within a <Text> component"

**원인**: View 안에 텍스트를 직접 넣음

```typescript
// ❌ 잘못된 코드
<View>
  Hello World
</View>

// ✅ 올바른 코드
<View>
  <Text>Hello World</Text>
</View>
```

#### 문제 2: "Cannot read property 'value' of undefined"

**원인**: SharedValue가 초기화되지 않았거나 컴포넌트 외부에서 사용

```typescript
// ❌ 잘못된 코드 - 컴포넌트 외부
const translateX = useSharedValue(0); // 훅은 컴포넌트 내부에서만!

function MyComponent() {
  translateX.value = 100; // 에러!
}

// ✅ 올바른 코드
function MyComponent() {
  const translateX = useSharedValue(0); // 컴포넌트 내부에서 선언
  translateX.value = 100; // 정상 작동
}
```

#### 문제 3: "Trying to access 'value' on a non-shareable object"

**원인**: worklet에서 일반 변수 접근 시도

```typescript
// ❌ 잘못된 코드
const [count, setCount] = useState(0);

const gesture = Gesture.Pan().onUpdate(() => {
  "worklet";
  console.log(count); // 에러! 일반 상태는 접근 불가
});

// ✅ 올바른 코드
const count = useSharedValue(0);

const gesture = Gesture.Pan().onUpdate(() => {
  "worklet";
  console.log(count.value); // SharedValue는 접근 가능
});
```

#### 문제 4: iOS에서 제스처가 작동하지 않음

**원인**: GestureHandlerRootView 누락

```typescript
// ✅ 반드시 루트 레이아웃에 추가
<GestureHandlerRootView style={{ flex: 1 }}>
  <App />
</GestureHandlerRootView>
```

#### 문제 5: BottomSheet 안에서 스크롤 안됨

**원인**: 일반 ScrollView 사용

```typescript
// ❌ 잘못된 코드
import { ScrollView } from "react-native";

<BottomSheet>
  <ScrollView>  {/* 작동 안함! */}
    {content}
  </ScrollView>
</BottomSheet>

// ✅ 올바른 코드 - BottomSheet가 이미 스크롤 제공
<BottomSheet>
  {content}  {/* 바로 내용 넣기 */}
</BottomSheet>
```

### 14.2 성능 문제

#### 문제: 애니메이션이 끊김

**해결책 1**: useCallback으로 함수 메모이제이션

```typescript
// ❌ 매 렌더링마다 새 함수 생성
const handlePress = () => {
  translateX.value = withSpring(100);
};

// ✅ 함수 재사용
const handlePress = useCallback(() => {
  translateX.value = withSpring(100);
}, []);
```

**해결책 2**: 불필요한 리렌더링 방지

```typescript
// React.memo로 컴포넌트 메모이제이션
const MyComponent = React.memo(({ data }) => {
  return <View>{/* ... */}</View>;
});
```

---

## 15. 성능 최적화

### 15.1 리스트 최적화

#### FlatList 사용

```typescript
// ❌ 느림 - map 사용
<ScrollView>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</ScrollView>

// ✅ 빠름 - FlatList 사용 (가상화)
<FlatList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={item => item.id}

  // 추가 최적화 옵션
  initialNumToRender={10}  // 처음 렌더링할 항목 수
  maxToRenderPerBatch={5}  // 배치당 렌더링 수
  windowSize={5}           // 뷰포트 배수
  removeClippedSubviews={true}  // 화면 밖 컴포넌트 제거
/>
```

### 15.2 이미지 최적화

```typescript
// expo-image 사용 권장
import { Image } from "expo-image";

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  cachePolicy="memory-disk" // 캐싱
  transition={200} // 페이드 인 효과
/>;
```

### 15.3 메모이제이션

```typescript
import { useMemo, useCallback, memo } from "react";

// 계산 값 메모이제이션
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// 함수 메모이제이션
const handlePress = useCallback(() => {
  navigation.navigate("Detail", { id: item.id });
}, [item.id]);

// 컴포넌트 메모이제이션
const ItemCard = memo(({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
});
```

---

## 16. 배포 가이드

### 16.1 개발 빌드 vs 프로덕션 빌드

| 구분   | 개발 빌드   | 프로덕션 빌드 |
| ------ | ----------- | ------------- |
| 목적   | 개발/테스트 | 스토어 배포   |
| 크기   | 큼          | 최적화됨      |
| 디버깅 | 가능        | 불가          |
| 성능   | 느림        | 최적화됨      |

### 16.2 EAS Build 사용

```bash
# EAS CLI 설치
npm install -g eas-cli

# 로그인
eas login

# 프로젝트 설정
eas build:configure

# 개발 빌드
eas build --platform ios --profile development
eas build --platform android --profile development

# 프로덕션 빌드
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 16.3 앱 스토어 제출

#### iOS (App Store)

1. Apple Developer 계정 필요 ($99/년)
2. Xcode에서 앱 서명 설정
3. App Store Connect에서 앱 등록
4. EAS로 빌드 후 제출

```bash
eas submit --platform ios
```

#### Android (Play Store)

1. Google Play 개발자 계정 필요 ($25 일회성)
2. 서명 키 생성 (EAS가 관리)
3. Play Console에서 앱 등록
4. EAS로 빌드 후 제출

```bash
eas submit --platform android
```

### 16.4 OTA 업데이트

코드 변경만 있는 경우 앱스토어 심사 없이 업데이트 가능:

```bash
# 업데이트 배포
eas update --branch production --message "버그 수정"
```

---

## 부록: 용어 사전

| 용어            | 설명                                                      |
| --------------- | --------------------------------------------------------- |
| **Component**   | UI를 구성하는 재사용 가능한 코드 블록                     |
| **Props**       | 부모 컴포넌트에서 자식으로 전달되는 데이터                |
| **State**       | 컴포넌트 내부에서 관리되는 변경 가능한 데이터             |
| **Hook**        | `use`로 시작하는 React 기능 함수 (useState, useEffect 등) |
| **Context**     | 컴포넌트 트리 전체에서 공유되는 전역 상태                 |
| **Navigation**  | 화면 간 이동을 관리하는 시스템                            |
| **Route**       | URL 경로와 매핑되는 화면                                  |
| **SharedValue** | Reanimated에서 UI/JS 스레드 간 공유되는 값                |
| **Worklet**     | UI 스레드에서 실행되는 함수                               |
| **Gesture**     | 터치, 드래그 등 사용자 입력 이벤트                        |
| **Animation**   | 값의 시간에 따른 부드러운 변화                            |

---

## 마무리

이 가이드는 Runner Way 프로젝트의 모든 측면을 다루고 있습니다.

### 학습 순서 추천

1. **기초**: React Native 기본 컴포넌트 (View, Text, TouchableOpacity)
2. **스타일링**: StyleSheet, 테마 시스템
3. **상태 관리**: useState, useEffect, Context API
4. **라우팅**: Expo Router, 화면 전환
5. **애니메이션**: Reanimated 기초
6. **제스처**: Gesture Handler
7. **고급**: 성능 최적화, 배포

### 추가 학습 자료

- [React Native 공식 문서](https://reactnative.dev/)
- [Expo 공식 문서](https://docs.expo.dev/)
- [Reanimated 공식 문서](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler 공식 문서](https://docs.swmansion.com/react-native-gesture-handler/)

---

_이 문서는 2026년 1월 기준으로 작성되었습니다._
_Runner Way v1.0_
