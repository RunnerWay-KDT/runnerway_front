# RunnerWay 백엔드 API 명세서

> **작성 기준**: 프론트엔드 코드 역추적을 통한 API 설계  
> **작성일**: 2026년 1월 21일  
> **프로젝트**: RunnerWay - AI 기반 러닝 경로 생성 앱

---

## 📋 목차

1. [개요](#개요)
2. [공통 사항](#공통-사항)
3. [인증 (Authentication)](#인증-authentication)
4. [사용자 (User)](#사용자-user)
5. [경로 생성 (Route Generation)](#경로-생성-route-generation)
6. [운동 기록 (Workout)](#운동-기록-workout)
7. [커뮤니티 (Community)](#커뮤니티-community)
8. [추천 시스템 (Recommendation)](#추천-시스템-recommendation)

---

## 개요

### 프로젝트 구조 분석 결과

**화면 구조**:

- 인증: 로그인, 회원가입
- 메인 탭: 홈, 커뮤니티, 프로필
- 경로 생성: 러닝/산책 설정 → 도형 선택 → 생성 중 → 미리보기 → 운동 → 결과

**주요 기능**:

1. 사용자 인증 (이메일/소셜 로그인)
2. AI 기반 경로 생성 (프리셋 도형 또는 커스텀 그리기)
3. 실시간 운동 추적
4. 운동 결과 저장 및 공유
5. 커뮤니티 경로 탐색 및 좋아요/북마크

---

## 공통 사항

### Base URL

```
개발: http://localhost:3000/api/v1
프로덕션: https://api.runnerway.com/api/v1
```

### 공통 헤더

```http
Content-Type: application/json
Authorization: Bearer {access_token}  # 인증 필요한 API만
```

### 공통 응답 형식

```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지",
  "timestamp": "2026-01-21T10:30:00Z"
}
```

### 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { ... }
  },
  "timestamp": "2026-01-21T10:30:00Z"
}
```

### 공통 에러 코드

| 코드               | 메시지                    | HTTP Status |
| ------------------ | ------------------------- | ----------- |
| `UNAUTHORIZED`     | 인증이 필요합니다         | 401         |
| `FORBIDDEN`        | 권한이 없습니다           | 403         |
| `NOT_FOUND`        | 리소스를 찾을 수 없습니다 | 404         |
| `VALIDATION_ERROR` | 입력값 검증 실패          | 400         |
| `INTERNAL_ERROR`   | 서버 내부 오류            | 500         |

---

## 인증 (Authentication)

### 1.1 회원가입

**화면**: `app/(auth)/signup.tsx`

**사용자 액션**:

- 이름, 이메일, 비밀번호 입력 후 회원가입 버튼 클릭

**Endpoint**: `POST /auth/signup`

**요청**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**응답 (성공)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "email": "user@example.com",
      "name": "홍길동",
      "avatar": null,
      "provider": null,
      "stats": {
        "totalDistance": 0,
        "totalWorkouts": 0,
        "completedRoutes": 0
      },
      "createdAt": "2026-01-21T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  },
  "message": "회원가입이 완료되었습니다"
}
```

**유효성 검증**:

- `email`: 이메일 형식, 중복 체크 필요
- `password`: 최소 6자 이상
- `name`: 필수, 1자 이상

**인증**: 불필요

---

### 1.2 로그인

**화면**: `app/(auth)/login.tsx`

**사용자 액션**:

- 이메일, 비밀번호 입력 후 로그인 버튼 클릭

**Endpoint**: `POST /auth/login`

**요청**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (성공)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "email": "user@example.com",
      "name": "홍길동",
      "avatar": "https://cdn.runnerway.com/avatars/user_123.jpg",
      "provider": null,
      "stats": {
        "totalDistance": 142.5,
        "totalWorkouts": 24,
        "completedRoutes": 18
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

**에러 응답**:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다"
  }
}
```

**인증**: 불필요

---

### 1.3 소셜 로그인 (카카오)

**화면**: `app/(auth)/login.tsx`

**사용자 액션**:

- 카카오 로그인 버튼 클릭

**Endpoint**: `POST /auth/social/kakao`

**요청**:

```json
{
  "provider": "kakao",
  "accessToken": "kakao_access_token_from_sdk"
}
```

**응답**: [1.2 로그인과 동일]

**비고**:

- 프론트에서 카카오 SDK로 인증 후 서버에 토큰 전달
- 서버는 카카오 API로 사용자 정보 조회 후 회원가입/로그인 처리
- `provider` 필드에 "kakao" 저장

**인증**: 불필요

---

### 1.4 토큰 갱신

**[가정]** 프론트에서 구현 안 되었지만 필요

**Endpoint**: `POST /auth/refresh`

**요청**:

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "accessToken": "new_eyJhbGc...",
    "expiresIn": 3600
  }
}
```

**인증**: Refresh Token 필요

---

### 1.5 로그아웃

**화면**: `app/(tabs)/profile.tsx`

**사용자 액션**:

- 프로필 화면에서 로그아웃 버튼 클릭

**Endpoint**: `POST /auth/logout`

**요청**: Body 없음

**응답**:

```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

**인증**: 필요

---

## 사용자 (User)

### 2.1 내 정보 조회

**화면**: `app/(tabs)/profile.tsx`

**사용자 액션**:

- 프로필 탭 진입 시 자동 호출

**Endpoint**: `GET /users/me`

**요청**: 없음

**응답**:

```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://cdn.runnerway.com/avatars/user_123.jpg",
    "provider": "kakao",
    "stats": {
      "totalDistance": 142.5,
      "totalWorkouts": 24,
      "completedRoutes": 18
    },
    "badges": [
      {
        "id": "badge_marathon",
        "name": "러닝 마스터",
        "description": "100km 달성 배지",
        "icon": "trophy",
        "unlockedAt": "2026-01-15T10:30:00Z"
      }
    ],
    "createdAt": "2025-12-01T10:30:00Z"
  }
}
```

**인증**: 필요

---

### 2.2 프로필 수정

**화면**: [가정] 프로필 수정 화면 (미구현)

**사용자 액션**:

- 프로필 화면에서 "프로필 수정" 메뉴 선택

**Endpoint**: `PATCH /users/me`

**요청**:

```json
{
  "name": "새이름",
  "avatar": "base64_encoded_image_data"
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "email": "user@example.com",
    "name": "새이름",
    "avatar": "https://cdn.runnerway.com/avatars/user_123_new.jpg",
    "updatedAt": "2026-01-21T10:30:00Z"
  }
}
```

**인증**: 필요

---

### 2.3 내 기록 조회

**화면**: [가정] 내 기록 화면 (미구현)

**사용자 액션**:

- 프로필 화면에서 "내 기록" 메뉴 선택

**Endpoint**: `GET /users/me/workouts`

**요청 파라미터**:

```
?page=1&limit=20&sort=date_desc
```

**응답**:

```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "workout_001",
        "routeName": "하트 경로 A",
        "type": "running",
        "distance": 4.2,
        "duration": 1723,
        "pace": "6'50\"",
        "calories": 247,
        "routeData": {
          "shapeId": "heart",
          "shapeName": "하트",
          "iconName": "heart"
        },
        "completedAt": "2026-01-20T18:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 98,
      "hasNext": true
    }
  }
}
```

**인증**: 필요

---

### 2.4 저장한 경로 조회

**화면**: [가정] 저장한 경로 화면 (미구현)

**사용자 액션**:

- 프로필 화면에서 "저장한 경로" 메뉴 선택

**Endpoint**: `GET /users/me/saved-routes`

**요청 파라미터**:

```
?page=1&limit=20
```

**응답**:

```json
{
  "success": true,
  "data": {
    "savedRoutes": [
      {
        "id": "route_001",
        "routeName": "한강공원 하트",
        "distance": 5.2,
        "safety": 95,
        "shapeId": "heart",
        "location": "한강공원",
        "savedAt": "2026-01-19T10:00:00Z",
        "author": {
          "id": "usr_other",
          "name": "러너123"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 45
    }
  }
}
```

**인증**: 필요

---

## 경로 생성 (Route Generation)

### 3.1 경로 생성 요청 (프리셋 도형)

**화면**: `app/(screens)/shape-select.tsx` → `generating.tsx`

**사용자 액션**:

1. 러닝/산책 설정 선택 (컨디션, 강도 등)
2. 프리셋 도형 선택 (하트, 별, 커피, 동물 등)
3. "경로 생성하기" 버튼 클릭

**Endpoint**: `POST /routes/generate`

**요청**:

```json
{
  "type": "preset",
  "mode": "running",
  "shapeId": "heart",
  "shapeName": "하트",
  "location": {
    "latitude": 37.5665,
    "longitude": 126.978
  },
  "preferences": {
    "condition": "recovery",
    "safetyMode": true,
    "targetDistance": null
  }
}
```

**요청 필드 설명**:

- `type`: "preset" (프리셋) 또는 "custom" (커스텀 그리기)
- `mode`: "running" 또는 "walking"
- `shapeId`: heart, star, coffee, smile, dog, cat 등
- `location`: 현재 사용자 위치 (GPS)
- `preferences.condition`: "recovery", "fat-burn", "challenge"
- `preferences.safetyMode`: 안전 우선 모드 (true/false)

**응답**:

```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "estimatedTime": 5,
    "status": "processing"
  },
  "message": "경로 생성을 시작했습니다"
}
```

**인증**: 필요

---

### 3.2 경로 생성 상태 조회

**화면**: `app/(screens)/generating.tsx`

**사용자 액션**:

- 경로 생성 중 화면에서 자동으로 폴링 (2초마다)

**Endpoint**: `GET /routes/generate/{taskId}`

**요청**: 없음

**응답 (진행 중)**:

```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "status": "processing",
    "progress": 45,
    "currentStep": "안전 점수 계산 중",
    "estimatedRemaining": 3
  }
}
```

**응답 (완료)**:

```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "status": "completed",
    "progress": 100,
    "routeId": "route_xyz789"
  }
}
```

**인증**: 필요

---

### 3.3 생성된 경로 옵션 조회

**화면**: `app/(screens)/route-preview.tsx`

**사용자 액션**:

- 경로 생성 완료 후 미리보기 화면 진입

**Endpoint**: `GET /routes/{routeId}/options`

**요청**: 없음

**응답**:

```json
{
  "success": true,
  "data": {
    "routeId": "route_xyz789",
    "shapeInfo": {
      "shapeId": "heart",
      "shapeName": "하트",
      "iconName": "heart",
      "isCustom": false
    },
    "options": [
      {
        "id": 1,
        "name": "하트 경로 A",
        "distance": 3.4,
        "estimatedTime": 24,
        "difficulty": "쉬움",
        "tag": "추천",
        "coordinates": [
          {"lat": 37.5665, "lng": 126.9780},
          {"lat": 37.5670, "lng": 126.9785}
        ],
        "scores": {
          "safety": 95,
          "elevation": 10,
          "lighting": 92,
          "sidewalk": 96,
          "convenience": 5
        },
        "stats": {
          "rating": 4.9,
          "runners": 203
        }
      },
      {
        "id": 2,
        "name": "하트 경로 B",
        "distance": 4.2,
        "estimatedTime": 29,
        "difficulty": "보통",
        "tag": "BEST",
        "coordinates": [...],
        "scores": {
          "safety": 88,
          "elevation": 12,
          "lighting": 87,
          "sidewalk": 92,
          "convenience": 3
        },
        "stats": {
          "rating": 4.8,
          "runners": 142
        }
      },
      {
        "id": 3,
        "name": "하트 경로 C",
        "distance": 5.0,
        "estimatedTime": 35,
        "difficulty": "도전",
        "tag": null,
        "coordinates": [...],
        "scores": {
          "safety": 84,
          "elevation": 18,
          "lighting": 80,
          "sidewalk": 85,
          "convenience": 2
        },
        "stats": {
          "rating": 4.5,
          "runners": 98
        }
      }
    ],
    "nearbyPlaces": [
      {
        "id": "place_001",
        "name": "스타벅스 강남점",
        "category": "카페",
        "distance": 0.3,
        "rating": 4.5,
        "reviews": 234,
        "location": {
          "lat": 37.5668,
          "lng": 126.9783
        }
      }
    ]
  }
}
```

**인증**: 필요

---

### 3.4 경로 생성 (커스텀 그리기)

**화면**: `app/(screens)/shape-select.tsx` (직접 그리기 탭)

**사용자 액션**:

1. "직접 그리기" 탭 선택
2. 캔버스에 손가락으로 그리기
3. 자동으로 경로 생성 시작

**Endpoint**: `POST /routes/generate`

**요청**:

```json
{
  "type": "custom",
  "mode": "running",
  "customPath": {
    "svgPath": "M 10 10 L 50 50 L 90 10 Z",
    "points": [
      { "x": 10, "y": 10 },
      { "x": 50, "y": 50 },
      { "x": 90, "y": 10 }
    ],
    "estimatedDistance": 3.2
  },
  "location": {
    "latitude": 37.5665,
    "longitude": 126.978
  },
  "preferences": {
    "safetyMode": true
  }
}
```

**응답**: [3.1과 동일]

**인증**: 필요

---

### 3.5 산책 경로 경유지 추천

**화면**: `app/(screens)/walking-setup.tsx` + `WaypointRecommendModal.tsx`

**사용자 액션**:

- 산책 설정 화면에서 "경유지 추천받기" 버튼 클릭

**Endpoint**: `GET /routes/waypoints/recommend`

**요청 파라미터**:

```
?latitude=37.5665
&longitude=126.9780
&duration=30
&categories=cafe,park,convenience
```

**응답**:

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "cafe",
        "name": "카페",
        "icon": "coffee",
        "color": "#f59e0b",
        "places": [
          {
            "id": "place_001",
            "name": "스타벅스 강남점",
            "distance": "0.3km",
            "rating": 4.5,
            "reviews": 234,
            "estimatedTime": "4분",
            "location": {
              "lat": 37.5668,
              "lng": 126.9783
            }
          },
          {
            "id": "place_002",
            "name": "투썸플레이스",
            "distance": "0.5km",
            "rating": 4.3,
            "reviews": 156,
            "estimatedTime": "7분",
            "location": {
              "lat": 37.567,
              "lng": 126.979
            }
          }
        ]
      },
      {
        "id": "park",
        "name": "공원",
        "icon": "trees",
        "color": "#10b981",
        "places": [
          {
            "id": "place_007",
            "name": "선릉공원",
            "distance": "0.4km",
            "rating": 4.6,
            "reviews": 523,
            "estimatedTime": "5분",
            "location": {
              "lat": 37.5672,
              "lng": 126.9795
            }
          }
        ]
      }
    ]
  }
}
```

