# ARCHITECTURE.md — lexical-editor-kit 아키텍처

---

## 1. 프로젝트 개요

Lexical 기반의 리치 텍스트 에디터 라이브러리. pnpm 모노레포로 구성되어 있으며,
라이브러리(`packages/editor`)와 데모 앱(`apps/website`)으로 분리된다.

---

## 2. 핵심 설계 원칙

### 2.1 Lexical Singleton
- Lexical은 **싱글톤**을 전제로 동작한다.
- 라이브러리 번들에 Lexical을 포함하면 multiple instance 버그가 발생한다.
- 모든 Lexical 패키지는 `peerDependencies`로 선언하고, Vite `external`로 번들에서 제외한다.

### 2.2 Optional Package = 선택적 플러그인 (목표)
- `@lexical/code`, `@lexical/list`, `@lexical/table` 은 **사용자가 직접 설치하는 선택적 패키지**다.
- 이 패키지들을 **라이브러리 메인 번들이 정적으로 import 해서는 안 된다** (목표).
- 미설치 사용자는 해당 기능 없이 에디터가 동작해야 한다.
- 설치 사용자는 별도 설정 없이 해당 기능이 자동 활성화되어야 한다.

### 2.3 번들 크기 목표
| 상태 | 번들 크기 |
|------|-----------|
| 현재 (정적 import) | ~20MB |
| 목표 (dynamic import + feature 분리) | ~2MB |

---

## 3. 현재 프로젝트 구조

### 3.1 모노레포 구조

```
lexical-editor-kit/
├── pnpm-workspace.yaml        # workspaces: apps/*, packages/*
├── package.json               # 루트 스크립트 (dev, build, test 등)
├── playwright.config.ts       # E2E 테스트 설정
├── e2e/                       # Playwright 테스트 파일
│   ├── editor-load.spec.ts
│   ├── features-insert.spec.ts
│   ├── features-toolbar.spec.ts
│   └── optional-missing.spec.ts
│
├── packages/
│   └── editor/                # 라이브러리 패키지 (npm 배포 대상)
│       ├── package.json       # name: lexical-editor-kit
│       ├── vite.config.ts     # 라이브러리 빌드 설정
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       └── src/               # 소스 코드
│
├── apps/
│   └── website/               # 데모/플레이그라운드 앱
│       ├── package.json       # name: lexical-editor-playground
│       └── vite.config.ts     # dedupe 설정으로 Lexical 싱글톤 보장
│
├── ARCHITECTURE.md
└── AGENTS.md
```

### 3.2 packages/editor/src/ 구조

