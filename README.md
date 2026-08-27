# 하루한칸

성인 발달장애인이 운동, 양치, 머리 감기, 약 복용, 체중 같은 생활 기록을 직접 만들고 체크하는 모바일 우선 앱입니다. 따뜻한 파스텔과 둥근 카드를 사용하되 캐릭터·점수·순위 없이 성인 사용자를 존중하는 디자인을 적용했습니다.

## 바로 배포할 수 있는 상태

이 저장소에는 Expo 웹 빌드, 설치형 PWA, 오프라인 재실행, Vercel SPA 라우팅 설정이 모두 포함되어 있습니다.

- Vercel 설정: `vercel.json`
- PWA manifest·서비스 워커: `public/`
- 192px·512px·maskable·Apple 아이콘 포함
- 고정된 npm 잠금 파일: `package-lock.json`
- Vercel용 Node.js 버전: 22.x

명령어 없이 GitHub와 Vercel 화면만 사용하려면 [DEPLOYMENT.md](DEPLOYMENT.md)를 따라 진행하면 됩니다.

## 주요 기능

- 쉬운 모드와 일반 모드
- 오늘 할 일 확인·완료·되돌리기
- 할 일 추가·수정·삭제·순서 변경
- 반복 일정의 `오늘만 / 오늘부터 계속` 구분
- 약 표시 이름·알림 시간·복용 상태와 안전 안내
- 체중 입력과 최근 기록
- 주간·월간 생활 기록표
- 지원자 1명 연결·공유 범위·변경 내역의 로컬 시연
- 라이트·다크 모드와 모바일·태블릿·PC 대응

용돈, 성장 정원, 점수, 순위, 연속 기록, 복용량 판단은 포함하지 않습니다.

## PWA 사용

Vercel 배포 주소를 휴대폰으로 연 뒤 홈 화면에 추가하면 일반 앱처럼 실행할 수 있습니다.

- Android Chrome: 브라우저 메뉴 → `앱 설치` 또는 `홈 화면에 추가`
- iPhone Safari: 공유 버튼 → `홈 화면에 추가`

한 번 온라인으로 연 뒤에는 서비스 워커가 앱 화면을 보관해 네트워크가 끊겨도 다시 열 수 있습니다.

## 현재 데이터 범위

현재 앱은 각 기기의 브라우저 저장소를 사용합니다. 같은 휴대폰에서는 기록이 유지되지만 브라우저 데이터 삭제, PWA 제거, 시크릿 모드 사용 시 기록이 사라질 수 있습니다.

Supabase 스키마와 RLS는 준비되어 있지만 실제 기기 간 지원자 공유 어댑터는 아직 연결되지 않았습니다. `.env` 값만 입력해도 자동으로 공유가 활성화되지는 않습니다.

## 개발자 확인 방법

필수 환경은 Node.js 22.x입니다.

```bash
npm ci
npm run verify
npm run preview:web
```

개발 서버는 `npm run web`, Android 개발 서버는 `npm run android`로 실행합니다.

## 보안

- `.env`와 Vercel 로컬 설정은 Git에서 제외됩니다.
- 브라우저 앱에는 Supabase `service_role` 키를 절대로 넣지 않습니다.
- 공개 가능한 클라이언트 키만 `EXPO_PUBLIC_` 환경 변수로 사용합니다.
- 약 사진용 Supabase Storage 정책은 비공개 경로를 전제로 설계되어 있습니다.

검증 결과는 [docs/test-report.md](docs/test-report.md), 배포 전 한계는 [docs/review-notes.md](docs/review-notes.md)에 기록되어 있습니다.