**인증**: 필요

---

## 운동 기록 (Workout)

### 4.1 운동 시작

**화면**: `app/(screens)/workout.tsx`

**사용자 액션**:

- 경로 미리보기에서 경로 선택 후 "운동 시작" 버튼 클릭

**Endpoint**: `POST /workouts/start`

**요청**:

```json
{
  "routeId": "route_xyz789",
  "routeOptionId": 2,
  "mode": "running",
  "startLocation": {
    "latitude": 37.5665,
    "longitude": 126.978
  },
  "startedAt": "2026-01-21T18:00:00Z"
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "workoutId": "workout_abc123",
    "routeInfo": {
      "routeId": "route_xyz789",
      "routeName": "하트 경로 B",
      "targetDistance": 4.2,
      "coordinates": [...]
    },
    "startedAt": "2026-01-21T18:00:00Z"
  }
}
```

**인증**: 필요

---

### 4.2 운동 중 실시간 데이터 업데이트

**화면**: `app/(screens)/workout.tsx`

**사용자 액션**:

- 운동 중 실시간으로 위치 및 운동 데이터 전송 (10초마다)

**Endpoint**: `POST /workouts/{workoutId}/track`

**요청**:

```json
{
  "timestamp": "2026-01-21T18:05:30Z",
  "location": {
    "latitude": 37.567,
    "longitude": 126.9785,
    "accuracy": 15
  },
  "metrics": {
    "distance": 0.85,
    "duration": 330,
    "currentPace": "6'30\"",
    "heartRate": 145
  }
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "progress": 20.2,
    "remainingDistance": 3.35,
    "deviationFromRoute": 12,
    "suggestions": ["좋은 페이스를 유지하고 있습니다!"]
  }
}
```