```
packages/editor/src/
├── index.ts              # 메인 진입점: Core, Settings, Context, Nodes, Themes export
├── plugins.ts            # 40+ 플러그인 재export
├── nodes.ts              # 모든 Lexical 노드 재export
├── providers.ts          # Provider 컴포넌트 재export
├── playground.ts         # 플레이그라운드 전용 export
├── index.css             # 에디터 스타일
│
├── core/                 # 에디터 Core
│   ├── core.d.ts
│   ├── createEditor.tsx
│   └── EditorBuilder.ts
│
└── editor/               # 에디터 내부 구현
    ├── appSettings.ts
    ├── buildHTMLConfig.tsx
    ├── assets/            # 아이콘(SVG 105개), 이모지(PNG 4개)
    ├── config/
    │   ├── EditorConfig.ts       # 에디터 설정 (namespace, theme, nodes, onError)
    │   ├── initialEditorState.ts # 초기 상태 (3x3 테이블)
    │   ├── initialText.ts        # 초기 텍스트/마크다운
    │   └── themes/               # 에디터 테마
    │
    ├── context/           # React Context (Settings, Toolbar, SharedHistory 등)
    ├── hooks/             # 커스텀 훅
    ├── nodes/             # 커스텀 노드 (Image, Mention, Sticky, YouTube 등)
    ├── ui/                # UI 컴포넌트
    │
    └── plugins/           # 40+ 에디터 플러그인
        ├── ToolbarPlugin/
        │   ├── index.tsx          # 메인 툴바 (⚠️ @lexical/code, @lexical/list 정적 import)
        │   └── utils.ts           # 포맷팅 함수 (⚠️ @lexical/code, @lexical/list 정적 import)
        ├── ComponentPickerPlugin/ # 슬래시 커맨드 (⚠️ @lexical/code, @lexical/list 정적 import)
        ├── MarkdownTransformers/  # 마크다운 변환기
        ├── TableFeaturePlugins.tsx # 테이블 관련 플러그인 번들
        ├── TableExcelPastePlugin/ # Excel 붙여넣기 (신규)
        ├── TablePlugin.tsx
        ├── TableActionMenuPlugin/
        ├── TableCellResizer/
        ├── TableHoverActionsV2Plugin/
        ├── TableScrollShadowPlugin/
        ├── TableOfContentsPlugin/
        ├── CodeActionMenuPlugin/
        ├── CodeHighlightPrismPlugin/
        ├── CodeHighlightShikiPlugin/
        ├── CollapsiblePlugin/
        ├── ImagesPlugin/
        ├── LayoutPlugin/
        ├── MentionsPlugin/
        ├── FloatingLinkEditorPlugin/
        ├── FloatingTextFormatToolbarPlugin/
        ├── DraggableBlockPlugin/
        ├── DragDropPastePlugin/
        ├── AutocompletePlugin/
        ├── AutoEmbedPlugin/
        ├── AutoLinkPlugin/
        ├── EmojiPickerPlugin/
        ├── EmojisPlugin/
        ├── LinkPlugin/
        ├── ListMaxIndentLevelPlugin/
        ├── MarkdownShortcutPlugin/
        ├── MaxLengthPlugin/
        ├── PageBreakPlugin/
        ├── ShortcutsPlugin/
        ├── SpecialTextPlugin/
        ├── StickyPlugin/
        ├── TabFocusPlugin/
        ├── YouTubePlugin/
        ├── KeywordsPlugin/
        ├── InsertHTMLPlugin/
        ├── ContextMenuPlugin/
        ├── ActionsPlugin/
        └── LightToolbarPlugin/
```

---

## 4. 빌드 구조

### 4.1 엔트리 포인트 (5개)

| 엔트리 | 경로 | 내용 |
|--------|------|------|
| `index` | `src/index.ts` | Core, Settings, Context, Nodes, Themes |
| `plugins` | `src/plugins.ts` | 40+ 플러그인 재export |
| `nodes` | `src/nodes.ts` | 모든 Lexical 노드 |
| `providers` | `src/providers.ts` | Provider 컴포넌트 |
| `playground` | `src/playground.ts` | 플레이그라운드 전용 |

### 4.2 빌드 출력

| 출력 파일 | 포맷 | 내용 |
|-----------|------|------|
| `dist/index.es.js` | ESM | 메인 에디터 |
| `dist/plugins.es.js` | ESM | 플러그인 |
| `dist/nodes.es.js` | ESM | 노드 |
| `dist/providers.es.js` | ESM | Provider |
| `dist/playground.es.js` | ESM | 플레이그라운드 |
| `dist/*.d.ts` | 타입 | 각 엔트리의 타입 선언 |
| `dist/lexical-editor-kit.css` | CSS | 에디터 스타일 |

> **참고:** CJS 출력 없음. ESM만 지원한다 (`formats: ["es"]`).

### 4.3 빌드 프로세스

```bash
pnpm build:editor
# 1) vite build → JS 번들 생성 (5개 엔트리)
# 2) tsc -p tsconfig.build.json → 타입 선언 파일 생성
```

### 4.4 번들 external 설정

`vite.config.ts`의 `rollupOptions.external` 정규식:
```
/^(react($|\/|-dom)|lexical($|\/)|@lexical\/|prettier|typescript$)/
```

