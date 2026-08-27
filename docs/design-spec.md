# 디자인명세

작성일: 2026-08-26  
상태: 최종 확정  
디자인 출처: 직접 설계(B경로) — 사용자 첨부 이미지의 시각 분위기만 참고  
원본: `docs/plan.md`

## 1. 디자인 목표

성인 발달장애인이 설명 없이도 `오늘 할 일 확인 → 직접 체크 → 필요하면 수정 → 지난 기록 확인`을 수행할 수 있게 한다.

첨부 이미지에서는 따뜻한 바탕, 굵은 제목, 둥근 카드, 저채도 파스텔, 정돈된 격자만 차용한다. 이미지 안의 문구·기능·점수·연속 달성·완료율은 구현 요구로 해석하지 않는다.

### UX 원칙

1. **성인으로 존중한다:** 아기 동물, 과장된 칭찬, 불꽃, 별점, 반말을 쓰지 않는다.
2. **한 번에 한 결정:** 쉬운 모드의 입력은 한 화면에 질문 하나만 보여준다.
3. **사용자가 주인이다:** 지원자가 만든 일정도 작성자를 표시하고 당사자가 시간 변경·숨김·도움 요청을 할 수 있다.
4. **실수는 되돌릴 수 있다:** 반복 범위, 약 관련 변경, 삭제, 공유 중단은 확인하고 저장 뒤 되돌리기를 제공한다.
5. **빈칸은 실패가 아니다:** `완료 / 기록 없음 / 예정 없음`을 색뿐 아니라 모양과 글자로 함께 표시한다.

## 2. 디자인 시스템

### 2.1 색상 토큰

주색은 세이지, 보조색은 라벤더다. 스카이와 버터는 정보·주의 상태용으로만 사용한다. 아래 값은 토큰 정의에서만 사용하고 화면 부품은 토큰 이름만 참조한다.

#### 라이트 모드

| 토큰 | 값 | 용도 |
|---|---:|---|
| `color-bg` | `#FAF8F3` | 따뜻한 아이보리 앱 배경 |
| `color-surface` | `#FFFFFF` | 카드·입력 영역 |
| `color-surface-soft` | `#F4F1EB` | 비활성·보조 영역 |
| `color-text` | `#292B29` | 기본 차콜 글자 |
| `color-text-muted` | `#686B67` | 보조 문구 |
| `color-border` | `#DEDAD2` | 카드·입력 테두리 |
| `color-primary` | `#587864` | 세이지 주요 행동 |
| `color-primary-soft` | `#E2EEE5` | 세이지 카드 띠·완료 배경 |
| `color-secondary` | `#7C6A9A` | 라벤더 보조 행동 |
| `color-secondary-soft` | `#EEE9F6` | 라벤더 선택 배경 |
| `color-info` | `#4F7695` | 정보 표시 |
| `color-info-soft` | `#E4F0F7` | 스카이 정보 배경 |
| `color-warning` | `#8A691F` | 주의 표시 |
| `color-warning-soft` | `#FFF1C8` | 버터 주의 배경 |
| `color-success` | `#3F7652` | 완료 체크 |
| `color-success-soft` | `#E0F1E5` | 완료 칸 |
| `color-error` | `#9A4545` | 실제 저장·연결 오류만 |
| `color-error-soft` | `#F8E3E2` | 오류 안내 배경 |
| `color-focus` | `#315F7C` | 키보드·보조기기 초점선 |

#### 다크 모드

| 토큰 | 값 | 용도 |
|---|---:|---|
| `color-bg` | `#1D211E` | 앱 배경 |
| `color-surface` | `#292E2A` | 카드·입력 영역 |
| `color-surface-soft` | `#343A35` | 비활성·보조 영역 |
| `color-text` | `#F5F2EA` | 기본 글자 |
| `color-text-muted` | `#C8C4B9` | 보조 문구 |
| `color-border` | `#485049` | 카드·입력 테두리 |
| `color-primary` | `#A4C7AE` | 세이지 주요 행동 |
| `color-primary-soft` | `#30443A` | 세이지 카드 띠·완료 배경 |
| `color-secondary` | `#C0AEDB` | 라벤더 보조 행동 |
| `color-secondary-soft` | `#403750` | 라벤더 선택 배경 |
| `color-info` | `#9DC5E0` | 정보 표시 |
| `color-info-soft` | `#2C4352` | 스카이 정보 배경 |
| `color-warning` | `#E1C473` | 주의 표시 |
| `color-warning-soft` | `#50441F` | 버터 주의 배경 |
| `color-success` | `#9CCBAB` | 완료 체크 |
| `color-success-soft` | `#294437` | 완료 칸 |
| `color-error` | `#F0A4A2` | 실제 오류 |
| `color-error-soft` | `#522F30` | 오류 안내 배경 |
| `color-focus` | `#9DCEF0` | 키보드·보조기기 초점선 |