**인증**: 필요

---

### 4.3 운동 일시정지/재개

**화면**: `app/(screens)/workout.tsx`

**사용자 액션**:

- 일시정지 버튼 클릭 또는 재개하기 버튼 클릭

**Endpoint**: `POST /workouts/{workoutId}/pause` 또는 `/resume`

**요청**:

```json
{
  "timestamp": "2026-01-21T18:10:00Z"
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "status": "paused",
    "pausedAt": "2026-01-21T18:10:00Z"
  }
}
```

**인증**: 필요

---

### 4.4 운동 종료

**화면**: `app/(screens)/workout.tsx` → `result.tsx`

**사용자 액션**:

- "운동 종료하기" 버튼 클릭

**Endpoint**: `POST /workouts/{workoutId}/complete`

**요청**:

```json
{
  "completedAt": "2026-01-21T18:28:43Z",
  "finalMetrics": {
    "distance": 4.2,
    "duration": 1723,
    "averagePace": "6'50\"",
    "calories": 247,
    "maxPace": "5'30\"",
    "minPace": "8'10\"",
    "heartRateAvg": 152,
    "heartRateMax": 178
  },
  "route": {
    "actualPath": [
      { "lat": 37.5665, "lng": 126.978, "timestamp": "2026-01-21T18:00:00Z" },
      { "lat": 37.567, "lng": 126.9785, "timestamp": "2026-01-21T18:01:30Z" }
    ]
  }
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "workoutId": "workout_abc123",
    "completedDistance": 4.2,
    "completedTime": 1723,
    "averagePace": "6'50\"",
    "calories": 247,
    "achievements": [
      {
        "id": "achievement_001",
        "type": "personal_best",
        "title": "개인 최고 기록 달성!",
        "description": "이번 달 최장 거리입니다",
        "icon": "trophy"
      }
    ],
    "routeCompletion": 100,
    "shapeAccuracy": 94.5,
    "savedAt": "2026-01-21T18:28:43Z"
  }
}
```

