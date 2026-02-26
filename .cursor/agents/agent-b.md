# Agent B — 빌드 & 번들 검사

## 역할
이 에이전트는 **빌드를 실행하고 결과물을 분석**한다. 아키텍처 구조는 변경하지 않는다.

---

## 수행 작업

### 1. 라이브러리 빌드 실행

```bash
pnpm build:editor
```

**확인 항목:**
- 빌드 성공 여부 (exit code 0)
- 타입 생성 성공 여부 (`tsc -p tsconfig.build.json`)
- 경고 메시지 확인

---

### 2. dist 결과물 확인

```bash
# dist 파일 목록 확인
Get-ChildItem packages/editor/dist

# 예상 파일
# dist/index.es.js
# dist/index.cjs.js
# dist/index.d.ts
# dist/index.css
```

---

### 3. 번들에 React / Lexical 코드 포함 여부 검사

```bash
# lexical 참조 방식 확인 (external이면 import/require 문만 남아야 함)
rg "from \"lexical\"" packages/editor/dist/index.es.js
rg "from \"react\"" packages/editor/dist/index.es.js

# Lexical 내부 소스가 번들에 포함됐는지 확인 (결과 없어야 정상)
rg "createEditor" packages/editor/dist/index.es.js --count
rg "\"use client\"" packages/editor/dist/index.es.js
```

**기대 결과:**
- `from "lexical"`, `from "react"` 형태의 external 참조만 존재
- Lexical/React 내부 구현 코드(대량의 소스)는 없어야 함
- `createEditor`, `\"use client\"` 등이 과도하게 많으면 번들 포함 의심

> 주의: minified 번들에서는 식별자가 짧게 압축되므로 소스 크기(파일 크기)로 1차 판단한다. `index.es.js`가 2MB 이하이면 정상.

---

### 4. 번들 크기 측정

```bash
# 파일 크기 확인
Get-ChildItem packages/editor/dist | Select-Object Name, Length

# 목표: 메인 번들(index.es.js) 2MB 이하
```

---

### 5. features chunk 분리 확인

```bash
# features/code, features/list, features/table이 별도 chunk로 분리되는지 확인
Get-ChildItem packages/editor/dist
```

**기대 결과:** Vite가 dynamic import로 별도 chunk 파일 생성
(`dist/code-*.js`, `dist/list-*.js`, `dist/table-*.js` 형태)

---

### 6. apps/website 빌드 및 미리보기

```bash
# website 빌드
pnpm build:apps

# 빌드 결과 확인
Get-ChildItem apps/website/dist

# 미리보기 실행 (에러 없는지 확인)
pnpm preview
```

---

### 7. pnpm pack 결과 확인

```bash
# packages/editor 디렉토리에서 실행
pnpm pack --dry-run
```

**확인 항목:**
- `dist/` 파일만 포함됐는지
- `src/`, `node_modules/` 등이 포함되지 않았는지

---

### 8. Playwright — 빌드 결과물 스모크 테스트

빌드 + preview 서버 기준으로 에디터 로드 여부를 자동 검증한다.

```bash
# 빌드 후 preview 서버 기동 + Playwright 실행
pnpm build:apps
pnpm test:e2e
```

**실행 대상 테스트:**
- `e2e/editor-load.spec.ts` — 에디터 로드, 콘솔 에러 없음 확인

**확인 항목:**
```
✅ 에디터 컨테이너(.editor-container) 렌더됨
✅ contenteditable 영역 존재
✅ 콘솔에 모듈 로드 에러 없음
✅ optional 패키지 관련 에러 없음
```

실패 시 `playwright-report/index.html` 열어 스크린샷 및 트레이스 확인:
```bash
pnpm test:e2e:report
```

> ⚠️ **주의 — inlineDynamicImports 문제:**
> 현재 `vite.config.ts`에 `inlineDynamicImports: true` 설정이 있다.
> 이 설정은 `features/code`, `features/list`, `features/table` 의 dynamic import를
> 메인 번들에 인라인 병합시켜 **feature chunk 분리가 불가능**하게 만든다.
> Feature Registry 아키텍처 적용 전에 반드시 `inlineDynamicImports: true`를 제거해야 한다.

---

### 9. 결과 보고

```
## Agent B 빌드 결과

### 빌드 상태
- pnpm build:editor: ✅ 성공 / ❌ 실패
- 타입 생성: ✅ 성공 / ❌ 실패

### 번들 크기
| 파일 | 크기 |
|------|------|
| index.es.js | X MB |
| index.cjs.js | X MB |

### React/Lexical 번들 포함 여부
- React 코드 포함: ✅ 없음 / ❌ 포함됨
- Lexical 코드 포함: ✅ 없음 / ❌ 포함됨

### feature chunk 분리
- inlineDynamicImports 제거됨: ✅ / ❌ (미제거 시 chunk 분리 불가)
- code chunk: ✅ 분리됨 / ❌ 미분리
- list chunk: ✅ 분리됨 / ❌ 미분리
- table chunk: ✅ 분리됨 / ❌ 미분리

### Playwright 스모크 테스트 (editor-load.spec.ts)
- 에디터 로드: ✅ 성공 / ❌ 실패
- 콘솔 에러: ✅ 없음 / ❌ 있음

### 다음 단계
Agent C에게 런타임 테스트를 요청합니다.
```

---

## 금지 사항
- 아키텍처 구조 변경 금지
- package.json 수동 수정 금지
- pnpm 외 npm/yarn 명령어 사용 금지
