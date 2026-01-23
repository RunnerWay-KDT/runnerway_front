# RunnerWay API Specification v2.0

**작성일**: 2026년 1월 23일  
**프로젝트**: RunnerWay Front-End  
**API 버전**: v1  
**Base URL**: `https://api.runnerway.com/api/v1`

---

## 📋 목차

1. [인증 (Authentication)](#1-인증-authentication)
2. [사용자 (User)](#2-사용자-user)
3. [경로 생성 (Route Generation)](#3-경로-생성-route-generation)
4. [경로 관리 (Route Management)](#4-경로-관리-route-management)
5. [운동 (Workout)](#5-운동-workout)
6. [커뮤니티 (Community)](#6-커뮤니티-community)
7. [설정 (Settings)](#7-설정-settings)
8. [추천 (Recommendation)](#8-추천-recommendation)

---

## 변경 사항 요약 (v2.0)

### ✅ 신규 추가된 API (18개)

1. **커뮤니티** - 게시물 상세 조회, 댓글 수정/삭제, 댓글 좋아요
2. **경로 관리** - 경로 저장/취소, 저장한 경로 목록
3. **운동** - 운동 기록 상세/히스토리/삭제
4. **설정** - 전체 설정 조회/업데이트, 긴급 연락처 관리, 계정 삭제

### 🔄 수정된 API

- `GET /routes/{routeId}/options` - nearbyPlaces 구조 개선 (카테고리별 분리)
- `GET /community/posts/{postId}/comments` - isLiked 필드 추가
- `PATCH /users/me` - 유효성 검증 명시 (name 최소 2자)
- `GET /users/me` - totalCalories 통계 추가

### 📱 새로운 화면 (10개)

- PostDetailModal, WorkoutDetailModal
- route-select, saved-routes, workout-history
- profile-edit, app-settings, safety-settings

---

## 🔐 1. 인증 (Authentication)

### 1.1 회원가입

```http
POST /auth/signup
Content-Type: application/json
```

**Request**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "홍길동",
      "avatar": null,
      "provider": null,
      "stats": {
        "totalDistance": 0,
        "totalWorkouts": 0,
        "completedRoutes": 0
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

**Error Codes**

- `400` VALIDATION_ERROR - 입력값 검증 실패
- `409` EMAIL_ALREADY_EXISTS - 이메일 중복

**사용 화면**: `signup.tsx`

---

### 1.2 로그인

```http
POST /auth/login
Content-Type: application/json
```

**Request**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**사용 화면**: `login.tsx`

---

### 1.3 카카오 소셜 로그인

```http
POST /auth/social/kakao
Content-Type: application/json
```

**Request**

```json
{
  "provider": "kakao",
  "accessToken": "kakao_access_token_from_sdk"
}
```

**사용 화면**: `login.tsx`

---

### 1.4 토큰 갱신

```http
POST /auth/refresh
Content-Type: application/json
```

**Request**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

---

### 1.5 로그아웃

```http
POST /auth/logout
Authorization: Bearer {token}
```

**사용 화면**: `profile.tsx`

---

## 👤 2. 사용자 (User)

### 2.1 내 정보 조회

```http
GET /users/me
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "홍길동",
    "avatar": "https://cdn.runnerway.com/avatars/user_123.jpg",
    "provider": "kakao",
    "stats": {
      "totalDistance": 42.5,
      "totalWorkouts": 12,
      "completedRoutes": 8,
      "totalCalories": 2547
    },
    "badges": [
      {
        "id": "badge_001",
        "name": "첫 걸음",
        "description": "첫 운동 완료",
        "icon": "trophy",
        "unlockedAt": "2026-01-15T10:00:00Z"
      }
    ],
    "createdAt": "2026-01-10T10:00:00Z"
  }
}
```

**사용 화면**: `profile.tsx`

---

### 2.2 프로필 수정

```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "name": "김철수",
  "avatar": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Validation Rules**

- `name`: 최소 2자 이상
- `avatar`: Base64 인코딩된 이미지

**사용 화면**: `profile-edit.tsx`

---

## 🗺️ 3. 경로 생성 (Route Generation)

### 3.1 경로 생성 요청 (비동기)

```http
POST /routes/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request - 러닝 (프리셋)**

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
    "condition": "fat-burn",
    "safetyMode": true
  }
}
```

**Request - 산책 (커스텀 + 경유지)**

```json
{
  "type": "custom",
  "mode": "walking",
  "customPath": {
    "svgPath": "M 100 100 L 200 200...",
    "points": [
      { "x": 100, "y": 100 },
      { "x": 200, "y": 200 }
    ],
    "estimatedDistance": 3.5
  },
  "location": {
    "latitude": 37.5665,
    "longitude": 126.978
  },
  "preferences": {
    "intensity": "moderate",
    "duration": 30,
    "waypoints": [
      {
        "id": 1,
        "name": "스타벅스 강남점",
        "distance": "0.5km",
        "time": "6분"
      }
    ]
  }
}
```

**Response (202 Accepted)**

```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "estimatedTime": 15,
    "status": "processing"
  }
}
```

**사용 화면**: `shape-select.tsx`, `running-setup.tsx`, `walking-setup.tsx`

---

### 3.2 경로 생성 상태 조회 (폴링)

```http
GET /routes/generate/{taskId}
Authorization: Bearer {token}
```

**Response - Processing**

```json
{
  "success": true,
  "data": {
    "taskId": "task_abc123",
    "status": "processing",
    "progress": 65,
    "currentStep": "경로 최적화 중...",
    "estimatedRemaining": 8
  }
}
```

**Response - Completed**

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

**사용 화면**: `generating.tsx` (2초마다 폴링)

---

### 3.3 경로 옵션 조회 ⭐ 업데이트됨

```http
GET /routes/{routeId}/options
Authorization: Bearer {token}
```

**Response (200 OK)**

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
          {"lat": 37.5665, "lng": 126.9780}
        ],
        "scores": {
          "safety": 95,
          "elevation": 10,
          "lighting": 92,
          "sidewalk": 96,
          "convenience": 5
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
        }
      }
    ],
    "nearbyPlaces": {
      "convenience": [
        {
          "id": "place_001",
          "name": "GS25 강남점",
          "distance": "0.2km",
          "estimatedTime": "3분"
        }
      ],
      "restroom": [
        {
          "id": "place_002",
          "name": "공공화장실",
          "distance": "0.4km",
          "estimatedTime": "5분"
        }
      ],
      "fountain": [
        {
          "id": "place_003",
          "name": "음수대",
          "distance": "0.3km",
          "estimatedTime": "4분"
        }
      ],
      "cctv": [
        {
          "id": "place_004",
          "name": "CCTV",
          "distance": "0.1km",
          "estimatedTime": "1분"
        }
      ]
    }
  }
}
```

**변경 사항**:

- `nearbyPlaces` 구조 변경: 카테고리별로 분리 (편의점, 화장실, 음수대, CCTV)
- `rating`, `runners` 필드 제거 (UI 단순화)

**사용 화면**: `route-preview.tsx`

---

### 3.4 경유지 추천

```http
GET /routes/waypoints/recommend
Authorization: Bearer {token}
```

**Query Parameters**

- `latitude`: 37.5665
- `longitude`: 126.9780
- `duration`: 30
- `categories`: cafe,park,convenience,photo

**Response (200 OK)**

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
            "id": "place_cafe_001",
            "name": "스타벅스 강남점",
            "distance": "0.5km",
            "rating": 4.5,
            "reviews": 234,
            "estimatedTime": "6분",
            "location": {
              "lat": 37.5670,
              "lng": 126.9785
            }
          }
        ]
      },
      {
        "id": "park",
        "name": "공원",
        "icon": "trees",
        "color": "#10b981",
        "places": [...]
      }
    ]
  }
}
```

**사용 화면**: `walking-setup.tsx`, `WaypointRecommendModal.tsx`

---

## 📍 4. 경로 관리 (Route Management) 🆕

### 4.1 경로 저장 (북마크) 🆕

```http
POST /routes/{routeId}/save
Authorization: Bearer {token}
```

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "savedRouteId": "saved_route_001",
    "savedAt": "2026-01-23T12:00:00Z"
  }
}
```