**인증**: 필요

---

### 4.5 운동 결과 공유

**화면**: `app/(screens)/result.tsx`

**사용자 액션**:

- 운동 결과 화면에서 "공유" 버튼 클릭

**Endpoint**: `POST /workouts/{workoutId}/share`

**요청**:

```json
{
  "platform": "community",
  "visibility": "public",
  "caption": "오늘 하트 경로 완주했어요! 💪"
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "postId": "post_001",
    "shareUrl": "https://runnerway.com/share/workout_abc123",
    "sharedAt": "2026-01-21T18:30:00Z"
  }
}
```

**인증**: 필요

---

## 커뮤니티 (Community)

### 5.1 커뮤니티 피드 조회

**화면**: `app/(tabs)/community.tsx`

**사용자 액션**:

- 커뮤니티 탭 진입 (인기/최신/팔로잉 탭 전환)

**Endpoint**: `GET /community/feed`

**요청 파라미터**:

```
?tab=popular&page=1&limit=20
```

- `tab`: popular, recent, following

**응답**:

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_001",
        "user": {
          "id": "usr_other",
          "name": "러너123",
          "avatar": "https://cdn.runnerway.com/avatars/user_other.jpg"
        },
        "route": {
          "shapeId": "heart",
          "shapeName": "하트",
          "iconName": "heart",
          "distance": "5.2km",
          "location": "한강공원"
        },
        "stats": {
          "likes": 142,
          "comments": 23,
          "bookmarks": 34
        },
        "isLiked": false,
        "isBookmarked": false,
        "createdAt": "2026-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "hasNext": true
    }
  }
}
```

**인증**: 필요

---

### 5.2 게시물 좋아요

**화면**: `app/(tabs)/community.tsx`

**사용자 액션**:

- 커뮤니티 게시물의 하트 아이콘 클릭

**Endpoint**: `POST /community/posts/{postId}/like`

**요청**: Body 없음

**응답**:

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 143
  }
}
```

