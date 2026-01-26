# Kakao Map API 설정 가이드

RunnerWay 프로젝트에서 Kakao Map API를 사용하기 위한 설정 가이드입니다.

## 📋 목차

1. [Kakao Developers 계정 생성](#1-kakao-developers-계정-생성)
2. [애플리케이션 등록](#2-애플리케이션-등록)
3. [JavaScript 키 발급](#3-javascript-키-발급)
4. [플랫폼 설정](#4-플랫폼-설정)
5. [프로젝트에 API 키 적용](#5-프로젝트에-api-키-적용)
6. [테스트](#6-테스트)

---

## 1. Kakao Developers 계정 생성

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인 (없으면 회원가입)

---

## 2. 애플리케이션 등록

1. 로그인 후 우측 상단의 **"내 애플리케이션"** 클릭
2. **"애플리케이션 추가하기"** 버튼 클릭
3. 앱 정보 입력:
   - **앱 이름**: RunnerWay (또는 원하는 이름)
   - **사업자명**: 개인 또는 회사명
4. **저장** 클릭

---

## 3. JavaScript 키 발급

1. 등록한 애플리케이션 선택
2. 좌측 메뉴에서 **"앱 키"** 탭 클릭
3. **"JavaScript 키"** 항목의 키 값 복사
   ```
   예시: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

> ⚠️ **주의**: 이 키는 외부에 노출되지 않도록 주의하세요!

---

## 4. 플랫폼 설정

### 4.1 Web 플랫폼 추가

1. 좌측 메뉴에서 **"플랫폼"** 탭 클릭
2. **"Web 플랫폼 추가"** 버튼 클릭
3. 사이트 도메인 등록:

   **개발 환경**:

   ```
   http://localhost
   http://localhost:8081
   http://127.0.0.1
   ```

   **배포 환경** (나중에 추가):

   ```
   https://your-domain.com
   ```

4. **저장** 클릭

---

## 5. 프로젝트에 API 키 적용

### 환경 변수 사용 (권장)

보안을 위해 환경 변수를 사용하는 것을 권장합니다.

#### Step 1: .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```env
EXPO_PUBLIC_KAKAO_MAP_APP_KEY=여기에_복사한_JavaScript_키_붙여넣기
```

#### Step 2: .gitignore 확인

`.gitignore` 파일에 이미 `.env`가 포함되어 있는지 확인:

```
.env
```

#### Step 3: 앱 재시작

환경 변수를 적용하려면 개발 서버를 재시작해야 합니다:

```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
npm start
```

### 직접 입력 방법 (비권장)

테스트 목적으로만 사용하세요. `constants/config.ts` 파일에서:

```typescript
export const KAKAO_MAP_CONFIG = {
  APP_KEY: "여기에_복사한_JavaScript_키_붙여넣기",
  // ...
};
```

> ⚠️ **주의**: 이 방법은 보안에 취약하므로 프로덕션에서는 사용하지 마세요!

---

## 6. 테스트

### 6.1 앱 실행

```bash
npm start
# 또는
npx expo start
```

### 6.2 확인 사항

✅ 지도가 정상적으로 로드되는지 확인

- route-preview.tsx (경로 미리보기)
- workout.tsx (운동 실행 중)
- result.tsx (운동 결과)
- PostDetailModal (커뮤니티 게시물 상세)
- WorkoutDetailModal (운동 기록 상세)

### 6.3 문제 해결

#### 지도가 로드되지 않는 경우:

1. **API 키 확인**

   - `constants/config.ts`에 올바른 키가 입력되었는지 확인
   - 공백이나 특수문자가 포함되지 않았는지 확인

2. **도메인 설정 확인**

   - Kakao Developers에서 플랫폼 설정 확인
   - http://localhost가 등록되어 있는지 확인

3. **WebView 권한 확인**

   - 인터넷 연결 확인
   - WebView JavaScript 실행 권한 확인

4. **콘솔 로그 확인**

   - React Native 디버거에서 경고 메시지 확인
   - "⚠️ Kakao Map API 키가 설정되지 않았습니다" 메시지가 보이면 .env 파일 확인

5. **환경 변수 적용 확인**
   ```bash
   # 개발 서버를 완전히 재시작
   # Ctrl+C로 중지 후 다시 시작
   npm start
   ```

---

## 📚 추가 자료

- [Kakao Maps JavaScript API 문서](https://apis.map.kakao.com/web/)
- [Kakao Developers 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/app)
- [React Native WebView 문서](https://github.com/react-native-webview/react-native-webview)

---

## 🔒 보안 주의사항

1. **API 키 노출 방지**

   - `.env` 파일을 Git에 커밋하지 마세요
   - 공개 저장소에 업로드하지 마세요
   - 스크린샷 공유 시 키가 보이지 않도록 주의하세요

2. **키 재발급**

   - 키가 노출된 경우 즉시 Kakao Developers에서 키를 재발급하세요

3. **도메인 제한**
   - 플랫폼 설정에서 허용된 도메인만 등록하세요
   - 와일드카드(\*) 사용을 피하세요

---

## 📞 문의

문제가 계속되면 다음을 확인하세요:

- [Kakao Developers 고객센터](https://devtalk.kakao.com/)
- 프로젝트 Issue 페이지

---

**마지막 업데이트**: 2026-01-26