**Error Codes**

- `404` ROUTE_NOT_FOUND
- `409` ALREADY_SAVED

**사용 화면**: `route-preview.tsx`, `route-select.tsx`

---

### 4.2 경로 저장 취소 🆕

```http
DELETE /routes/{routeId}/save
Authorization: Bearer {token}
```

**사용 화면**: `saved-routes.tsx`

---

### 4.3 저장한 경로 목록 조회 🆕

```http
GET /routes/saved
Authorization: Bearer {token}
```

**Query Parameters**

- `page`: 1
- `limit`: 20
- `sort`: savedAt_desc | distance_asc | safety_desc

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "savedRoutes": [
      {
        "id": "route_001",
        "routeName": "한강 하트 경로",
        "distance": 4.2,
        "safetyScore": 92,
        "location": {
          "address": "서울특별시 영등포구 여의도동",
          "district": "여의도"
        },
        "author": {
          "id": "user_123",
          "name": "러너왕"
        },
        "routeData": {
          "shapeId": "heart",
          "shapeName": "하트",
          "iconName": "heart"
        },
        "savedAt": "2026-01-20T15:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 45,
      "hasNext": true
    }
  }
}
```

**사용 화면**: `saved-routes.tsx`, `route-select.tsx`

---

## 🏃 5. 운동 (Workout)

### 5.1 운동 시작

```http
POST /workouts/start
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "routeId": "route_xyz789",
  "routeOptionId": 2,
  "mode": "running",
  "startLocation": {
    "latitude": 37.5665,
    "longitude": 126.978
  },
  "startedAt": "2026-01-23T14:00:00Z"
}
```

**Response (201 Created)**

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
    "startedAt": "2026-01-23T14:00:00Z"
  }
}
```