기본값은 시스템 설정을 따르고, S009 설정에서 `시스템 / 밝게 / 어둡게`를 직접 선택할 수 있다.

### 2.2 글꼴·크기

- 글꼴: `Pretendard` 우선, 기기 한국어 시스템 고딕 대체
- 큰 제목: 28/36, 700
- 화면 제목: 24/32, 700
- 구역 제목: 20/28, 600
- 일반 모드 본문: 16/24, 500
- 쉬운 모드 본문: 19/30, 600
- 보조 문구: 14/22, 500(쉬운 모드 16/24)
- 숫자 입력: 32/40, 700, 고정폭 숫자 사용
- 핵심 안내는 한 문장 20자 안팎, 한 문장에 행동 하나만 쓴다.

### 2.3 간격·모서리·그림자

- 간격: 4, 8, 16, 24, 32의 8px 계열
- 카드 안쪽 여백: 일반 16, 쉬운 모드 20
- 카드 간격: 12~16
- 카드 모서리: 20
- 입력칸·버튼 모서리: 16
- 상태 칩 모서리: 999
- 카드 그림자: 1단계만 사용(얕고 넓은 그림자), 중첩 카드에는 그림자 금지
- 주요 버튼 높이: 일반 48 이상, 쉬운 모드 56 이상
- 모든 터치 영역: 최소 44×44, 권장 48×48

### 2.4 아이콘·이미지·움직임

- 아이콘은 둥근 선형 스타일 한 종류만 사용하고 반드시 짧은 글자와 함께 둔다.
- 할 일 색은 세이지·라벤더·스카이·버터의 연한 배경 토큰 중 선택한다. 핵심 의미를 색으로만 전달하지 않는다.
- 약 사진은 64×64 이상, 모서리 16, 대체 글자 `등록한 약 사진`을 제공한다.
- 화면당 장식 일러스트는 최대 1개이며 핵심 행동보다 먼저 보이지 않는다.
- 화면 전환 180ms, 체크 피드백 160ms. 흔들기·폭죽·자동 재생 없음.
- 기기의 `움직임 줄이기` 설정을 따르면 상태가 즉시 바뀌고 애니메이션을 생략한다.

### 2.5 앱 셸·반응형

- 모바일(~767): 한 열, 고정 하단 메뉴 `오늘 / 기록 / 함께 / 설정`, 저장 버튼은 안전영역 위에 고정
- 태블릿(768~1023): 72px 왼쪽 메뉴, 중심 콘텐츠 최대 720px, 기록 화면은 할 일 목록과 격자를 나란히 배치
- PC(1024~): 240px 왼쪽 메뉴, 콘텐츠 최대 1120px, `함께 관리`는 일정과 변경 내역을 2열로 표시
- 모든 크기에서 정보·문구·기능 순서를 유지한다. 작은 격자는 확대가 아니라 가로 스크롤 또는 할 일 한 개 보기로 전환한다.

## 3. 쉬운 모드와 일반 모드

기능과 저장 데이터는 같고 밀도와 입력 방식만 다르다.

| 영역 | 쉬운 모드 | 일반 모드 |
|---|---|---|
| 오늘 | 시간대별 큰 카드, 한 카드 한 행동 | 시간순 목록과 작은 보조정보 |
| 글자·버튼 | 본문 19px, 주요 버튼 56px | 본문 16px, 주요 버튼 48px 이상 |
| 할 일 편집 | 이름→아이콘→시간→반복→확인 단계 | 모든 입력을 한 스크롤에 표시 |
| 순서 변경 | `위로 / 아래로` 버튼 | 이동 손잡이 + 위/아래 대체 버튼 |
| 주간 기록 | 선택한 할 일 한 개의 큰 7칸 | 여러 할 일을 행으로 표시 |
| 월간 기록 | 선택한 할 일 달력 한 개 | 할 일별 작은 달력 카드를 세로 표시 |
| 변경 내역 | 쉬운 문장 카드 | 변경 전후를 한 행에 표시 |
| 읽어주기 | 상단에 `읽어주기` 글자 버튼 항상 표시 | 상단 도구 영역에 아이콘+글자 |

## 4. 화면 흐름

