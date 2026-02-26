# AGENTS.md — 라이브러리 배포 AI 에이전트 가이드

---

## 언어 규칙 (절대 규칙)

> **모든 답변은 반드시 한국어로 작성해야 한다. 영어 답변은 절대 금지한다.**

---

## 에이전트 역할 정의

> 각 에이전트의 상세 수행 절차는 `.cursor/agents/` 디렉토리의 개별 파일을 참조한다.

### Agent A – 아키텍처 & 의존성 검증
📄 `.cursor/agents/agent-a.md`

**역할:**
- `features/*/index.ts`의 static import가 해당 feature 파일 내부에만 존재하는지 확인
- `editor/` 하위 파일에서 optional 패키지(`@lexical/code`, `@lexical/list`, `@lexical/yjs`, `yjs`) top-level static import 탐지
- `features/index.ts`의 Feature Registry 구조 검증
- `package.json` exports / peerDependencies / peerDependenciesMeta 검증
- `vite.config.ts` external 목록 완전성 확인

**금지:** 실제 코드 수정, 번들 설정 변경

---

### Agent B – 빌드 & 번들 검사
📄 `.cursor/agents/agent-b.md`

**역할:**
- `pnpm build:editor` 실행 및 에러 확인
- `dist/` 결과물에서 React / Lexical 코드 포함 여부 검사
- `features/code`, `features/list`, `features/table`이 별도 chunk로 분리되는지 확인
- 번들 크기 측정 — 목표: 메인 번들 2MB 이하
- `pnpm preview` 실행으로 apps/website 동작 확인

**금지:** 아키텍처 변경

---

### Agent C – 런타임 & Playground 테스트
📄 `.cursor/agents/agent-c.md`

**역할:**
- `pnpm dev:editor`로 Playground 실행
- optional packages 미설치 시나리오: `@lexical/code` 없이 에디터 로드 → 에러 없어야 함
- `loadFeatures({ code: true })` 호출 후 코드 블록 메뉴 항목 노출 확인
- `features.code` null일 때 ToolbarPlugin 버튼 비활성화 확인
- `features.list` null일 때 리스트 관련 메뉴 비노출 확인

**금지:** 배포 파이프라인 수정

---

### Agent D – 배포 & 릴리즈
📄 `.cursor/agents/agent-d.md`

**역할:**
- `pnpm pack --dry-run` 결과 검증 (dist만 포함되는지)
- Vercel 빌드 설정 확인
- README 사용자 가이드 검토 (loadFeatures 사용법 포함 여부)
- `package.json` version, license, repository, exports 필드 확인

**금지:** 빌드 스크립트 변경

---

## 절대 규칙 (Hard Rules)

1. `react`, `react-dom`, `lexical`, `@lexical/*` → 반드시 `peerDependencies`에만 존재
2. optional peer(`@lexical/table`, `@lexical/list`, `@lexical/code`, `@lexical/yjs`, `yjs`) → **`features/*/index.ts` 내부에서만 static import 허용**
3. `editor/` 하위 파일(ToolbarPlugin, ComponentPickerPlugin, Editor 등)에서 optional peer top-level import **절대 금지**
4. Vite/Rollup `external`에 peerDependencies 전체 포함 필수
5. `features/index.ts`의 `loadFeatures()`는 `await import()`로만 로드
6. `dist/`에 React 또는 Lexical 코드가 포함되면 안 됨

---

## 저장소 구조

```
lexical-editor-kit/
├── apps/
│   └── website/          # 데모 웹 앱 (Vercel 배포)
├── packages/
│   └── editor/
│       └── src/
│           ├── index.ts
│           ├── createEditorKit.ts
│           ├── features/
│           │   ├── code/index.ts     # @lexical/code 전담
│           │   ├── list/index.ts     # @lexical/list 전담
│           │   ├── table/index.ts    # @lexical/table 전담
│           │   └── index.ts          # Feature Registry
│           └── editor/               # 내부 구현
├── AGENTS.md
└── ARCHITECTURE.md
```

---

## Feature Registry 검증 포인트

Agent A가 반드시 확인해야 할 항목:

```
features/index.ts
  ✅ loadFeatures()가 await import('./code') 패턴 사용
  ✅ 동기 접근자 features.code, features.list, features.table 존재
  ✅ import 실패 시 .catch(() => {})로 조용히 무시

features/code/index.ts
  ✅ @lexical/code를 static import (이 파일 안에서만 허용)
  ✅ formatCode(), getCodeNodes() export

features/list/index.ts
  ✅ @lexical/list를 static import (이 파일 안에서만 허용)
  ✅ formatBulletList(), formatCheckList(), formatNumberedList(), getListNodes() export
  ✅ INSERT_*_COMMAND export

features/table/index.ts
  ✅ @lexical/table를 static import (이 파일 안에서만 허용)
  ✅ TableFeaturePlugins, getTableNodes() export

editor/Editor.tsx
  ✅ yjs static import 없음
  ✅ TableFeatureLazy: React.lazy + dynamic import 유지

editor/plugins/ToolbarPlugin/utils.ts
  ✅ @lexical/code, @lexical/list import 없음
  ✅ features.code?.formatCode() 패턴 사용

editor/plugins/ToolbarPlugin/index.tsx
  ✅ @lexical/code, @lexical/list, @lexical/code-shiki top-level import 없음
  ✅ features.code / features.list 조건부 렌더링

editor/plugins/ComponentPickerPlugin/index.tsx
  ✅ @lexical/code, @lexical/list top-level import 없음
  ✅ features.code / features.list 조건부 메뉴 항목

editor/plugins/MarkdownTransformers/index.ts
  ✅ @lexical/code top-level import 없음 (features.code 사용)
```