**사용 화면**: `workout.tsx`

---

### 5.2 실시간 데이터 업데이트

```http
POST /workouts/{workoutId}/track
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "timestamp": "2026-01-23T14:05:30Z",
  "location": {
    "latitude": 37.567,
    "longitude": 126.9785,
    "accuracy": 5.2
  },
  "metrics": {
    "distance": 0.85,
    "duration": 330,
    "currentPace": "6'30\"",
    "heartRate": 145
  }
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "progress": 20.2,
    "remainingDistance": 3.35,
    "deviationFromRoute": 12.5,
    "suggestions": ["50m 앞에서 우회전하세요"]
  }
}
```

**호출 주기**: 10초마다 (또는 WebSocket 사용 권장)

**사용 화면**: `workout.tsx`

---

### 5.3 운동 일시정지

```http
POST /workouts/{workoutId}/pause
Authorization: Bearer {token}
```

**사용 화면**: `workout.tsx`

---

### 5.4 운동 재개

```http
POST /workouts/{workoutId}/resume
Authorization: Bearer {token}
```

**사용 화면**: `workout.tsx`

---

### 5.5 운동 종료

```http
POST /workouts/{workoutId}/complete
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "completedAt": "2026-01-23T14:28:43Z",
  "finalMetrics": {
    "distance": 4.2,
    "duration": 1723,
    "averagePace": "6'50\"",
    "calories": 247,
    "maxPace": "5'30\"",
    "minPace": "8'20\"",
    "heartRateAvg": 152,
    "heartRateMax": 178
  },
  "route": {
    "actualPath": [
      {
        "lat": 37.5665,
        "lng": 126.978,
        "timestamp": "2026-01-23T14:00:00Z"
      }
    ]
  }
}
```

