# service-core 모듈

- 버전: 1.0.0
- 상태: 완료
- 담당 작업: T008~T015
- 목적: 화면이 저장 방식과 무관하게 같은 계약으로 인증·할 일·기록·체중·복약·공유·알림·읽어주기를 사용하게 한다.

## 담당 파일

- `src/service/contracts.ts`
- `src/service/index.ts`
- `src/service/localStore.ts`, `localState.ts`, `localSeed.ts`
- `src/service/*Service.ts`, `taskHelpers.ts`, `taskLifecycle.ts`
- `src/service/deviceAdapters.ts`, `deviceModules.d.ts`

## 외부 연결

- 프런트엔드에는 `contracts.ts`의 함수 인터페이스와 `index.ts`의 `appServices` 단일 객체만 공개한다.
- 기본 구현은 로컬 모드이며 Expo SQLite의 `localStorage` 폴리필을 사용하고, 사용할 수 없는 환경에서는 메모리 저장소로 안전하게 대체한다.
- 로컬 상태는 날짜를 기기 현지 `YYYY-MM-DD`, 기록 시각을 UTC ISO 문자열로 저장한다.
- 알림·읽어주기는 설치된 Expo 모듈을 안전하게 호출하며, 모듈이 없거나 기기 호출이 실패해도 로컬 계약은 유지한다.
- 약 사진은 `{ownerId}/{taskId}/{safeFileName}` 비공개 접근 경로만 만들고 공개 URL은 생성하지 않는다.
- 지원자의 일정 추가·수정 권한과 `supporterCanRecord: false` 완료 기록 금지 계약을 분리한다.

## 변경 이력

- 0.1.0: 구현 전 골격 생성.
- 1.0.0: T008~T015의 엄격 타입 계약, 로컬 우선 저장, 예시 일정, 되돌리기, 변경 이력, 알림·읽어주기 어댑터 구현 완료.