| ID | 화면 | 경로 | 설명 | 진입 조건 | 표시 기능 | 이동 |
|---|---|---|---|---|---|---|
| S001 | 처음 설정 | `/setup` | 계정, 표시 모드, 읽어주기를 최소 단계로 정한다. | 첫 실행 | F006, F007, F009 | 완료→S002, 지원자 연결은 나중에 S007 |
| S002 | 오늘 | `/today` | 오늘 할 일을 직접 체크하고 새 할 일을 만든다. | 로그인 | F001, F002, F004, F007, F009 | S003, S004, S005, S006, S007, S009 |
| S003 | 내 할 일 | `/tasks` | 할 일 순서와 반복 일정을 관리한다. | 로그인 | F001, F004, F007, F008, F009 | S004, S002 |
| S004 | 할 일 추가·수정 | `/tasks/:taskId?` | 일반·복약 할 일을 한 단계 또는 한 화면에서 편집한다. | 로그인 | F001, F004, F007, F008, F009 | 저장→S002/S003, 변경이력→S008 |
| S005 | 체중 기록 | `/weight/new` | 수치와 기록 시각만 중립적으로 저장한다. | 로그인 | F003, F007, F009 | 저장→S006, 취소→이전 화면 |
| S006 | 내 기록 | `/records` | 주간·월간 격자와 최근 체중 기록을 확인한다. | 로그인 | F003, F005, F007, F009 | S005, 하단 메뉴 |
| S007 | 함께 관리 | `/together` | 지원자 1명과 공유 범위·일정을 확인한다. | 로그인 | F006, F007, F008, F009 | S003, S008, 공유중단 |
| S008 | 변경 내역 | `/history` | 누가 무엇을 언제 바꿨는지 쉬운 문장으로 본다. | 로그인 | F006, F008, F009 | S004, S007 |
| S009 | 사용 설정 | `/settings` | 모드, 읽어주기, 테마, 공유 통제를 바꾼다. | 로그인 | F007, F008, F009 | S001 일부 설정, S007 |

### 핵심 동선

```text
S001 처음 설정
        ↓
S002 오늘 ── 새 할 일/카드 본문 ──▶ S004 할 일 추가·수정
   │                 ▲
   ├─ 할 일 관리 ─▶ S003 내 할 일 ─┘
   ├─ 체중 기록 ─▶ S005 ─▶ S006 내 기록
   ├─ 함께 ──────▶ S007 ─▶ S008 변경 내역
   └─ 설정 ──────▶ S009
```

## 5. 텍스트 와이어프레임

### S001 처음 설정 — 쉬운 모드

```text
[2 / 3]

화면을 어떻게 볼까요?                       [읽어주기]

[  쉬운 모드  ]
큰 글자와 큰 버튼으로 한 가지씩 보여줘요.

[  일반 모드  ]
여러 내용을 한눈에 보여줘요.

                                      [다음]
```

1단계 계정, 2단계 표시 모드, 3단계 읽어주기 순서로 진행한다. 완료 화면에는 `[지원자 연결하기] [나중에]`를 함께 보여주며, 연결하기를 누르면 S007로 이동한다. 지원자 연결을 건너뛰어도 앱을 사용할 수 있다.

### S002 오늘

```text
8월 26일 수요일                         [읽어주기]

오늘 할 일                              [할 일 관리]

┌──────────────────────────────────┐
│ 08:00  [약 사진] 아침 약          │
│         지원자가 추가했어요 · 내가 수정할 수 있어요 │
│ [수정]                              │
│ [먹었어요]                    │
│ [나중에]          [도움 필요]      │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 09:30  [걷기] 산책하기             │
│         화·목·토                   │
│ [수정]                         [했어요] │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 20:00  [칫솔] 양치하기             │
│ [수정]                         [했어요] │
└──────────────────────────────────┘

[ + 새 할 일 ]

[오늘]            [기록]            [함께]            [설정]
```

카드 본문은 정보를 읽는 영역으로 두고, `수정`과 완료 관련 버튼을 각각 명시한다. 두 행동 사이에 12px 이상의 간격과 구분선을 둔다. 완료 뒤 카드는 파스텔 배경+체크+`기록했어요`로 바뀌고 하단에 `되돌리기`가 8초 동안 표시된다.

### S003 내 할 일

```text
[뒤로]  내 할 일                         [읽어주기]
[ + 새 할 일 ]

[위로][아래로]  산책하기   화·목·토        [수정]
[위로][아래로]  양치하기   매일             [수정]
[위로][아래로]  아침 약    매일 08:00       [수정]
                              지원자가 추가
```

쉬운 모드는 위로·아래로, 일반 모드는 이동 손잡이와 위로·아래로 대체 조작을 함께 제공한다.

### S004 할 일 추가·수정