**Response (200 OK)**

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
        "title": "새로운 기록!",
        "description": "가장 빠른 5km 기록을 달성했습니다",
        "icon": "trophy"
      }
    ],
    "routeCompletion": 98.5,
    "shapeAccuracy": 92.3,
    "savedAt": "2026-01-23T14:28:43Z"
  }
}
```

**사용 화면**: `result.tsx`, `workout.tsx`

---

### 5.6 운동 기록 상세 조회 🆕

```http
GET /workouts/{workoutId}
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "workout_abc123",
    "routeName": "하트 경로 B",
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
    "splits": [
      { "km": 1, "pace": "6'15\"", "duration": 375 },
      { "km": 2, "pace": "5'58\"", "duration": 358 },
      { "km": 3, "pace": "7'02\"", "duration": 422 },
      { "km": 4, "pace": "6'50\"", "duration": 410 }
    ],
    "maxSpeed": 11.2,
    "avgSpeed": 8.5,
    "elevation": {
      "gain": 45,
      "loss": 38
    },
    "completedAt": "2026-01-23T14:28:43Z"
  }
}
```

**사용 화면**: `WorkoutDetailModal.tsx`, `workout-history.tsx`

---

### 5.7 운동 기록 히스토리 🆕

```http
GET /workouts/history
Authorization: Bearer {token}
```

**Query Parameters**

- `page`: 1
- `limit`: 20
- `type`: all | running | walking
- `sort`: date_desc | distance_desc

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "workouts": [
      {
        "id": "workout_001",
        "routeName": "하트 경로 B",
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
      "totalCount": 87,
      "hasNext": true
    },
    "summary": {
      "totalDistance": 42.5,
      "totalWorkouts": 12,
      "totalCalories": 2547,
      "avgPace": "6'45\""
    }
  }
}
```

**사용 화면**: `workout-history.tsx`

---

### 5.8 운동 기록 삭제 🆕

```http
DELETE /workouts/{workoutId}
Authorization: Bearer {token}
```

**권한**: 본인 기록만 삭제 가능

**사용 화면**: `workout-history.tsx`, `WorkoutDetailModal.tsx`

---

### 5.9 운동 결과 공유

```http
POST /workouts/{workoutId}/share
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "platform": "community",
  "visibility": "public",
  "caption": "오늘도 완주! 🏃‍♂️💪"
}
```

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "postId": "post_xyz789",
    "shareUrl": "https://runnerway.com/share/post_xyz789",
    "sharedAt": "2026-01-23T14:30:00Z"
  }
}
```

**사용 화면**: `result.tsx`

---

## 👥 6. 커뮤니티 (Community)

### 6.1 커뮤니티 피드 조회

```http
GET /community/feed
Authorization: Bearer {token}
```

**Query Parameters**

- `tab`: popular | recent | following
- `page`: 1
- `limit`: 20

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_001",
        "author": {
          "id": "user_123",
          "name": "러너왕",
          "avatar": "https://..."
        },
        "route": {
          "shapeId": "heart",
          "shapeName": "하트",
          "iconName": "heart",
          "distance": "5.2km",
          "location": "여의도 한강공원"
        },
        "stats": {
          "likes": 45,
          "comments": 12,
          "bookmarks": 8
        },
        "isLiked": false,
        "isBookmarked": true,
        "createdAt": "2026-01-22T18:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 12,
      "hasNext": true
    }
  }
}
```

**사용 화면**: `community.tsx`

---

### 6.2 게시물 상세 조회 🆕

```http
GET /community/posts/{postId}
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "author": {
      "id": "user_123",
      "name": "러너왕",
      "avatar": "https://..."
    },
    "route": {
      "name": "하트 경로 B",
      "shapeId": "heart",
      "shapeName": "하트",
      "iconName": "heart",
      "distance": 4.2,
      "duration": 1723,
      "pace": "6'50\"",
      "calories": 247
    },
    "location": "여의도 한강공원",
    "caption": "오늘도 완주! 🏃‍♂️💪",
    "stats": {
      "likes": 45,
      "comments": 12,
      "bookmarks": 8
    },
    "isLiked": false,
    "isBookmarked": true,
    "createdAt": "2026-01-22T18:30:00Z"
  }
}
```

**사용 화면**: `PostDetailModal.tsx`

---

### 6.3 게시물 좋아요

```http
POST /community/posts/{postId}/like
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 46
  }
}
```

**사용 화면**: `community.tsx`, `PostDetailModal.tsx`

