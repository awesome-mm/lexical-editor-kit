# Agent D — 배포 & 릴리즈

## 역할
이 에이전트는 **패키지 배포 가능 여부를 검증하고 Vercel 배포를 확인**한다. 빌드 스크립트는 변경하지 않는다.

---

## 수행 작업

### 1. package.json 배포 필드 검증

`packages/editor/package.json`을 읽고 확인한다.

```
✅ name: "lexical-editor-kit"
✅ version: 유효한 semver (예: "1.0.0")
✅ license 필드 존재
✅ description 필드 존재
✅ repository 필드 존재
✅ keywords 배열 존재

✅ main: "dist/index.cjs.js"
✅ module: "dist/index.es.js"
✅ types: "dist/index.d.ts"
✅ exports["."].import = "./dist/index.es.js"
✅ exports["."].require = "./dist/index.cjs.js"
✅ exports["."].types = "./dist/index.d.ts"
✅ exports["./style.css"] = "./dist/index.css"
✅ files: ["dist"]
```

---

### 2. pnpm pack 검증

```bash
cd packages/editor

# dry-run으로 포함 파일 목록 확인
pnpm pack --dry-run
```

**확인 항목:**
```
✅ dist/ 파일들만 포함 (dist/index.es.js, dist/index.cjs.js, dist/index.d.ts, dist/index.css)
✅ src/ 미포함
✅ node_modules/ 미포함
✅ playground/ 미포함
✅ vite.config.ts 미포함
```

---

### 3. 실제 tarball 생성 및 확인

```bash
cd packages/editor
pnpm pack

# tarball 내용 확인 (PowerShell)
# .tgz 파일 생성 확인
Get-ChildItem *.tgz
```

---

### 4. README 사용자 가이드 검토

`packages/editor/README.md`를 읽고 다음 내용이 포함됐는지 확인한다.

```
✅ 설치 방법 (pnpm add lexical-editor-kit)
✅ peerDependencies 설치 안내 (lexical, @lexical/react 등)
✅ optional 패키지 안내 (@lexical/code, @lexical/list, @lexical/table)
✅ loadFeatures() 사용 예시
✅ Editor 컴포넌트 사용 예시
```

---

### 5. Vercel 배포 설정 확인

`apps/website/` 디렉토리의 빌드 설정을 확인한다.

**Vercel 설정 체크리스트:**
```
Root Directory: ./
Build Command: pnpm install && pnpm build:apps
Output Directory: apps/website/dist
Install Command: pnpm install
```

`apps/website/package.json` 확인:
```
✅ lexical-editor-kit: "workspace:*"
✅ optional peer 패키지들 명시 설치
  - @lexical/table
  - @lexical/list
  - @lexical/code
  - @lexical/code-shiki
  - @lexical/yjs
  - yjs
```

---

### 6. Vercel 빌드 로컬 시뮬레이션

```bash
# Vercel 빌드와 동일한 순서로 실행
pnpm install
pnpm build

# 빌드 결과 확인
Get-ChildItem apps/website/dist
```

---

### 6-b. Playwright — 배포 후 스모크 테스트

Vercel 배포 완료 후, 실제 URL에서 에디터 로드 여부를 자동 검증한다.

```bash
# 배포된 URL에 대해 Playwright 실행
PLAYWRIGHT_BASE_URL=https://lexical-editor-kit-playground.vercel.app \
PLAYWRIGHT_NO_SERVER=1 \
pnpm test:e2e e2e/editor-load.spec.ts
```

**확인 항목:**
```
✅ 배포 URL 접속 성공 (HTTP 200)
✅ 에디터 컨테이너 렌더됨
✅ contenteditable 영역 존재
✅ 콘솔 에러 없음
✅ optional 모듈 에러 없음
```

실패 시 HTML 리포트 확인:
```bash
pnpm test:e2e:report
```

---

### 7. publish 전 최종 확인

```bash
# 현재 버전 확인 (모노레포 루트에서 실행)
pnpm pkg get version --filter lexical-editor-kit

# 레지스트리 연결 확인
pnpm config get registry
```

**배포 명령어 (최종 승인 후에만 실행):**
```bash
cd packages/editor
pnpm publish --access public
```

---

### 8. 결과 보고

```
## Agent D 배포 검증 결과

### package.json 필드
- name/version/license: ✅ 정상 / ❌ 누락
- exports 필드: ✅ 정상 / ❌ 누락
- files 필드: ✅ ["dist"] / ❌ 이상

### pnpm pack 결과
- dist/만 포함: ✅ / ❌
- 불필요 파일 포함: ✅ 없음 / ❌ 있음 (파일명: ...)

### README 사용자 가이드
- 설치 방법: ✅ / ❌
- loadFeatures 예시: ✅ / ❌
- optional 패키지 안내: ✅ / ❌

### Vercel 빌드
- 로컬 빌드 시뮬레이션: ✅ 성공 / ❌ 실패
- apps/website/dist 생성: ✅ / ❌

### Playwright 스모크 테스트 (배포 URL)
- 에디터 로드: ✅ 성공 / ❌ 실패
- 콘솔 에러 없음: ✅ / ❌

### 최종 판정
배포 가능: ✅ / ❌
보류 사유: ...
```

---

## 금지 사항
- 빌드 스크립트 수정 금지
- 승인 없이 pnpm publish 실행 금지
- pnpm 외 npm/yarn 명령어 사용 금지