```text
[뒤로]  할 일 바꾸기                     [읽어주기]

이름      [ 양치하기                         ]
그림      [칫솔] [걷기] [샤워] [약] [더 보기]
색        [세이지✓] [라벤더] [스카이] [버터]
시간      [20:00]
반복      [월][화][수][목][금][토][일]
알림      [켜짐]

약 복용을 고르면:
약 사진   [사진 추가/바꾸기]
[안내] 앱의 알림만 바뀌어요.
       복용 방법은 의사·약사의 안내를 따라요.

                                      [저장]
──────────────────────────────────────────
[이 할 일 삭제]
```

반복 중인 할 일을 수정하면 저장 전에 `오늘만 바꿀까요? / 오늘부터 계속 바꿀까요?`를 묻는다. 약 관련 변경·삭제는 약 이름을 포함한 안전 확인을 한 번 더 거친다.

- 새 할 일: 쉬운 모드는 `이름→그림·색→시간→반복·알림→확인` 단계로 진행한다.
- 기존 할 일: 먼저 `무엇을 바꿀까요?`에서 `이름·그림 / 시간 / 반복 요일 / 알림 / 색` 중 하나를 고르고 해당 항목만 연다.
- 시간·반복 변경: 값을 고치기 전에 `오늘만 / 오늘부터 계속`을 선택한다.
- 약 시간 변경: `약 알림 시간`이라고 명확히 쓰고, 반복 범위·새 시간·안전 안내를 한 확인 화면에 합친다. 저장 뒤 `지원자에게도 변경 내용이 보여요`를 알린다.

### S005 체중 기록

```text
[뒤로]  체중 기록                       [읽어주기]

오늘 몸무게를 적어 주세요

              [  63.2  ] kg

지난 기록  62.9kg · 8월 19일

                                      [저장]
```

증감 화살표, 목표, 칭찬, 경고, 색 평가를 표시하지 않는다.

### S006 내 기록

```text
내 기록                                [읽어주기]
[주간] [월간]

[이전 주]       8월 24일~8월 30일       [다음 주]

          월  화  수  목  금  토  일
산책       ✓   ○   ✓   —   ✓   ○   —
양치       ✓   ✓   ✓   ✓   ○   ○   ○
아침 약    ✓   ✓   ✓   ✓   ✓   ✓   ○

✓ 완료   ○ 기록 없음   — 예정 없음

[체중 기록]
최근 기록 63.2kg · 오늘                  [+ 기록]
```

월간은 할 일별 작은 달력 카드를 세로로 배치한다. 완료율·연속 일수·순위는 표시하지 않는다.

### S007 함께 관리

```text
함께 관리                              [읽어주기]

지원자 1명
[김○○] 연결되어 있어요

공유하는 내용
✓ 일정 보기·추가·수정
✓ 생활 체크 보기
○ 체중 보기
✓ 약 일정 보기

[공유 일정 보기]   [변경 내역 보기]

──────────────────────────────────────────
[지원자 연결 끊기]
```

연결 전에는 설명 한 문장과 `지원자 초대하기`만 표시한다. 연결 끊기는 일상 버튼과 떨어뜨리고 결과를 미리 설명한다.

### S008 변경 내역

```text
[뒤로]  변경 내역                       [읽어주기]

오늘
김○○ 지원자가
‘아침 약’ 시간을 08:30에서 08:00으로 바꿨어요.
오전 10:12

내가
‘산책하기’ 반복 요일을 바꿨어요.
어제 오후 7:40
```

행위자·대상·전후값·시간을 한 문장으로 표시한다. 기술 용어나 JSON 값은 노출하지 않는다.

### S009 사용 설정

```text
사용 설정

화면 보기
(●) 쉬운 모드  큰 글자와 큰 버튼으로 보여줘요.
( ) 일반 모드  여러 기록을 한눈에 보여줘요.

읽어주기
[켜짐] 화면 제목과 선택한 내용을 읽어줘요.

화면 밝기
[시스템✓] [밝게] [어둡게]
```

## 6. 컴포넌트 명세

아래 모든 색상은 2장의 토큰 세트만 참조한다. 반응형 공통 원칙은 모바일 한 열, 태블릿·PC에서 지정된 최대 폭과 열 배치를 적용하는 것이다.

### C001 AppShell

- 파일: `src/frontend/components/layout/AppShell.tsx`
- 화면: 전체 / 관련 작업: T018 / 기능: F007
- Props: `mode`, `theme`, `activeRoute`, `children`
- State: `isNavigationOpen`
- 상태: loading `콘텐츠 자리표시자`; error `화면을 열지 못했어요`; empty `셸과 빈 콘텐츠`; success `상단·메뉴·콘텐츠`
- Handler: `handleNavigate`, `handleMenuToggle`
- 시각: `color-bg`, 모바일 하단 메뉴, 태블릿·PC 왼쪽 메뉴
- 의존: C003

### C002 ScreenHeader