---

### 6.4 게시물 좋아요 취소

```http
DELETE /community/posts/{postId}/like
Authorization: Bearer {token}
```

**사용 화면**: `community.tsx`, `PostDetailModal.tsx`

---

### 6.5 게시물 북마크

```http
POST /community/posts/{postId}/bookmark
Authorization: Bearer {token}
```

**사용 화면**: `community.tsx`, `PostDetailModal.tsx`

---

### 6.6 게시물 북마크 취소

```http
DELETE /community/posts/{postId}/bookmark
Authorization: Bearer {token}
```

**사용 화면**: `community.tsx`, `PostDetailModal.tsx`

---

### 6.7 댓글 조회 ⭐ 업데이트됨

```http
GET /community/posts/{postId}/comments
Authorization: Bearer {token}
```

**Query Parameters**

- `page`: 1
- `limit`: 50

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment_001",
        "author": {
          "id": "user_456",
          "name": "달리기조아",
          "avatar": null
        },
        "content": "와 정말 멋진 경로네요! 저도 따라 달려보고 싶어요 🏃‍♂️",
        "createdAt": "2026-01-22T10:30:00Z",
        "likes": 12,
        "isLiked": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalCount": 45
    }
  }
}
```

**변경 사항**: `isLiked` 필드 추가

**사용 화면**: `PostDetailModal.tsx`

---

### 6.8 댓글 작성

```http
POST /community/posts/{postId}/comments
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "content": "와 정말 멋진 경로네요! 저도 따라 달려보고 싶어요 🏃‍♂️"
}
```

**Validation**

- `content`: 필수, 최대 500자

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "comment_new",
    "author": {
      "id": "user_me",
      "name": "홍길동",
      "avatar": null
    },
    "content": "와 정말 멋진 경로네요! 저도 따라 달려보고 싶어요 🏃‍♂️",
    "createdAt": "2026-01-23T15:30:00Z",
    "likes": 0,
    "isLiked": false
  }
}
```

**사용 화면**: `PostDetailModal.tsx`

---

### 6.9 댓글 수정 🆕

```http
PATCH /community/posts/{postId}/comments/{commentId}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "content": "수정된 댓글 내용입니다"
}
```

**권한**: 본인 댓글만 수정 가능

**Error Codes**

- `403` UNAUTHORIZED - 권한 없음
- `404` COMMENT_NOT_FOUND

**사용 화면**: `PostDetailModal.tsx`

---

### 6.10 댓글 삭제 🆕

```http
DELETE /community/posts/{postId}/comments/{commentId}
Authorization: Bearer {token}
```

**권한**: 본인 댓글만 삭제 가능

**사용 화면**: `PostDetailModal.tsx`

---

### 6.11 댓글 좋아요 🆕

```http
POST /community/posts/{postId}/comments/{commentId}/like
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 13
  }
}
```

**사용 화면**: `PostDetailModal.tsx`

---

### 6.12 댓글 좋아요 취소 🆕

```http
DELETE /community/posts/{postId}/comments/{commentId}/like
Authorization: Bearer {token}
```

**사용 화면**: `PostDetailModal.tsx`

---

## ⚙️ 7. 설정 (Settings) 🆕

### 7.1 사용자 설정 조회 🆕

```http
GET /users/me/settings
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "app": {
      "darkMode": true,
      "language": "ko"
    },
    "notifications": {
      "pushEnabled": true,
      "workoutReminder": true,
      "goalAchievement": true,
      "communityActivity": false
    },
    "workout": {
      "soundEffect": true,
      "vibration": true,
      "voiceGuide": true,
      "autoLap": false
    },
    "safety": {
      "nightSafetyMode": true,
      "autoNightMode": true,
      "shareLocation": false,
      "sosButton": true,
      "emergencyContacts": [
        {
          "id": "contact_001",
          "name": "엄마",
          "phone": "010-1234-5678"
        }
      ]
    }
  }
}
```

**사용 화면**: `app-settings.tsx`, `safety-settings.tsx`

---

### 7.2 사용자 설정 업데이트 🆕

