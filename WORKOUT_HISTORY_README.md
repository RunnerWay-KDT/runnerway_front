# 운동 기록 화면 (Workout History Screen) 구현 가이드

## 📌 개요

`workout-history.tsx`는 사용자가 완료한 운동 기록을 목록으로 조회할 수 있는 화면입니다. 러닝/산책 활동의 통계와 날짜를 표시하며, 정렬 및 새로고침 기능을 제공합니다.

---

## 🎯 주요 기능

### 1. 운동 기록 목록 조회

- **설명**: 완료된 운동 기록을 최신순/오래된순으로 표시
- **구성 요소**:
  - 경로 아이콘 (하트, 별, 커피 등)
  - 경로 이름
  - 운동 유형 (러닝/산책)
  - 통계: 거리, 시간, 페이스, 칼로리
  - 완료 날짜 (상대 시간 표시: "오늘", "어제", "3일 전" 등)

### 2. 정렬 기능

- **버튼**: 우측 상단 정렬 버튼 (`ArrowUpDown` 아이콘)
- **옵션**:
  - 최신순 (기본값)
  - 오래된순
- **동작**: 버튼 클릭 시 즉시 목록 재정렬

### 3. Pull-to-Refresh

- **설명**: 아래로 당겨서 새로운 운동 기록 가져오기
- **UI**: Emerald 색상 스피너
- **현재**: Mock 1초 딜레이 시뮬레이션

### 4. Empty State

- **표시 조건**: 운동 기록이 0개일 때
- **구성**:
  - 그래픽 아이콘 (`TrendingUp`)
  - 제목: "운동 기록이 없습니다"
  - 설명: "첫 운동을 시작하고 기록을 남겨보세요!"
  - CTA 버튼: "운동 시작하기" → 홈 탭으로 이동

---

## 🔧 기술 구현

### Mock 데이터 구조

```typescript
interface WorkoutRecord {
  id: string;
  routeName: string;
  type: "running" | "walking";
  distance: number; // km
  duration: number; // seconds
  pace: string; // "6'50\"" 형식
  calories: number;
  routeData: {
    shapeId: string;
    shapeName: string;
    iconName: string;
  };
  completedAt: string; // ISO8601
}
```

**Sample Mock Data**:

```typescript
{
  id: "workout_001",
  routeName: "하트 경로 B",
  type: "running",
  distance: 4.2,
  duration: 1723, // 28분 43초
  pace: "6'50\"",
  calories: 247,
  routeData: {
    shapeId: "heart",
    shapeName: "하트",
    iconName: "heart",
  },
  completedAt: "2026-01-20T18:30:00Z",
}
```

---

## 📐 UI 컴포넌트

### 1. ScreenHeader

- **제목**: "내 기록"
- **서브타이틀**: "완료한 운동 기록을 확인하세요"
- **뒤로가기**: profile.tsx로 돌아가기

### 2. Header Section (목록 상단)

- **총 운동 횟수**: `{workouts.length}회`
- **정렬 버튼**: 최신순/오래된순 토글

### 3. Workout Card

- **왼쪽**: 경로 아이콘
  - 러닝: Emerald 배경
  - 산책: Blue 배경
- **중앙**: 운동 정보
  - 경로 이름 + 운동 유형 배지
  - 4개 통계 그리드 (거리/시간/페이스/칼로리)
  - 완료 날짜
- **애니메이션**: FadeInUp with staggered delay (50ms \* index)

### 4. Empty State

- **레이아웃**: 중앙 정렬, Vertical Center
- **아이콘**: 원형 배경 + TrendingUp 아이콘
- **버튼**: Emerald 500 배경

---

## 🎨 스타일링

### 색상 팔레트

- **배경**: `Colors.zinc[950]`
- **카드 배경**: `Colors.zinc[900]`
- **카드 테두리**: `Colors.zinc[800]`
- **러닝 강조색**: `Colors.emerald[400]`, `Colors.emerald[500]`
- **산책 강조색**: `Colors.blue[400]`, `Colors.blue[500]`
- **텍스트**:
  - 제목: `Colors.zinc[50]`
  - 부제목: `Colors.zinc[400]`
  - 날짜: `Colors.zinc[600]`