- 파일: `src/frontend/components/layout/ScreenHeader.tsx`
- 화면: 전체 / 관련 작업: T018, T027 / 기능: F007, F009
- Props: `title`, `backLabel?`, `onBack?`, `readText?`
- State: `isSpeaking`
- 상태: loading `제목 자리표시자`; error `제목을 표시하지 못했어요`; empty `뒤로가기만 표시`; success `제목+읽어주기`
- Handler: `handleBack`, `handleReadAloud`
- 시각: 화면 제목과 C017을 같은 줄에 두되 터치 영역을 분리
- 의존: C017

### C003 BottomNav

- 파일: `src/frontend/components/navigation/BottomNav.tsx`
- 화면: S002, S006, S007, S009 / 관련 작업: T018 / 기능: F005, F006, F007
- Props: `activeRoute`, `items`, `onNavigate`
- State: 없음
- 상태: loading `메뉴 자리표시자`; error `메뉴를 열지 못했어요`; empty `오늘 메뉴만 표시`; success `4개 메뉴`
- Handler: `handleSelect`
- 시각: 아이콘+글자, 선택은 색+윗선+굵은 글자
- 반응형: 모바일 하단 / 태블릿·PC 왼쪽 메뉴로 변환

### C004 TaskCard

- 파일: `src/frontend/components/tasks/TaskCard.tsx`
- 화면: S002, S003 / 관련 작업: T020 / 기능: F001, F002, F004, F006
- Props: `task`, `status`, `creatorLabel`, `onEdit`, `onComplete`, `onDelay`, `onHelp`
- State: `isSaving`
- 상태: loading `할 일을 불러오는 중이에요`; error `이 할 일을 불러오지 못했어요`; empty `표시할 할 일이 없어요`; success `시간+아이콘+이름+작성자+C005`
- Handler: `handleEdit`, `handleComplete`, `handleDelay`, `handleHelp`
- 시각: 카드 본문은 읽기 전용, `수정`과 완료 버튼 사이 구분선·12px 간격, 약 카드는 사진을 추가하되 색만으로 구분하지 않음
- 반응형: 쉬운 모드·모바일의 약 카드에서는 `먹었다고 기록`을 전체 너비의 첫 번째 행동으로 두고, `나중에`와 `도움 필요`를 다음 줄에 배치한다. `수정`은 카드 상단의 독립된 48px 터치 영역으로 둔다. 일반 모드의 넓은 화면에서만 보조 행동을 한 줄로 압축할 수 있다.
- 의존: C005

### C005 CompletionControl

- 파일: `src/frontend/components/tasks/CompletionControl.tsx`
- 화면: S002, S006 / 관련 작업: T020, T025 / 기능: F002, F004, F005
- Props: `kind`, `status`, `onComplete`, `onDelay?`, `onHelp?`, `onUndo`
- State: `isSubmitting`
- 상태: loading `기록하는 중이에요`; error `기록하지 못했어요. 다시 눌러 주세요`; empty `선택 전`; success `했어요/먹었다고 기록/나중에/도움 필요`
- Handler: 상태별 명시 버튼, `handleUndo`
- 시각: 완료는 체크+문구+파스텔 채움, 미완료는 빈 원+문구
- 행동 우선순위: `먹었다고 기록`이 유일한 강조 버튼이다. `나중에`와 `도움 필요`는 중립 외곽선 버튼으로 구분한다.

### C006 TaskList

- 파일: `src/frontend/components/tasks/TaskList.tsx`
- 화면: S002, S003 / 관련 작업: T020, T021 / 기능: F001, F002
- Props: `tasks`, `mode`, `onReorder`, `onAdd`, `onEdit`
- State: `pendingOrder`
- 상태: loading `할 일을 불러오는 중이에요`; error `할 일을 불러오지 못했어요`; empty `아직 할 일이 없어요`+`새 할 일`; success `C004 목록`
- Handler: `handleMoveUp`, `handleMoveDown`, `handleDragEnd`
- 시각: 쉬운 모드는 큰 카드, 일반 모드는 조밀한 행
- 의존: C004

### C007 TaskEditorForm

- 파일: `src/frontend/components/tasks/TaskEditorForm.tsx`
- 화면: S004 / 관련 작업: T021, T022 / 기능: F001, F004, F007, F008
- Props: `initialTask?`, `mode`, `onSave`, `onDelete`, `onCancel`
- State: `draft`, `step`, `errors`, `saveScope`, `isDirty`
- 상태: loading `할 일을 준비하는 중이에요`; error `저장하지 못했어요. 적은 내용은 그대로 있어요`; empty `새 할 일 기본값`; success `쉬운 모드 단계/일반 모드 전체 입력`
- Handler: `handleEditFieldSelect`, `handleNext`, `handleBack`, `handleSave`, `handleDelete`, `handleScopeSelect`
- 시각: 삭제는 화면 맨 아래, 저장 버튼과 32px 이상 분리
- 의존: C008, C009, C010, C014