---

## 배포 전 검증 체크리스트

### 아키텍처
- [ ] `features/*/index.ts` 각각 존재하고 해당 optional 패키지만 static import
- [ ] `editor/` 하위에서 optional peer top-level import 없음 (`rg "from \"@lexical/code\""` 등으로 탐지)
- [ ] `features/index.ts`에 `loadFeatures()` + `features` 접근자 존재
- [ ] `createEditorKit()`가 내부적으로 `loadFeatures()` 호출

### 빌드
- [ ] `pnpm build:editor` 성공
- [ ] `dist/` 에 React / Lexical 포함 안 됨
- [ ] 메인 번들 2MB 이하
- [ ] `vite.config.ts`에서 `inlineDynamicImports: true` 제거됨
- [ ] `features/code`, `features/list`, `features/table` chunk 분리 확인
- [ ] `pnpm test:e2e` (editor-load.spec.ts) 통과

### 런타임
- [ ] `pnpm test:e2e` 전체 통과 (editor-load + features-toolbar + features-insert)
- [ ] `pnpm test:e2e:no-optional` 통과 (optional-missing.spec.ts)
- [ ] `@lexical/code` 미설치 → Code Block 메뉴 비노출 (Playwright 확인)
- [ ] `@lexical/list` 미설치 → List 메뉴 비노출 (Playwright 확인)
- [ ] `@lexical/table` 미설치 → Table 메뉴 비노출 (Playwright 확인)
- [ ] 모두 설치 시 Code Block / List / Table 삽입 DOM 렌더 확인 (Playwright 확인)

### 배포
- [ ] `pnpm pack --dry-run` 결과 `dist/`만 포함
- [ ] Vercel 빌드 성공
- [ ] 배포 URL 대상 `pnpm test:e2e` 스모크 테스트 통과

---

## 수정 대상 파일 (우선순위)

### 🔴 즉시 수정 (배포 블로커)

| 파일 | 수정 내용 |
|------|-----------|
| `features/index.ts` | Feature Registry 신규 작성 |
| `features/code/index.ts` | `@lexical/code` 로직 전담 모듈 (신규) |
| `features/list/index.ts` | `@lexical/list` 로직 전담 모듈 (신규) |
| `features/table/index.ts` | 기존 `features/table.ts` 리팩터 + 디렉터리로 이동 |
| `editor/Editor.tsx` | `import { Doc } from "yjs"` 제거 |
| `editor/plugins/ToolbarPlugin/utils.ts` | `@lexical/code`, `@lexical/list` static import 제거 → `features.*` 위임 |
| `editor/plugins/ToolbarPlugin/index.tsx` | 동일 |
| `editor/plugins/ComponentPickerPlugin/index.tsx` | 동일 |

### 🟡 후속 수정 (기능 완성도)

| 파일 | 수정 내용 |
|------|-----------|
| `editor/plugins/MarkdownTransformers/index.ts` | `features.code` 조건부 transformer |
| `editor/config/EditorConfig.ts` | `features.*.getNodes()` 사용으로 통일 |
| `createEditorKit.ts` | `loadFeatures()` 호출로 재설계 |
| `index.ts` | `loadFeatures` 공개 export 추가 |
| `src/utils/optional.ts` | CJS 전용으로 범위 축소 또는 삭제 |
| `src/features/code.ts`, `src/features/list.ts`, `src/features/table.ts` | 삭제 (`src/features/*/index.ts` 구조로 대체) |

---

## Vercel 배포 설정

| 항목 | 값 |
|------|----|
| Root Directory | `./` |
| Build Command | `pnpm install && pnpm build:apps` |
| Output Directory | `apps/website/dist` |
| Install Command | `pnpm install` |

- `apps/website/package.json`에 optional peer 전체 명시 설치
- `main.tsx` 또는 앱 진입점에서 `await loadFeatures(...)` 호출

---

## publish 절차

```bash
pnpm build:editor
cd packages/editor
pnpm pack --dry-run
pnpm pack
```

---

## 참고 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm dev` | apps/website 개발 서버 |
| `pnpm dev:editor` | packages/editor Vite 플레이그라운드 |
| `pnpm build` | 전체 빌드 |
| `pnpm build:editor` | 에디터 패키지만 빌드 |
| `pnpm build:apps` | apps/website 빌드 |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm test:e2e` | Playwright E2E 전체 실행 (preview 서버 자동 기동) |
| `pnpm test:e2e:ui` | Playwright UI 모드 (브라우저에서 테스트 확인) |
| `pnpm test:e2e:debug` | Playwright 디버그 모드 |
| `pnpm test:e2e:report` | 마지막 테스트 HTML 리포트 열기 |
| `pnpm test:e2e:no-optional` | optional 패키지 미설치 시나리오 테스트 (포트 4174) |
