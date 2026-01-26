# 환경 변수 설정 가이드 📝

## 빠른 시작

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
EXPO_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_javascript_key_here
```

### 2. Kakao Map API 키 발급

1. [Kakao Developers](https://developers.kakao.com/) 접속 및 로그인
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. "앱 키" 탭에서 **JavaScript 키** 복사
4. "플랫폼" 탭에서 **Web 플랫폼 추가** → `http://localhost` 등록

자세한 가이드는 [KAKAO_MAP_SETUP.md](./KAKAO_MAP_SETUP.md)를 참고하세요.

### 3. 앱 실행

```bash
npm start
```

---

## 환경 변수 설명

### EXPO_PUBLIC_KAKAO_MAP_APP_KEY

Kakao Map JavaScript API를 사용하기 위한 인증 키입니다.

- **형식**: 문자열
- **필수 여부**: 필수
- **발급 위치**: [Kakao Developers](https://developers.kakao.com/)
- **사용 위치**:
  - `components/KakaoMap.tsx`
  - `components/LiveKakaoMap.tsx`

---

## 주의사항

⚠️ **보안**

- `.env` 파일은 Git에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- API 키가 노출된 경우 즉시 재발급하세요

✅ **참고**

- `.env.example` 파일은 예시로 제공되며, 실제 키는 포함하지 않습니다
- Expo의 `EXPO_PUBLIC_` 접두사가 붙은 환경 변수는 클라이언트에서 접근 가능합니다

---

## 문제 해결

### "API 키가 설정되지 않았습니다" 경고

1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수 이름이 정확한지 확인: `EXPO_PUBLIC_KAKAO_MAP_APP_KEY`
3. 개발 서버를 재시작: `Ctrl+C` 후 `npm start`

### 지도가 로드되지 않음

1. API 키가 올바른지 확인
2. Kakao Developers에서 도메인이 등록되어 있는지 확인
3. 인터넷 연결 확인

---

더 자세한 내용은 [KAKAO_MAP_SETUP.md](./KAKAO_MAP_SETUP.md)를 참고하세요.