**좋아요 취소**: `DELETE /community/posts/{postId}/like`

**인증**: 필요

---

### 5.3 게시물 북마크

**화면**: `app/(tabs)/community.tsx`

**사용자 액션**:

- 게시물의 북마크 아이콘 클릭

**Endpoint**: `POST /community/posts/{postId}/bookmark`

**요청**: Body 없음

**응답**:

```json
{
  "success": true,
  "data": {
    "isBookmarked": true
  }
}
```

**북마크 취소**: `DELETE /community/posts/{postId}/bookmark`

**인증**: 필요

---

### 5.4 댓글 조회

**화면**: [가정] 게시물 상세 화면 (미구현)

**사용자 액션**:

- 게시물의 댓글 아이콘 클릭

**Endpoint**: `GET /community/posts/{postId}/comments`

**요청 파라미터**:

```
?page=1&limit=50
```

**응답**:

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_001",
        "user": {
          "id": "usr_commenter",
          "name": "달리기왕",
          "avatar": "..."
        },
        "content": "와 멋진 경로네요!",
        "createdAt": "2026-01-20T15:45:00Z",
        "likes": 5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalCount": 23
    }
  }
}
```

**인증**: 필요

---

### 5.5 댓글 작성

**Endpoint**: `POST /community/posts/{postId}/comments`

**요청**:

```json
{
  "content": "멋진 경로네요!"
}
```

**응답**:

```json
{
  "success": true,
  "data": {
    "commentId": "comment_002",
    "content": "멋진 경로네요!",
    "createdAt": "2026-01-21T10:30:00Z"
  }
}
```

**인증**: 필요

---

## 추천 시스템 (Recommendation)

### 6.1 홈 화면 추천 경로

**화면**: `app/(tabs)/index.tsx`

**사용자 액션**:

- 홈 탭 진입 시 자동 호출

**Endpoint**: `GET /recommendations/routes`

**요청 파라미터**:

```
?latitude=37.5665&longitude=126.9780&limit=5
```

**응답**:

```json
{
  "success": true,
  "data": {
    "recommendedRoutes": [
      {
        "id": "route_rec_001",
        "name": "한강공원",
        "distance": "5.2km",
        "estimatedTime": "30분",
        "safety": 95,
        "location": {
          "name": "한강공원",
          "distance": 1.2
        },
        "popularity": {
          "rating": 4.8,
          "runners": 342
        },
        "reason": "현재 위치에서 가깝고 인기있는 경로입니다"
      },
      {
        "id": "route_rec_002",
        "name": "올림픽공원",
        "distance": "3.8km",
        "estimatedTime": "22분",
        "safety": 92,
        "location": {
          "name": "올림픽공원",
          "distance": 2.5
        },
        "popularity": {
          "rating": 4.7,
          "runners": 278
        },
        "reason": "초보자에게 적합한 평탄한 코스입니다"
      }
    ]
  }
}
```

**인증**: 필요

---

### 6.2 사용자 맞춤 추천

**[가정]** AI 기반 사용자 패턴 분석

**Endpoint**: `GET /recommendations/personalized`

**요청 파라미터**: 없음

**응답**:

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "route",
        "title": "당신이 좋아할 만한 경로",
        "items": [...]
      },
      {
        "type": "goal",
        "title": "이번 주 목표",
        "description": "10km 더 달리면 월간 목표 달성!",
        "progress": 85
      }
    ]
  }
}
```