### C008 IconColorPicker

- 파일: `src/frontend/components/tasks/IconColorPicker.tsx`
- 화면: S004 / 관련 작업: T021 / 기능: F001
- Props: `icon`, `colorToken`, `options`, `onChange`
- State: `expanded`
- 상태: loading `선택지를 불러오는 중이에요`; error `그림을 불러오지 못했어요`; empty `그림을 골라 주세요`; success `아이콘+이름 선택 목록`
- Handler: `handleIconSelect`, `handleColorSelect`
- 시각: 선택은 테두리+체크+글자, 이모지 단독 금지

### C009 ScheduleFieldGroup

- 파일: `src/frontend/components/tasks/ScheduleFieldGroup.tsx`
- 화면: S004 / 관련 작업: T021, T022 / 기능: F001, F004
- Props: `time`, `repeatDays`, `reminderEnabled`, `onChange`
- State: `timePickerOpen`
- 상태: loading `일정을 불러오는 중이에요`; error `일정을 표시하지 못했어요`; empty `시간 없음·반복 없음`; success `시간+요일+알림`
- Handler: `handleTimeChange`, `handleDayToggle`, `handleReminderToggle`
- 시각: 요일은 48px 이상 선택칸, 선택은 채움+체크

### C010 MedicationFields

- 파일: `src/frontend/components/medication/MedicationFields.tsx`
- 화면: S002, S004 / 관련 작업: T024 / 기능: F004, F008
- Props: `photoUri?`, `displayName`, `isEditingExisting`, `onPhotoChange`, `onConfirmSafety`
- State: `isPickingPhoto`, `safetyConfirmed`
- 상태: loading `약 사진을 준비하는 중이에요`; error `사진을 불러오지 못했어요`; empty `약 사진을 추가해 주세요`; success `사진+이름+안전 안내`
- Handler: `handlePickPhoto`, `handleRemovePhoto`, `handleSafetyConfirm`
- 시각: `color-warning-soft` 안내 카드, 복용량 입력 없음

### C011 WeightEntryCard

- 파일: `src/frontend/components/weight/WeightEntryCard.tsx`
- 화면: S005, S006 / 관련 작업: T023 / 기능: F003
- Props: `value`, `previousRecord?`, `onChange`, `onSave`
- State: `input`, `validationError`
- 상태: loading `지난 기록을 불러오는 중이에요`; error `저장하지 못했어요`; empty `숫자 입력 전`; success `값+단위+지난 기록`
- Handler: `handleDigit`, `handleDecimal`, `handleSave`
- 시각: 큰 숫자, 증감 색·목표·평가 없음

### C012 PeriodHabitGrid

- 파일: `src/frontend/components/records/PeriodHabitGrid.tsx`
- 화면: S006 / 관련 작업: T025 / 기능: F005, F007
- Props: `period`, `visibleRange`, `tasks`, `records`, `selectedTaskId?`, `onPeriodChange`, `onRangeChange`, `onTaskSelect`
- State: `activePeriod`, `visibleRange`, `focusedCell`
- 상태: loading `기록을 불러오는 중이에요`; error `기록을 불러오지 못했어요`; empty `아직 보여줄 기록이 없어요`; success `격자+범례`
- Handler: `handlePeriodChange`, `handlePreviousRange`, `handleNextRange`, `handleCellFocus`, `handleTaskSelect`
- 시각: 완료 `✓`, 기록 없음 `○`, 예정 없음 `—`; 색+형태+범례
- 반응형: 모바일 쉬운 모드 한 할 일 / 일반 모드 가로 스크롤 / 태블릿·PC 전체 격자

### C013 SupporterPanel

- 파일: `src/frontend/components/support/SupporterPanel.tsx`
- 화면: S007 / 관련 작업: T026 / 기능: F006, F008
- Props: `supporter?`, `permissions`, `onInvite`, `onPermissionChange`, `onDisconnect`
- State: `confirmingDisconnect`
- 상태: loading `연결 정보를 불러오는 중이에요`; error `연결 정보를 불러오지 못했어요`; empty `연결된 지원자가 없어요`+`지원자 초대하기`; success `지원자+공유 범위`
- Handler: `handleInvite`, `handlePermissionChange`, `handleDisconnect`
- 시각: 공유함/안 함을 체크+문구로 표시, 연결 끊기는 맨 아래

### C014 ChangeHistoryList