### 레이아웃

- **Padding**: `Spacing.lg` (좌우 여백)
- **Card 간격**: `Spacing.md`
- **Icon Container**: 64x64, `BorderRadius.xl`
- **Card**: `BorderRadius["2xl"]`

---

## 🔗 네비게이션

### 진입 경로

```
profile.tsx → "내 기록" 메뉴 클릭 → workout-history.tsx
```

### 구현 (profile.tsx 수정)

```typescript
const menuItems = [
  { Icon: User, label: "프로필 수정", route: "/(screens)/profile-edit" },
  { Icon: Trophy, label: "내 기록", route: "/(screens)/workout-history" }, // ✅ 추가
  { Icon: Heart, label: "저장한 경로", route: null },
  // ...
];
```

### 퇴장 경로

- **뒤로가기 버튼**: `router.back()` → profile.tsx
- **Empty State 버튼**: `router.push("/(tabs)")` → 홈 탭

---

## 🛠 유틸리티 함수

### 1. formatDuration(seconds: number): string

**목적**: 초 단위 → 시:분:초 또는 분:초 문자열 변환

**예시**:

- `1723` → `"28:43"`
- `7340` → `"2:02:20"`

**로직**:

```typescript
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = seconds % 60;

if (hours > 0) {
  return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
return `${minutes}:${secs.toString().padStart(2, "0")}`;
```

### 2. formatDate(isoString: string): string

**목적**: ISO8601 날짜 → 상대 시간 문자열 변환

**예시**:

- 오늘 운동 → `"오늘"`
- 어제 운동 → `"어제"`
- 3일 전 → `"3일 전"`
- 1주일 이상 → `"1월 15일"`

**로직**:

```typescript
const date = new Date(isoString);
const now = new Date();
const diffMs = now.getTime() - date.getTime();
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

if (diffDays === 0) return "오늘";
if (diffDays === 1) return "어제";
if (diffDays < 7) return `${diffDays}일 전`;

const month = date.getMonth() + 1;
const day = date.getDate();
return `${month}월 ${day}일`;
```

### 3. toggleSortOrder()

**목적**: 최신순 ↔ 오래된순 정렬 전환

**로직**:

```typescript
const newOrder = sortOrder === "latest" ? "oldest" : "latest";
setSortOrder(newOrder);

const sorted = [...workouts].sort((a, b) => {
  const dateA = new Date(a.completedAt).getTime();
  const dateB = new Date(b.completedAt).getTime();
  return newOrder === "latest" ? dateB - dateA : dateA - dateB;
});

setWorkouts(sorted);
```

---

## 🌐 API 연동 준비 (TODO)

### GET /api/v1/users/me/workouts

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| page | number | X | 1 | 페이지 번호 (pagination) |
| limit | number | X | 20 | 페이지당 항목 수 |
| sort | string | X | date_desc | 정렬 기준 (date_desc, date_asc) |

**Request Headers**:

```
Authorization: Bearer {access_token}
```

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "workout_001",
        "route_name": "하트 경로 B",
        "type": "running",
        "distance": 4.2,
        "duration": 1723,
        "pace": "6'50\"",
        "calories": 247,
        "route_data": {
          "shape_id": "heart",
          "shape_name": "하트",
          "icon_name": "heart"
        },
        "completed_at": "2026-01-20T18:30:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "total_pages": 1
  }
}
```

**Response Error (401)**:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 연동 위치

```typescript
const handleRefresh = async () => {
  setIsRefreshing(true);

  try {
    const response = await fetch(
      "/api/v1/users/me/workouts?page=1&limit=20&sort=date_desc",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) throw new Error("Failed to fetch workouts");

    const json = await response.json();
    setWorkouts(json.data.workouts);
  } catch (error) {
    console.error("Workout fetch error:", error);
    // TODO: 에러 토스트 표시
  } finally {
    setIsRefreshing(false);
  }
};
```

---

## ✅ 체크리스트

### 파일 생성

- [x] `app/(screens)/workout-history.tsx` 생성
- [x] Mock 데이터 5개 추가
- [x] TypeScript 인터페이스 정의 (`WorkoutRecord`)

### UI 구현

- [x] ScreenHeader with 제목/서브타이틀
- [x] FlatList with workout cards
- [x] Empty state component
- [x] 정렬 버튼 (최신순/오래된순)
- [x] Pull-to-refresh
- [x] 애니메이션 (FadeInUp with stagger)

### 기능 구현

- [x] formatDuration 유틸리티
- [x] formatDate 유틸리티
- [x] toggleSortOrder 기능
- [x] handleRefresh Mock
- [x] Empty state 버튼 → 홈 탭 이동

### 네비게이션

- [x] profile.tsx 메뉴 아이템 수정 (route 추가)
- [x] ScreenHeader 뒤로가기 → router.back()

### 향후 작업 (TODO)

- [ ] 실제 API 연동 (`GET /api/v1/users/me/workouts`)
- [ ] 운동 상세 화면 (`workout-detail.tsx`) 구현
- [ ] 페이지네이션 (무한 스크롤)
- [ ] 에러 핸들링 (네트워크 에러 시 재시도 버튼)
- [ ] 로딩 스켈레톤 UI

---

## 🎯 사용 시나리오

### 시나리오 1: 운동 기록이 있는 사용자

1. 마이페이지에서 "내 기록" 메뉴 클릭
2. 운동 목록 표시 (최신순 정렬)
3. 우측 상단 정렬 버튼으로 오래된순 전환
4. 아래로 당겨서 새로고침
5. 카드 클릭 → (향후) 운동 상세 화면 이동

### 시나리오 2: 운동 기록이 없는 신규 사용자

1. 마이페이지에서 "내 기록" 메뉴 클릭
2. Empty State 표시
   - 아이콘 + "운동 기록이 없습니다"
   - "첫 운동을 시작하고 기록을 남겨보세요!"
3. "운동 시작하기" 버튼 클릭
4. 홈 탭으로 이동 → 경로 생성 시작

---

## 📚 참고 사항

### 아이콘 동적 로딩

```typescript
const RouteIcon = getIconComponent(item.routeData.iconName);
```

- `utils/shapeIcons.tsx`의 `getIconComponent` 활용
- 경로 shape에 따라 하트, 별, 커피 등 아이콘 표시

### 운동 유형 색상 구분

- **러닝**: Emerald (활동적, 에너지)
- **산책**: Blue (평온, 휴식)

### 성능 최적화

- FlatList 사용 (대용량 데이터 대응)
- keyExtractor로 고유 key 지정
- renderItem 함수 분리로 재사용성 확보

---

## 📝 변경 이력

### 2026-01-21

- `workout-history.tsx` 초기 구현
- Mock 데이터 5개 추가
- profile.tsx 메뉴 라우팅 연결
- Empty State, 정렬, Pull-to-Refresh 기능 완성

---

## 🚀 다음 단계

1. **운동 상세 화면 (`workout-detail.tsx`)**

   - 지도에 경로 표시
   - Lap 별 상세 통계
   - GPS 트래킹 데이터 시각화

2. **백엔드 API 연동**

   - AuthContext에 accessToken 추가
   - fetch 함수로 실제 API 호출
   - 에러 처리 및 토스트 메시지

3. **페이지네이션**

   - 무한 스크롤 구현
   - FlatList의 onEndReached 활용
   - 로딩 스피너 표시

4. **필터링 기능**
   - 운동 유형별 필터 (러닝/산책)
   - 기간별 필터 (이번 주/이번 달/전체)
   - 거리/칼로리 기준 필터

---

## 📞 문의

구현 중 문제가 발생하거나 추가 기능이 필요한 경우:

1. GUIDE.md의 프로젝트 구조 참고
2. API_SPECIFICATION.md의 엔드포인트 확인
3. FUNCTION_SPECIFICATION.csv의 기능 정의 검토
