# 구동 흐름도

목적과 모듈 구성은 [기획서](./plan.md)와 [모듈 인덱스](./module-index.md)를 참조한다.

## 오늘 할 일 완료

사용자가 오늘 카드의 `했어요`를 누름 → `[frontend-ui] useTodayChecklist.complete`
→ `[service-core] recordService.complete`: `taskId + localDate + pressedAt` 전달
→ ⚠️ `localDate`는 기기 현지 날짜 `YYYY-MM-DD`, `pressedAt`은 UTC ISO 문자열로 변환
→ `[db-data] task_logs` 저장 → 화면에 체크와 `기록했어요` 표시 → 8초간 되돌리기 제공.

## 할 일 편집

사용자가 수정 항목과 `오늘만/오늘부터 계속`을 선택 → `[frontend-ui] TaskEditorForm`
→ `[service-core] taskService.update`: 변경 필드와 범위 전달
→ ⚠️ 요일은 `0(일)~6(토)` 숫자 배열, 시간은 `HH:mm` 현지시각 문자열
→ `[db-data] tasks/task_overrides` 저장 + `change_logs` 기록 → 오늘 목록 다시 조회.

## 체중 기록

사용자가 숫자를 저장 → `[frontend-ui] WeightEntryCard`
→ ⚠️ 화면 문자열을 kg 단위 소수 숫자로 검증
→ `[service-core] weightService.save` → `[db-data] weight_logs` 저장 → 최근 기록 표시.

## 약 알림과 기록

사용자가 안전 안내를 확인하고 약 알림 시간을 저장 → `[frontend-ui] MedicationFields`
→ `[service-core] medicationService.save`와 `notificationService.schedule`
→ ⚠️ 앱에는 알림 시간만 저장하며 복용량·의학 판단은 전달하지 않음
→ `[db-data] tasks/medication_details/change_logs`와 기기 알림 예약.

## 지원자 공유

당사자가 지원자를 연결 → `[frontend-ui] SupporterPanel`
→ `[service-core] sharingService.invite/update`
→ `[db-data] support_links` RLS가 당사자 1명과 지원자 1명의 범위를 확인
→ 지원자는 일정만 추가·수정하고, 완료 기록 생성은 당사자만 허용.

## PWA 설치와 오프라인 재실행

사용자가 Vercel HTTPS 주소를 처음 열음 → `[frontend-ui] public/index.html`이 서비스 워커 등록
→ `[frontend-ui] public/sw.js`가 앱 셸·manifest·아이콘을 같은 출처 캐시에 저장
→ 브라우저가 홈 화면 설치 정보를 표시 → 사용자가 설치 후 앱처럼 실행.

네트워크가 끊긴 상태에서 다시 실행 → 서비스 워커가 캐시된 HTML과 해시 번들을 반환
→ `[service-core] localStore`가 기기 브라우저 저장소의 기록을 불러옴.

⚠️ 캐시는 앱 실행 파일만 보관하며 브라우저 저장소 삭제·PWA 제거로 사라진 사용자 기록을 복구하지 않는다. 외부 Supabase 요청은 캐시 대상이 아니다.