- 파일: `src/frontend/components/support/ChangeHistoryList.tsx`
- 화면: S008 / 관련 작업: T026 / 기능: F006, F008
- Props: `entries`, `onOpenRelated`
- State: `expandedId`
- 상태: loading `변경 내역을 불러오는 중이에요`; error `변경 내역을 불러오지 못했어요`; empty `아직 바뀐 내용이 없어요`; success `날짜별 쉬운 문장 카드`
- Handler: `handleExpand`, `handleOpenRelated`
- 시각: 행위자·전후값·시간 순서, 기술값 숨김

### C015 ModeSelector

- 파일: `src/frontend/components/settings/ModeSelector.tsx`
- 화면: S001, S009 / 관련 작업: T019, T027 / 기능: F007
- Props: `value`, `onChange`
- State: `previewMode`
- 상태: loading `설정을 불러오는 중이에요`; error `설정을 바꾸지 못했어요`; empty `선택 전`; success `두 모드 설명 카드`
- Handler: `handleSelect`, `handlePreview`
- 시각: 라디오+굵은 이름+한 문장 설명, 선택 즉시 미리보기

### C016 UndoBanner

- 파일: `src/frontend/components/feedback/UndoBanner.tsx`
- 화면: S002~S009 / 관련 작업: T022, T028 / 기능: F008
- Props: `message`, `durationMs`, `onUndo`, `onDismiss`
- State: `remainingTime`
- 상태: loading `처리 중이에요`; error `되돌리지 못했어요`; empty `렌더링하지 않음`; success `결과 문구+되돌리기`
- Handler: `handleUndo`, `handleDismiss`
- 시각: 화면 하단 고정, 최소 8초, 자동 닫힘 전 읽기 알림

### C017 ReadAloudButton

- 파일: `src/frontend/components/accessibility/ReadAloudButton.tsx`
- 화면: 전체 / 관련 작업: T027 / 기능: F009
- Props: `text`, `enabled`, `onStart?`, `onStop?`
- State: `isSpeaking`
- 상태: loading `읽을 내용을 준비하는 중이에요`; error `지금은 읽어드릴 수 없어요`; empty `비활성`; success `읽어주기/그만 읽기`
- Handler: `handleToggle`
- 시각: 스피커 아이콘+글자, 재생 중 모양+문구 변경

## 7. 훅·서비스 명세

| 훅 | 파일 | 반환 | 사용처 | 서비스 |
|---|---|---|---|---|
| `useSession` | `src/frontend/hooks/useSession.ts` | `{ user, loading, error, signIn, signOut }` | S001, 전체 | `src/service/authService.ts` |
| `useTasks` | `src/frontend/hooks/useTasks.ts` | `{ tasks, loading, error, add, update, remove, reorder }` | S002~S004 | `src/service/taskService.ts` |
| `useTodayChecklist` | `src/frontend/hooks/useTodayChecklist.ts` | `{ items, loading, error, complete, delay, requestHelp, undo }` | S002 | `src/service/recordService.ts` |
| `useWeightLog` | `src/frontend/hooks/useWeightLog.ts` | `{ latest, history, loading, error, save }` | S005, S006 | `src/service/weightService.ts` |
| `useMedicationTask` | `src/frontend/hooks/useMedicationTask.ts` | `{ photo, schedule, loading, error, save, confirmSafety }` | S002, S004 | `src/service/medicationService.ts` |
| `useHabitRecords` | `src/frontend/hooks/useHabitRecords.ts` | `{ weekly, monthly, loading, error, selectPeriod }` | S006 | `src/service/recordService.ts` |
| `useSupportLink` | `src/frontend/hooks/useSupportLink.ts` | `{ supporter, permissions, loading, error, invite, update, disconnect }` | S007 | `src/service/sharingService.ts` |
| `useChangeHistory` | `src/frontend/hooks/useChangeHistory.ts` | `{ entries, loading, error, refresh }` | S008 | `src/service/sharingService.ts` |
| `usePreferences` | `src/frontend/hooks/usePreferences.ts` | `{ mode, theme, speech, update }` | S001, S009 | `src/service/preferenceService.ts` |
| `useReadAloud` | `src/frontend/hooks/useReadAloud.ts` | `{ speaking, error, speak, stop }` | 전체 | `src/service/speechService.ts` |

## 8. 사용자 문구 기준

| 피할 말 | 사용할 말 |
|---|---|
| 복약 여부를 선택하세요 | 약을 먹었나요? |
| 복약 완료 | 먹었어요 |
| 미달성 | 기록 없음 |
| 실패 | 표시하지 않음 |
| 보호자 관리 | 함께 관리 |
| 정상적으로 저장되었습니다 | 기록했어요 |
| 유효하지 않은 입력입니다 | 숫자를 다시 확인해 주세요 |
| 삭제하시겠습니까? | `양치하기`를 지울까요? 지운 뒤에도 되돌릴 수 있어요. |