**인증**: 필요

---

## 부록

### A. 데이터 모델 요약

**User**

```typescript
{
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: "email" | "kakao" | null;
  stats: {
    totalDistance: number;
    totalWorkouts: number;
    completedRoutes: number;
  }
  createdAt: string;
}
```

**Route**

```typescript
{
  id: string;
  userId: string;
  type: "preset" | "custom";
  shapeId: string | null;
  shapeName: string;
  mode: "running" | "walking";
  coordinates: Array<{ lat: number; lng: number }>;
  distance: number;
  estimatedTime: number;
  scores: {
    safety: number;
    elevation: number;
    lighting: number;
    sidewalk: number;
    convenience: number;
  }
  createdAt: string;
}
```

**Workout**

```typescript
{
  id: string;
  userId: string;
  routeId: string;
  mode: "running" | "walking";
  distance: number;
  duration: number;
  pace: string;
  calories: number;
  startedAt: string;
  completedAt: string;
  status: "active" | "paused" | "completed";
}
```

**CommunityPost**

```typescript
{
  id: string;
  userId: string;
  workoutId: string;
  caption: string;
  likes: number;
  comments: number;
  bookmarks: number;
  createdAt: string;
}
```

---

### B. WebSocket 실시간 통신 (선택적)

**[가정]** 운동 중 실시간 업데이트를 위한 WebSocket