번들에서 제외되는 패키지:
- `react`, `react-dom`, `react/jsx-runtime`
- `lexical`, `@lexical/*` (모든 하위 패키지)
- `prettier`, `typescript`

### 4.5 package.json exports

```json
{
  ".":           { "types": "./dist/index.d.ts",      "import": "./dist/index.es.js" },
  "./plugins":   { "types": "./dist/plugins.d.ts",    "import": "./dist/plugins.es.js" },
  "./nodes":     { "types": "./dist/nodes.d.ts",      "import": "./dist/nodes.es.js" },
  "./providers": { "types": "./dist/providers.d.ts",   "import": "./dist/providers.es.js" },
  "./playground": { "types": "./dist/playground.d.ts", "import": "./dist/playground.es.js" },
  "./index.css": "./dist/lexical-editor-kit.css"
}
```

---

## 5. 의존성 분류

| 분류 | 패키지 | 처리 |
|------|--------|------|
| 필수 peer | react, react-dom, lexical, @lexical/react, @lexical/rich-text, @lexical/clipboard, @lexical/html, @lexical/markdown, @lexical/mark, @lexical/overflow, @lexical/history, @lexical/link, @lexical/selection, @lexical/utils, @lexical/extension, @lexical/file, @lexical/hashtag, @lexical/code-shiki | peerDependencies + external |
| Optional peer | @lexical/table, @lexical/list, @lexical/code | peerDependenciesMeta.optional + external |
| 직접 번들 | @dnd-kit/core, @dnd-kit/sortable, @floating-ui/react, date-fns, prettier, react-day-picker, react-error-boundary | dependencies (번들 포함) |

---

## 6. 현재 문제점 (⚠️)

### 6.1 Optional peer의 정적 import

현재 optional peer 패키지가 여러 파일에서 **정적으로 import** 되고 있다.
이로 인해 사용자가 해당 패키지를 설치하지 않으면 런타임 에러가 발생한다.

**문제 파일 목록:**

| 파일 | 정적 import 대상 |
|------|-----------------|
| `editor/plugins/ToolbarPlugin/utils.ts` | `@lexical/code` (`$createCodeNode`), `@lexical/list` (`INSERT_*_COMMAND`) |
| `editor/plugins/ToolbarPlugin/index.tsx` | `@lexical/code` (`$isCodeNode`, `getCodeLanguageOptions` 등), `@lexical/code-shiki`, `@lexical/list` (`$isListNode`, `ListNode`) |
| `editor/plugins/ComponentPickerPlugin/index.tsx` | `@lexical/code` (`$createCodeNode`), `@lexical/list` (`INSERT_*_COMMAND`), `@lexical/table` (`INSERT_TABLE_COMMAND`) |
| `editor/config/EditorConfig.ts` | `@lexical/code` (`CodeNode` 등), `@lexical/list` (`ListNode` 등), `@lexical/table` (`TableNode` 등) |
| `nodes.ts` | `@lexical/code`, `@lexical/list`, `@lexical/table` 노드 직접 재export |

### 6.2 Feature Registry 미구현

`features/` 디렉토리, `createEditorKit.ts`, `utils/optional.ts`는 **아직 존재하지 않는다.**
이들은 아래 섹션 7에서 설명하는 목표 아키텍처의 일부다.

---

## 7. 목표 아키텍처 — Feature Registry 패턴

> **상태:** 미구현. 아래 내용은 구현 목표 사양이다.

### 7.1 목표 구조 변경

```
packages/editor/src/
├── index.ts                    # loadFeatures 공개 export 추가
├── createEditorKit.ts          # 사용자용 optional feature 설정 헬퍼 (신규)
│
├── features/                   # 선택적 플러그인 모듈 (신규)
│   ├── index.ts                # Feature Registry (dynamic import + 캐시)
│   ├── code/
│   │   └── index.ts            # @lexical/code 전담 모듈
│   ├── list/
│   │   └── index.ts            # @lexical/list 전담 모듈
│   └── table/
│       └── index.ts            # @lexical/table 전담 모듈
│
└── editor/                     # 기존 구현 수정
    ├── plugins/
    │   ├── ToolbarPlugin/      # features.code / features.list 위임으로 변경
    │   ├── ComponentPickerPlugin/ # 동일
    │   └── MarkdownTransformers/  # features 조건부 transformer
    └── config/
        └── EditorConfig.ts     # features.*.getNodes() 사용
```