## 9. 기획-디자인 대조

- F001~F010이 화면·컴포넌트 또는 PWA 배포 셸에 매핑되어 있다.
- 용돈 기록 화면·입력칸은 만들지 않는다.
- 성장 정원·점수·완료율·연속 기록·순위·캐릭터 화면은 만들지 않는다.
- 첨부 이미지의 작은 월간 통계 카드는 모바일 홈에 넣지 않고 S006 상세 화면에만 파생했다.
- 지원자용 별도 대시보드를 만들지 않고 S003·S004·S007 구조를 권한에 따라 재사용한다.

## 10. 사용자대표 검토 기록

- 불편: 처음 설정의 계정 단계가 보이지 않고 단계 번호가 맞지 않아 현재 위치를 혼동할 수 있다. → 3단계 순서를 명시하고 표시 모드 화면을 `2/3`으로 수정했다. 완료 뒤 지원자 연결과 나중에 하기를 함께 제공했다.
- 불편: 기존 할 일의 시간 하나만 바꾸려고도 전체 단계를 통과하면 쉬운 모드에서 약 9번 눌러야 한다. → 기존 할 일은 `무엇을 바꿀까요?`에서 한 항목만 바로 여는 방식으로 바꿨다. 시간 변경은 약 5회 이내를 목표로 한다.
- 불편: 약 알림 변경에서 반복 범위 확인과 안전 확인이 연달아 나오면 목적을 잊을 수 있다. → 범위·새 시간·안전 문구를 하나의 최종 확인에 합쳤다.
- 불편: 지난주로 이동하는 조작이 없어 검증 시나리오를 완료할 수 없다. → `이전 주/다음 주`와 현재 기간 문구를 추가했다.
- 불편: 카드 전체를 눌러 체크하려다 편집 화면에 들어갈 수 있다. → 카드 본문은 읽기 전용으로 두고 `수정`과 `했어요`를 분리된 글자 버튼으로 만들었다.
- 호감: `했어요` 한 번 뒤 파스텔 채움+체크+`기록했어요`로 바뀌는 차분한 피드백이 가장 강한 재사용 동기다. → 애니메이션을 절제하고 즉시 확인·되돌리기를 강화한다.
- 호감: 점수·순위 없는 주간 격자는 평가받는 느낌 없이 기록이 쌓이는 만족감을 준다. → S006을 하단 주 메뉴에 유지한다.

## 11. 자가검증

- [x] 모든 must 기능이 화면·컴포넌트에 매핑됨
- [x] 모든 컴포넌트에 loading/error/empty/success 상태 명시
- [x] 오류·안내 메시지 한국어
- [x] 파일 경로가 frontend/service/db 레이어와 일치
- [x] 모든 색상이 라이트·다크 토큰으로 정의됨
- [x] 모바일·태블릿·PC 동작 정의
- [x] 앱 셸과 내비게이션 정의
- [x] 터치 최소 44×44, 색+형태+글자 상태 정의
- [x] 용돈·성장 정원·장식 통계 미포함
- [x] PWA 아이콘이 캐릭터·점수 없이 기존 세이지·파스텔 기록표 분위기와 일치

## 12. 사용성 검증 시나리오

1. 설명 없이 `양치하기`를 완료하고 다시 되돌린다.
2. `산책하기`의 시간을 오늘만 바꾼다.
3. 새 할 일을 만들고 아이콘·반복 요일을 고른다.
4. `아침 약` 알림 시간을 바꾸고 안전 안내를 이해한다.
5. 지난주 기록에서 완료·기록 없음·예정 없음을 구분한다.
6. 지원자가 바꾼 일정을 찾아 누가 언제 바꿨는지 말한다.

합격 기준: 핵심 시나리오 1~5를 지원자의 대신 누르기 없이 완료하고, 주요 오조작은 즉시 되돌릴 수 있다.

## 13. PWA 설치 셸

- 앱 이름과 홈 화면 이름은 `하루한칸`으로 통일한다.
- 아이콘은 네 칸 기록표와 체크를 사용하고 글자·캐릭터·점수 배지는 넣지 않는다.
- 일반 아이콘은 아이보리 바탕, maskable 아이콘은 세이지 바탕의 안전 영역 안에 같은 심볼을 둔다.
- 로딩 전 HTML과 오프라인 안내도 라이트·다크 토큰의 배경·글자 대비를 유지한다.
- 모바일 viewport는 safe area를 포함하고 문서 폭과 화면 폭이 같아야 한다.