```http
PATCH /users/me/settings
Authorization: Bearer {token}
Content-Type: application/json
```

**Request (부분 업데이트)**

```json
{
  "notifications": {
    "communityActivity": true
  },
  "safety": {
    "nightSafetyMode": false
  }
}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "updatedSettings": {
      "notifications.communityActivity": true,
      "safety.nightSafetyMode": false
    },
    "updatedAt": "2026-01-23T16:00:00Z"
  }
}
```

**사용 화면**: `app-settings.tsx`, `safety-settings.tsx`

---

### 7.3 긴급 연락처 추가 🆕

```http
POST /users/me/emergency-contacts
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "name": "아빠",
  "phone": "010-9876-5432"
}
```

**Validation**

- `name`: 필수
- `phone`: 10-15자리 숫자
- 최대 3개까지 등록 가능

**Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "id": "contact_002",
    "name": "아빠",
    "phone": "010-9876-5432",
    "createdAt": "2026-01-23T16:05:00Z"
  }
}
```

**Error Codes**

- `400` LIMIT_EXCEEDED - 최대 3개 초과

**사용 화면**: `safety-settings.tsx`

---

### 7.4 긴급 연락처 삭제 🆕

```http
DELETE /users/me/emergency-contacts/{contactId}
Authorization: Bearer {token}
```

**사용 화면**: `safety-settings.tsx`

---

### 7.5 계정 삭제 🆕

```http
DELETE /users/me/account
Authorization: Bearer {token}
Content-Type: application/json
```

**Request**

```json
{
  "password": "password123",
  "reason": "더 이상 사용하지 않음"
}
```

**주의사항**

- 이메일 계정: `password` 필수
- 소셜 로그인: `password` 불필요
- 모든 데이터 영구 삭제 (복구 불가)

**Response (200 OK)**

```json
{
  "success": true,
  "message": "계정이 삭제되었습니다"
}
```

**Error Codes**

- `401` INVALID_PASSWORD - 비밀번호 불일치
- `403` UNAUTHORIZED

**사용 화면**: `app-settings.tsx`

---

## 🎯 8. 추천 (Recommendation)

### 8.1 홈 화면 추천 경로

```http
GET /recommendations/routes
Authorization: Bearer {token}
```

**Query Parameters**

- `latitude`: 37.5665
- `longitude`: 126.9780
- `limit`: 5

**Response (200 OK)**

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
          "name": "여의도",
          "distance": 0.8
        },
        "popularity": {
          "rating": 4.8,
          "runners": 1234
        },
        "reason": "많은 사용자들이 좋아하는 경로입니다"
      }
    ]
  }
}
```

**사용 화면**: `index.tsx` (홈 탭)

---

### 8.2 사용자 맞춤 추천

```http
GET /recommendations/personalized
Authorization: Bearer {token}
```

**Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "route",
        "title": "오늘의 추천 경로",
        "description": "당신의 운동 패턴을 분석했습니다",
        "items": [...]
      },
      {
        "type": "goal",
        "title": "이번 주 목표",
        "description": "15km 달리기",
        "progress": 65,
        "items": [...]
      }
    ]
  }
}
```

**기능**: AI 기반 사용자 패턴 분석

---

## 🔒 인증 방식

모든 인증이 필요한 API는 Authorization 헤더에 JWT Bearer Token을 포함해야 합니다.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token 만료 처리 플로우

1. Access Token 만료 → `401 Unauthorized` 응답
2. Refresh Token으로 갱신 → `POST /auth/refresh`
3. 새 Access Token으로 재요청

---

## 🌐 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시할 메시지",
    "details": { ... }
  },
  "timestamp": "2026-01-23T10:00:00Z"
}
```

### 공통 HTTP 상태 코드

- `200` OK - 성공
- `201` Created - 생성 성공
- `202` Accepted - 비동기 작업 시작
- `400` Bad Request - 잘못된 요청
- `401` Unauthorized - 인증 필요
- `403` Forbidden - 권한 없음
- `404` Not Found - 리소스 없음
- `409` Conflict - 중복/충돌
- `500` Internal Server Error - 서버 오류

