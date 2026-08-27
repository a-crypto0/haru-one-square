# 테스트 보고서

- 검증일: 2026-08-27
- 범위: 기존 앱 회귀 + T029 PWA·Vercel 배포 패키지
- 방식: 프로덕션 빌드, HTTP 산출물 검사, Puppeteer Chromium 390×844 실제 동선, 서비스 워커 오프라인 재실행

## 결과 요약

- 시나리오 7개 중 통과 7개
- 남은 Critical 0건 / Important 0건 / Minor 0건
- 테스트 중 발견·수정: ER-001, ER-002
- 실제 Vercel 주소와 실제 휴대폰 설치는 계정 연결 전이라 미검증

## 시나리오별 결과

| 시나리오 | 결과 | 실제 결과 |
|---|---|---|
| TypeScript 엄격 검사 | 통과 | 오류 0건 |
| Expo 공개 설정 해석 | 통과 | SDK 57, iOS·Android·web 구성 인식 |
| 웹 프로덕션 export | 통과 | `dist`와 471KB 해시 JS 번들 생성 |
| PWA 파일 완전성 | 통과 | manifest, 서비스 워커, 오프라인 HTML, CSS, 아이콘 6종 모두 `dist` 포함 |
| 처음 설정 모바일 화면 | 통과 | HTTP 200, 제목 `하루한칸`, 문서폭 390=viewport 390, 잘린 버튼 0 |
| 처음 설정→오늘 동선 | 통과 | 4회 조작 후 오늘 카드 표시, 콘솔·페이지·요청 오류 0 |
| 서비스 워커 오프라인 재실행 | 통과 | 등록·제어 확인 후 네트워크 차단 상태에서 오늘 화면 재표시 |

## 정적·보안 점검

- `public/sw.js` JavaScript 문법 검사 통과
- PWA 아이콘 실제 크기: 48, 180, 192, 512, 512(maskable), 1024px
- `package-lock.json`에 웹 필수 의존성 3종과 Node 22.x 고정 확인
- 코드에 실제 비밀키, `innerHTML`, `dangerouslySetInnerHTML`, `any`, `@ts-ignore`, 개발용 `console.log` 없음
- `.env`, `.vercel`, `node_modules`, `dist`, 작업 캐시는 Git 제외
- `npm audit`: 높음·치명적 0건. Expo 도구 경로의 중간 수준 항목은 호환 가능한 자동 수정안 없음

## 테스트 중 수정한 결함

1. Expo CLI가 샌드박스 밖 사용자 홈에 설정 폴더를 만들려던 환경 오류
2. 390px 화면에서 좌우 padding과 폭 100%가 겹쳐 오른쪽 버튼·카드가 잘리던 레이아웃 오류

## 아직 실행하지 못한 검증

- 실제 Vercel HTTPS 주소의 응답 헤더와 Preview/Production 자동 배포
- Android Chrome과 iPhone Safari에서의 홈 화면 설치
- Android·iOS 실기기의 알림·읽어주기·사진 선택
- 서로 다른 두 기기의 Supabase 원격 지원자 공유
- 실제 당사자 사용자의 도움 없는 장기 사용성 검사

## 사용자대표 한 줄 평

"390px에서도 큰 버튼과 오늘 카드가 잘리지 않고 바로 보이며, 점수 없이 차분하게 기록할 수 있다. 실제 사용자 검증과 기기 간 공유는 출시 전에 별도로 확인해야 한다."
