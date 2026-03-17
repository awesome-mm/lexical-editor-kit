# AGENTS.md — 라이브러리 배포 AI 에이전트 가이드

---

## 언어 규칙 (절대 규칙)

> **모든 답변은 반드시 한국어로 작성해야 한다. 영어 답변은 절대 금지한다.**

---

## 현재 상태 요약

- **Feature Registry:** 미구현. `features/` 디렉토리, `createEditorKit.ts`, `utils/optional.ts` 없음
- **optional peer 처리:** `@lexical/code`, `@lexical/list`, `@lexical/table`이 여러 파일에서 정적 import 중
- **빌드 출력:** ESM only (5개 엔트리 포인트)
- **테스트:** Playwright E2E (Chromium), vitest 단위 테스트
- **CI/CD:** 없음

---



## 절대 규칙 (Hard Rules)

1. `react`, `react-dom`, `lexical`, `@lexical/*` → 반드시 `peerDependencies`에만 존재
2. Vite/Rollup `external`에 peerDependencies 전체 포함 필수
3. `dist/`에 React 또는 Lexical 코드가 포함되면 안 됨
4. **Feature Registry 구현 후 추가 규칙:**
   - optional peer(`@lexical/table`, `@lexical/list`, `@lexical/code`) → `features/*/index.ts` 내부에서만 static import 허용
   - `editor/` 하위 파일에서 optional peer top-level import 절대 금지
   - `features/index.ts`의 `loadFeatures()`는 `await import()`로만 로드

---

## 저장소 구조 (현재)

```
lexical-editor-kit/
├── pnpm-workspace.yaml
├── package.json               # 루트 스크립트
├── playwright.config.ts
├── e2e/                       # E2E 테스트
│
├── apps/
│   └── website/               # 데모 앱 (lexical-editor-playground)
│       ├── package.json       # workspace:* 로 editor 참조, optional peer 전체 설치
│       └── vite.config.ts     # dedupe 설정
│
├── packages/
│   └── editor/                # 라이브러리 (lexical-editor-kit)
│       ├── package.json       # 5개 exports, peerDependenciesMeta.optional
│       ├── vite.config.ts     # 5개 entry, ESM only, external 정규식
│       ├── tsconfig.build.json # emitDeclarationOnly
│       └── src/
│           ├── index.ts       # Core, Settings, Context, Nodes, Themes
│           ├── plugins.ts     # 40+ 플러그인 재export
│           ├── nodes.ts       # 노드 재export (⚠️ optional peer 포함)
│           ├── providers.ts   # Provider 컴포넌트
│           ├── playground.ts  # 플레이그라운드 전용
│           ├── core/          # createEditor, EditorBuilder
│           └── editor/        # 내부 구현 (plugins/, config/, nodes/, ui/, hooks/, context/)
│
├── ARCHITECTURE.md
└── AGENTS.md
```

---

## 배포 전 검증 체크리스트

### 기본 (현재 적용 가능)
- [ ] `pnpm build:editor` 성공
- [ ] `dist/`에 React / Lexical 코드 포함 안 됨
- [ ] `pnpm test:e2e` 통과
- [ ] `pnpm pack --dry-run` 결과 `dist/`만 포함
- [ ] `package.json`의 exports 경로가 실제 dist 파일과 일치

### Feature Registry 구현 후 추가
- [ ] `features/*/index.ts` 각각 존재하고 해당 optional 패키지만 static import
- [ ] `editor/` 하위에서 optional peer top-level import 없음
- [ ] `features/index.ts`에 `loadFeatures()` + `features` 접근자 존재
- [ ] 메인 번들 2MB 이하
- [ ] `features/code`, `features/list`, `features/table` chunk 분리 확인
- [ ] `@lexical/code` 미설치 → Code Block 메뉴 비노출
- [ ] `@lexical/list` 미설치 → List 메뉴 비노출
- [ ] `@lexical/table` 미설치 → Table 메뉴 비노출
- [ ] 모두 설치 시 모든 기능 정상 동작

---

## Feature Registry 검증 포인트 (구현 후)

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

## 수정 대상 파일 (Feature Registry 구현 시 우선순위)

### 🔴 즉시 수정 (배포 블로커)

| 파일 | 수정 내용 |
|------|-----------|
| `features/index.ts` | Feature Registry 신규 작성 |
| `features/code/index.ts` | `@lexical/code` 로직 전담 모듈 (신규) |
| `features/list/index.ts` | `@lexical/list` 로직 전담 모듈 (신규) |
| `features/table/index.ts` | `@lexical/table` 로직 전담 모듈 (신규) |
| `editor/plugins/ToolbarPlugin/utils.ts` | 정적 import 제거 → `features.*` 위임 |
| `editor/plugins/ToolbarPlugin/index.tsx` | 동일 |
| `editor/plugins/ComponentPickerPlugin/index.tsx` | 동일 |

### 🟡 후속 수정 (기능 완성도)

| 파일 | 수정 내용 |
|------|-----------|
| `editor/plugins/MarkdownTransformers/index.ts` | `features.code` 조건부 transformer |
| `editor/config/EditorConfig.ts` | `features.*.getNodes()` 사용으로 통일 |
| `nodes.ts` | optional 노드 직접 export 제거 |
| `createEditorKit.ts` | `loadFeatures()` 호출 헬퍼 (신규) |
| `index.ts` | `loadFeatures` 공개 export 추가 |

---

## Vercel 배포 설정 (해당 시)

| 항목 | 값 |
|------|----|
| Root Directory | `./` |
| Build Command | `pnpm install && pnpm build:apps` |
| Output Directory | `apps/website/dist` |
| Install Command | `pnpm install` |

> 현재 `vercel.json` 미설정. Vercel 대시보드에서 수동 구성 필요.

---

## publish 절차

```bash
pnpm build:editor
cd packages/editor
pnpm pack --dry-run    # dist/ 만 포함되는지 확인
pnpm pack              # tarball 생성
# npm publish           # NPM 배포
```

---

## 참고 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm dev` | apps/website 개발 서버 (포트 5173) |
| `pnpm dev:editor` | packages/editor Vite 플레이그라운드 |
| `pnpm build` | 전체 빌드 |
| `pnpm build:editor` | 에디터 패키지만 빌드 (`vite build && tsc`) |
| `pnpm build:apps` | apps/website 빌드 |
| `pnpm preview` | 빌드 결과 미리보기 (포트 4173) |
| `pnpm test` | vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright E2E (preview 서버 자동 기동, 포트 4173) |
| `pnpm test:e2e:ui` | Playwright UI 모드 |
| `pnpm test:e2e:debug` | Playwright 디버그 모드 |
| `pnpm test:e2e:report` | 마지막 테스트 HTML 리포트 |
| `pnpm test:e2e:no-optional` | optional 미설치 시나리오 테스트 (포트 4174) |
| `pnpm --filter lexical-editor-kit analyze` | 번들 크기 분석 (rollup-plugin-visualizer) |
