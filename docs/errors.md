# 오류 기록

## [ER-001] 2026-08-27 08:44

- 발생 모듈: `frontend-ui` 빌드 환경 (v1.0.0 → v1.1.0)
- 발생 경로: 코딩 중
- 재현 절차: 샌드박스에서 `expo install` 실행 시 즉시
- 오류 코드: `EPERM: operation not permitted, mkdir C:\Users\민경배\.expo`
- 발생 원인: Expo CLI가 쓰기 허용 범위 밖의 사용자 홈에 설정 폴더를 만들려고 했다.
- 원인 범주: 환경(외부)
- 조치 사항: 검증 명령에서 Expo 설정 홈을 프로젝트의 `work/expo-home`으로 격리했다.
- 상태: 완치
- 영향 모듈: 없음
- 참고: 없음
- 예방 메모: 제한된 작업 환경에서는 Expo CLI 실행 전에 쓰기 가능한 설정 홈을 지정한다.

## [ER-002] 2026-08-27 09:01

- 발생 모듈: `frontend-ui` (v1.0.0 → v1.1.0)
- 발생 경로: 테스트 중
- 재현 절차: 390px 모바일 화면에서 처음 설정과 오늘 화면을 연다.
- 오류 코드: 없음
- 발생 원인: 바깥 컨테이너의 좌우 padding과 안쪽 `width: 100%`가 웹에서 함께 계산되어 오른쪽 여백만큼 내용이 화면 밖으로 밀렸다.
- 원인 범주: 코드
- 조치 사항: `SetupScreen.tsx`, `AppShell.tsx`에서 padding을 폭 100% 안쪽 컨테이너로 이동했다.
- 상태: 완치
- 영향 모듈: 없음
- 참고: 없음
- 예방 메모: React Native Web의 폭 100% 컨테이너는 모바일 실제 viewport에서 `documentWidth === viewportWidth`를 확인한다.