---

## 📊 페이지네이션

### Request Parameters

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20)

### Response Format

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 195,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 📱 구현된 화면 목록

### ✅ 인증 (2개)

- `login.tsx` - 로그인
- `signup.tsx` - 회원가입

### ✅ 메인 탭 (3개)

- `index.tsx` - 홈
- `community.tsx` - 커뮤니티
- `profile.tsx` - 프로필

### ✅ 경로 생성 (7개)

- `running-setup.tsx` - 러닝 설정
- `walking-setup.tsx` - 산책 설정
- `shape-select.tsx` - 도형 선택
- `route-select.tsx` - 저장된 경로 선택 🆕
- `generating.tsx` - 경로 생성 중
- `route-preview.tsx` - 경로 미리보기

### ✅ 운동 (3개)

- `workout.tsx` - 운동 진행
- `result.tsx` - 운동 결과
- `workout-history.tsx` - 운동 기록 🆕

### ✅ 경로 관리 (1개)

- `saved-routes.tsx` - 저장한 경로 🆕

### ✅ 설정 (3개)

- `profile-edit.tsx` - 프로필 수정 🆕
- `app-settings.tsx` - 앱 설정 🆕
- `safety-settings.tsx` - 안전 설정 🆕

### ✅ 모달/컴포넌트 (3개)

- `PostDetailModal.tsx` - 게시물 상세 🆕
- `WorkoutDetailModal.tsx` - 운동 기록 상세 🆕
- `WaypointRecommendModal.tsx` - 경유지 추천

**총 22개 화면** (신규 10개 포함)

---

## 🚀 개발 우선순위

### Phase 1: 핵심 기능 (필수)

1. ✅ 인증 API (로그인, 회원가입, 토큰 관리)
2. ✅ 경로 생성 API (비동기 처리, Task Queue)
3. ✅ 운동 추적 API (시작, 실시간 업데이트, 종료)
4. 🆕 경로 저장/조회 API
5. 🆕 운동 기록 히스토리 API

### Phase 2: 커뮤니티 (중요)

1. ✅ 피드 조회, 좋아요, 북마크
2. 🆕 게시물 상세 조회
3. 🆕 댓글 CRUD
4. 🆕 댓글 좋아요

### Phase 3: 설정 및 개인화 (보통)

1. 🆕 사용자 설정 관리
2. 🆕 긴급 연락처 관리
3. 🆕 프로필 수정
4. 🆕 계정 삭제

### Phase 4: 고도화 (선택)

1. WebSocket 실시간 추적
2. AI 추천 시스템
3. 푸시 알림
4. 음성 안내

---

## 📝 Deprecated APIs

다음 API들은 v2.0에서 더 나은 대안으로 대체되었습니다:

### `GET /users/me/workouts` ❌

→ **대체**: `GET /workouts/history`  
**이유**: 운동 기록은 User 도메인이 아닌 Workout 도메인으로 분리

### `GET /users/me/saved-routes` ❌

→ **대체**: `GET /routes/saved`  
**이유**: 경로 관리는 Route 도메인으로 분리

---

## 🔄 마이그레이션 가이드

### 운동 기록 조회 변경

**Before (v1.0)**

```typescript
const response = await fetch("/api/v1/users/me/workouts?page=1");
```

**After (v2.0)**

```typescript
const response = await fetch("/api/v1/workouts/history?page=1&type=all");
```

### 저장한 경로 조회 변경

**Before (v1.0)**

```typescript
const response = await fetch("/api/v1/users/me/saved-routes?page=1");
```

**After (v2.0)**

```typescript
const response = await fetch("/api/v1/routes/saved?page=1&sort=savedAt_desc");
```

---

## 📞 연락처

**프로젝트 관리자**: AI Project Manager  
**프론트엔드 팀**: RunnerWay Front-End Team  
**백엔드 팀**: RunnerWay Back-End Team

---

**최종 업데이트**: 2026년 1월 23일  
**문서 버전**: 2.0  
**API 버전**: v1
