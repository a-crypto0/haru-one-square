# 모듈 인덱스

확정된 기획과 디자인을 구현하기 위한 모듈 지도다. 모듈 간 연결은 아래 공개 인터페이스만 사용한다.

| 모듈 | 레이어 | 버전 | 상태 | 작업 |
|---|---|---:|---|---|
| `db-data` | db | 1.0.0 | 완료 | T001~T007 |
| `service-core` | service | 1.0.0 | 완료 | T008~T015 |
| `frontend-ui` | frontend | 1.1.0 | 완료 | T016~T029 |

## 레이어 간 연결점

- `frontend-ui` → `service-core`: `src/service/contracts.ts`의 서비스 인터페이스와 `src/service/index.ts`의 서비스 인스턴스만 사용한다.
- `service-core` → `db-data`: `src/db/types.ts`의 도메인 타입과 Supabase 클라이언트만 사용한다.
- `frontend-ui`는 Supabase SDK나 SQL 파일을 직접 참조하지 않는다.
- Supabase 환경 변수가 없으면 `service-core`의 로컬 저장 구현을 사용한다.
- `frontend-ui`의 정적 PWA 셸은 같은 출처의 `dist` 파일만 캐시하며 외부 Supabase 요청은 서비스 워커가 가로채지 않는다.

## 버전 원칙

각 모듈 문서가 진실의 원본이며 이 표는 같은 동작 안에서 동일한 버전으로 갱신한다.