**연결**: `wss://api.runnerway.com/ws/workout`

**메시지 형식 (Client → Server)**:

```json
{
  "type": "location_update",
  "workoutId": "workout_abc123",
  "data": {
    "latitude": 37.567,
    "longitude": 126.9785,
    "timestamp": "2026-01-21T18:05:30Z"
  }
}
```

**메시지 형식 (Server → Client)**:

```json
{
  "type": "progress_update",
  "data": {
    "progress": 45.2,
    "remainingDistance": 2.3,
    "suggestion": "좋은 페이스를 유지하고 있습니다!"
  }
}
```

---

### C. 에러 코드 전체 목록

| 코드                      | 메시지                                   | HTTP Status | 설명             |
| ------------------------- | ---------------------------------------- | ----------- | ---------------- |
| `EMAIL_ALREADY_EXISTS`    | 이미 사용 중인 이메일입니다              | 409         | 회원가입 시      |
| `INVALID_CREDENTIALS`     | 이메일 또는 비밀번호가 올바르지 않습니다 | 401         | 로그인 실패      |
| `TOKEN_EXPIRED`           | 토큰이 만료되었습니다                    | 401         | 토큰 갱신 필요   |
| `ROUTE_GENERATION_FAILED` | 경로 생성에 실패했습니다                 | 500         | AI 처리 오류     |
| `WORKOUT_NOT_FOUND`       | 운동 기록을 찾을 수 없습니다             | 404         | 잘못된 workoutId |
| `INVALID_LOCATION`        | 유효하지 않은 위치 정보입니다            | 400         | GPS 데이터 오류  |
| `POST_NOT_FOUND`          | 게시물을 찾을 수 없습니다                | 404         | 잘못된 postId    |

---

### D. API 우선순위

**Phase 1 (MVP)**:

1. 인증: 1.1, 1.2, 1.5
2. 사용자: 2.1
3. 경로 생성: 3.1, 3.2, 3.3
4. 운동 기록: 4.1, 4.4
5. 추천: 6.1

**Phase 2**:

- 커뮤니티 기본 기능 (5.1, 5.2, 5.3)
- 소셜 로그인 (1.3)
- 커스텀 그리기 (3.4)

**Phase 3**:

- 실시간 운동 추적 (4.2, WebSocket)
- 경유지 추천 (3.5)
- 댓글 시스템 (5.4, 5.5)
- 프로필 수정 (2.2)

---

## 변경 이력

| 날짜       | 버전  | 변경 내용                        |
| ---------- | ----- | -------------------------------- |
| 2026-01-21 | 1.0.0 | 초안 작성 (프론트엔드 코드 기반) |

---

**작성자**: AI Assistant  
**검토 필요**: 실제 백엔드 개발 전 프로덕트 팀 검토 필수  
**참고**: 이 문서는 프론트엔드 코드를 역추적하여 작성되었으며, 실제 구현 시 비즈니스 요구사항에 따라 조정이 필요할 수 있습니다.