### 7.2 features/index.ts — 동적 로드 + 캐시

```typescript
type FeatureRegistry = {
  code: typeof import('./code') | null;
  list: typeof import('./list') | null;
  table: typeof import('./table') | null;
};

const registry: FeatureRegistry = { code: null, list: null, table: null };

export type LoadFeaturesOptions = {
  code?: boolean;
  list?: boolean;
  table?: boolean;
};

/** 앱 초기화 시 한 번 호출. 설치된 패키지만 로드된다. */
export async function loadFeatures(options: LoadFeaturesOptions = {}) {
  const { code = true, list = true, table = true } = options;
  await Promise.all([
    code && import('./code').then(m => { registry.code = m; }).catch(() => {}),
    list && import('./list').then(m => { registry.list = m; }).catch(() => {}),
    table && import('./table').then(m => { registry.table = m; }).catch(() => {}),
  ]);
}

/** 동기 접근자 — loadFeatures() 완료 후에만 non-null 보장 */
export const features = {
  get code() { return registry.code; },
  get list() { return registry.list; },
  get table() { return registry.table; },
};
```

### 7.3 features/code/index.ts — @lexical/code 전담

```typescript
// 이 파일은 dynamic import로만 로드된다 (top-level import 금지)
import { $createCodeNode, CodeHighlightNode, CodeNode } from "@lexical/code";
import { $addUpdateTag, $getSelection, LexicalEditor, SKIP_SELECTION_FOCUS_TAG } from "lexical";
import { $setBlocksType } from "@lexical/selection";

export { CodeNode, CodeHighlightNode };

export function getCodeNodes() {
  return [CodeNode, CodeHighlightNode] as const;
}

export function formatCode(editor: LexicalEditor, blockType: string) {
  if (blockType !== "code") {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      const selection = $getSelection();
      if (selection) $setBlocksType(selection, () => $createCodeNode());
    });
  }
}
```

### 7.4 features/list/index.ts — @lexical/list 전담

```typescript
import {
  INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode,
} from "@lexical/list";
import { $addUpdateTag, LexicalEditor, SKIP_SELECTION_FOCUS_TAG } from "lexical";

export { ListNode, ListItemNode };
export { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND };

export function getListNodes() { return [ListNode, ListItemNode] as const; }
export function formatBulletList(editor: LexicalEditor, blockType: string) { /* ... */ }
export function formatCheckList(editor: LexicalEditor, blockType: string) { /* ... */ }
export function formatNumberedList(editor: LexicalEditor, blockType: string) { /* ... */ }
```

### 7.5 플러그인 수정 패턴

**ToolbarPlugin/utils.ts:**
```typescript
// ❌ 현재
import { $createCodeNode } from "@lexical/code";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";

// ✅ 목표
import { features } from "../../features";
export const formatCode = (editor, blockType) => features.code?.formatCode(editor, blockType);
export const formatBulletList = (editor, blockType) => features.list?.formatBulletList(editor, blockType);
```

**ComponentPickerPlugin:**
```typescript
// ❌ 현재
import { $createCodeNode } from "@lexical/code";

// ✅ 목표 — features 조건부 메뉴 항목
...(features.code ? [
  new ComponentPickerOption('Code Block', {
    onSelect: () => features.code?.formatCode(activeEditor, ''),
  }),
] : []),
```

### 7.6 앱 초기화 흐름 (목표)

