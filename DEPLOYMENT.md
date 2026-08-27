# 명령어 없이 GitHub와 Vercel에 배포하기

이 안내는 터미널을 사용하지 않는 방법만 설명합니다. 배포용 압축 파일을 먼저 풀어 둡니다.

## 1. GitHub 저장소 만들기

1. [GitHub](https://github.com)에 로그인합니다.
2. 오른쪽 위 `+` → `New repository`를 선택합니다.
3. 저장소 이름을 입력합니다. 예: `haru-one-square`
4. 공개 범위를 `Private` 또는 `Public`으로 선택합니다.
5. README·`.gitignore`·License 추가 옵션은 선택하지 않고 `Create repository`를 누릅니다.

## 2. 완성된 파일 올리기

GitHub 웹 화면은 한 번에 올릴 수 있는 파일 수가 제한될 수 있어 두 번으로 나눕니다.

1. 빈 저장소 화면에서 `uploading an existing file`을 누릅니다.
2. 압축을 푼 폴더 안의 `src` 폴더만 업로드 영역으로 끌어다 놓고 `Commit changes`를 누릅니다.
3. 저장소 첫 화면에서 `Add file` → `Upload files`를 선택합니다.
4. 압축을 푼 폴더에서 `src`를 제외한 나머지 항목을 모두 끌어다 놓고 다시 `Commit changes`를 누릅니다.

`package.json`이 저장소 첫 화면에 보여야 합니다. 폴더 하나가 더 겹쳐 `daily-support-app/package.json`처럼 보이면 Vercel의 루트 인식이 어긋날 수 있습니다.

## 3. Vercel에 연결하기

1. [Vercel](https://vercel.com)에 접속해 `Continue with GitHub`로 로그인합니다.
2. `Add New…` → `Project`를 선택합니다.
3. 방금 만든 GitHub 저장소 옆의 `Import`를 누릅니다.
4. 프로젝트 루트는 기본값인 `./`로 둡니다.
5. 빌드 설정은 저장소의 `vercel.json`이 자동 적용하므로 바꾸지 않습니다.
6. `Deploy`를 누릅니다.

완료 화면에 `https://...vercel.app` 주소가 나타나면 배포가 끝난 것입니다.

## 4. 환경 변수

현재 로컬 저장 버전은 환경 변수 없이 실행됩니다. 따라서 첫 배포에서는 Vercel의 Environment Variables를 비워 둡니다.

나중에 실제 Supabase 공유 기능을 연결할 때만 아래 공개용 값을 Vercel에 등록합니다.

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 주소
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: 브라우저용 publishable key

`service_role`, 데이터베이스 비밀번호, 개인 액세스 토큰은 등록하거나 GitHub에 올리지 않습니다.

## 5. 휴대폰에 설치하기

- Android Chrome: 배포 주소 열기 → 오른쪽 위 메뉴 → `앱 설치`
- iPhone Safari: 배포 주소 열기 → 공유 버튼 → `홈 화면에 추가`

설치 메뉴가 바로 보이지 않으면 페이지를 한 번 새로고침하고 몇 초 기다린 뒤 다시 확인합니다.

## 6. 이후 업데이트

GitHub 저장소에서 파일을 바꾸고 `Commit changes`하면 Vercel이 자동으로 새 버전을 빌드합니다. Vercel의 `Deployments` 메뉴에서는 이전 정상 버전으로 되돌릴 수도 있습니다.

## 배포 직후 확인할 것

- 첫 화면 제목이 `하루한칸`인지
- `내 계정 시작하기` 버튼이 화면 밖으로 잘리지 않는지
- 홈 화면 추가 뒤 앱 아이콘이 보이는지
- 앱을 한 번 연 다음 비행기 모드에서도 다시 열리는지
- 기록은 현재 사용 중인 기기에만 저장된다는 안내를 사용자와 지원자가 이해했는지