**패턴 1 — top-level await (Vite / 모던 번들러 권장):**
```typescript
import { loadFeatures } from "lexical-editor-kit";
await loadFeatures({ code: true, list: true, table: true });
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

**패턴 2 — React.lazy + Suspense (범용):**
```typescript
const editorReady = loadFeatures({ code: true, list: true, table: true });
const EditorWithFeatures = React.lazy(() =>
  editorReady.then(() => import("lexical-editor-kit").then(m => ({ default: m.Editor })))
);
```

---

## 8. 수정 대상 파일 목록 (Feature Registry 구현 시)

### 🔴 즉시 수정 (배포 블로커)

| 파일 | 수정 내용 |
|------|-----------|
| `features/index.ts` | Feature Registry 신규 작성 |
| `features/code/index.ts` | `@lexical/code` 로직 전담 모듈 (신규) |
| `features/list/index.ts` | `@lexical/list` 로직 전담 모듈 (신규) |
| `features/table/index.ts` | `@lexical/table` 로직 전담 모듈 (신규) |
| `editor/plugins/ToolbarPlugin/utils.ts` | `@lexical/code`, `@lexical/list` 정적 import 제거 → features 위임 |
| `editor/plugins/ToolbarPlugin/index.tsx` | 동일 |
| `editor/plugins/ComponentPickerPlugin/index.tsx` | 동일 |

### 🟡 후속 수정 (기능 완성도)

| 파일 | 수정 내용 |
|------|-----------|
| `editor/plugins/MarkdownTransformers/index.ts` | features.code 조건부 transformer |
| `editor/config/EditorConfig.ts` | features.*.getNodes() 사용으로 통일 |
| `nodes.ts` | optional 노드 직접 export 제거 → features 위임 |
| `createEditorKit.ts` | loadFeatures() 호출 헬퍼 (신규) |
| `index.ts` | loadFeatures 공개 export 추가 |

---

## 9. 환경 정보

### 9.1 실행 환경
| 항목 | 값 |
|------|-----|
| OS | Windows 11 Pro |
| Node.js | >= 20.19.0 |
| 패키지 매니저 | pnpm (workspaces) |
| 번들러 | Vite (Rollup 기반) |
| TypeScript | ~5.9.3 |
| React | >= 18.2.0 |
| Lexical | >= 0.40.0 |
| 모듈 시스템 | ESM only |
| E2E 테스트 | Playwright (Chromium) |
| CI/CD | 없음 (로컬 빌드/테스트) |

### 9.2 참고 스크립트

| 스크립트 | 설명 |
|----------|------|
| `pnpm dev` | apps/website 개발 서버 (포트 5173) |
| `pnpm dev:editor` | packages/editor Vite 플레이그라운드 |
| `pnpm build` | 전체 빌드 |
| `pnpm build:editor` | 에디터 패키지만 빌드 (`vite build && tsc`) |
| `pnpm build:apps` | apps/website 빌드 |
| `pnpm preview` | 빌드 결과 미리보기 (포트 4173) |
| `pnpm test` | vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright E2E 전체 실행 |
| `pnpm test:e2e:ui` | Playwright UI 모드 |
| `pnpm test:e2e:debug` | Playwright 디버그 모드 |
| `pnpm test:e2e:report` | 마지막 테스트 HTML 리포트 |
| `pnpm test:e2e:no-optional` | optional 미설치 시나리오 테스트 (포트 4174) |

### 9.3 다른 라이브러리와 비교

| 항목 | **lexical-editor-kit (목표)** | **Tiptap** | **Plate.js** |
|------|-------------------------------|------------|--------------|
| optional 기능 격리 | Feature Registry + dynamic import | 별도 npm 패키지 | createPlugins() 레지스트리 |
| 번들 사이즈 제어 | dynamic import code splitting | 패키지 분리 | tree-shaking |
| 런타임 조건부 기능 | `features.code?.formatCode()` | extension 설치 여부 | plugin 포함 여부 |
| 단일 패키지 | ✅ (사용자 편의) | ❌ (패키지 파편화) | ✅ |
