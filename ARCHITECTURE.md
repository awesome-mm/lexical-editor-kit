# ARCHITECTURE.md — lexical-editor-kit 아키텍처

---

## 1. 핵심 설계 원칙

### 1.1 Lexical Singleton
- Lexical은 **싱글톤**을 전제로 동작한다.
- 라이브러리 번들에 Lexical을 포함하면 multiple instance 버그가 발생한다.
- 모든 Lexical 패키지는 `peerDependencies`로 선언하고, Vite `external`로 번들에서 제외한다.

### 1.2 Optional Package = 선택적 플러그인
- `@lexical/code`, `@lexical/list`, `@lexical/table`, `@lexical/yjs`, `yjs` 는 **사용자가 직접 설치하는 선택적 패키지**다.
- 이 패키지들을 **라이브러리 메인 번들이 정적으로 import 해서는 안 된다.**
- 미설치 사용자는 해당 기능 없이 에디터가 동작해야 한다.
- 설치 사용자는 별도 설정 없이 해당 기능이 자동 활성화되어야 한다.

### 1.3 번들 크기 목표
| 상태 | 번들 크기 |
|------|-----------|
| 현재 (정적 import) | ~20MB |
| 목표 (dynamic import + feature 분리) | ~2MB |

---

## 2. 프로젝트 구조

```
packages/editor/src/
├── index.ts                    # 공개 API 진입점
├── createEditorKit.ts          # 사용자용 optional feature 설정 헬퍼
│
├── features/                   # 선택적 플러그인 모듈 (핵심)
│   ├── code/
│   │   └── index.ts            # @lexical/code 의존, formatCode + nodes + commands
│   ├── list/
│   │   └── index.ts            # @lexical/list 의존, formatList/BulletList + nodes + commands
│   ├── table/
│   │   └── index.ts            # @lexical/table 의존, TableFeaturePlugins + nodes
│   └── index.ts                # Feature Registry (dynamic import + 캐시)
│
├── utils/
│   └── optional.ts             # (제거 예정 또는 CJS 전용으로 범위 축소)
│
└── editor/                     # 에디터 내부 구현
    ├── Editor.tsx               # TableFeatureLazy는 유지, yjs 정적 import 제거
    ├── config/
    │   ├── EditorConfig.ts      # features.getNodes() 사용
    │   └── node/PlaygroundNodes.ts
    ├── plugins/
    │   ├── ToolbarPlugin/
    │   │   ├── utils.ts         # features.code / features.list 통해 접근
    │   │   └── index.tsx        # features.code / features.list 조건부 렌더
    │   ├── ComponentPickerPlugin/
    │   │   └── index.tsx        # features.code / features.list 조건부 메뉴 항목
    │   ├── MarkdownTransformers/
    │   │   └── index.ts         # features.code / features.table 조건부 transformer
    │   └── ...
    └── nodes/
```

---

## 3. Feature Registry 패턴 (핵심 설계)

### 3.1 features/index.ts — 동적 로드 + 캐시

```typescript
// features/index.ts

type FeatureRegistry = {
  code: typeof import('./code') | null;
  list: typeof import('./list') | null;
  table: typeof import('./table') | null;
};

const registry: FeatureRegistry = {
  code: null,
  list: null,
  table: null,
};

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

### 3.2 features/code/index.ts — @lexical/code 전담 모듈

```typescript
// features/code/index.ts
// 이 파일은 dynamic import로만 로드된다 (top-level import 금지)

import { $createCodeNode, CodeHighlightNode, CodeNode } from "@lexical/code";
import {
  $addUpdateTag, $getSelection, $isRangeSelection,
  LexicalEditor, SKIP_SELECTION_FOCUS_TAG,
} from "lexical";
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

### 3.3 features/list/index.ts — @lexical/list 전담 모듈

```typescript
// features/list/index.ts
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode, ListNode,
} from "@lexical/list";
import { $addUpdateTag, LexicalEditor, SKIP_SELECTION_FOCUS_TAG } from "lexical";

export { ListNode, ListItemNode };
export { INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND };

export function getListNodes() {
  return [ListNode, ListItemNode] as const;
}

export function formatBulletList(editor: LexicalEditor, blockType: string) {
  if (blockType !== "bullet") {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    });
  }
}

export function formatCheckList(editor: LexicalEditor, blockType: string) {
  if (blockType !== "check") {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    });
  }
}

export function formatNumberedList(editor: LexicalEditor, blockType: string) {
  if (blockType !== "number") {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    });
  }
}
```

---

## 4. 플러그인 수정 패턴

### 4.1 ToolbarPlugin/utils.ts — 정적 import 제거

```typescript
// ❌ 현재 (런타임 에러 위험)
import { $createCodeNode } from "@lexical/code";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";

export const formatCode = (editor, blockType) => {
  editor.update(() => {
    $setBlocksType(selection, () => $createCodeNode()); // 직접 사용
  });
};

// ✅ 수정 후 (feature 위임)
import { features } from "../../features";

export const formatCode = (editor: LexicalEditor, blockType: string) => {
  features.code?.formatCode(editor, blockType);
};

export const formatBulletList = (editor: LexicalEditor, blockType: string) => {
  features.list?.formatBulletList(editor, blockType);
};
```

### 4.2 ComponentPickerPlugin — 조건부 메뉴 항목

```typescript
// ❌ 현재
import { $createCodeNode } from "@lexical/code";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";

// ✅ 수정 후
import { features } from "../../features";

const getOptions = () => [
  // 항상 노출
  new ComponentPickerOption('Heading 1', { ... }),

  // features.code 설치 시에만 노출
  ...(features.code ? [
    new ComponentPickerOption('Code Block', {
      onSelect: () => features.code?.formatCode(activeEditor, ''),
    }),
  ] : []),

  // features.list 설치 시에만 노출
  ...(features.list ? [
    new ComponentPickerOption('Bullet List', {
      onSelect: () => editor.dispatchCommand(features.list!.INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
  ] : []),
];
```

### 4.3 Editor.tsx — yjs top-level import 제거

```typescript
// ❌ 현재
import { Doc } from "yjs"; // optional peer를 정적으로 import

// ✅ 수정 후 — 사용하는 곳에서 동적 로드
// yjs를 실제로 쓰는 협업(collab) 관련 플러그인 내부에서만 dynamic import
```

### 4.4 MarkdownTransformers — @lexical/code 조건부 transformer

```typescript
// 현재 getOptionalTable() 사용 중 — 동일 패턴을 code/list에도 적용
// features.code가 있을 때만 코드 관련 Transformer를 배열에 포함
const transformers = [
  ...ELEMENT_TRANSFORMERS,
  ...(features.code ? [CODE_TRANSFORMER] : []),
  ...(features.table ? [TABLE_TRANSFORMER] : []),
];
```

---

## 5. 앱 초기화 흐름

> `loadFeatures()`는 비동기 함수다. top-level await는 Vite(ESM) 환경에서 지원되지만,
> 구형 환경을 고려해 아래 두 가지 패턴 중 하나를 사용한다.

**패턴 1 — top-level await (Vite / 모던 번들러 권장):**
```typescript
// apps/website/src/main.tsx
import { loadFeatures } from "lexical-editor-kit";

await loadFeatures({ code: true, list: true, table: true });

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

**패턴 2 — React.lazy + Suspense (범용):**
```typescript
// 컴포넌트 외부에서 한 번만 실행
const editorReady = loadFeatures({ code: true, list: true, table: true });

const EditorWithFeatures = React.lazy(() =>
  editorReady.then(() => import("lexical-editor-kit").then(m => ({ default: m.Editor })))
);

// JSX
<Suspense fallback={<div>Loading editor...</div>}>
  <EditorWithFeatures />
</Suspense>
```

---

## 6. 빌드 구조

| 출력 파일 | 포맷 | 내용 |
|-----------|------|------|
| `dist/index.es.js` | ESM | 메인 에디터 |
| `dist/index.cjs.js` | CJS | 동일 |
| `dist/index.d.ts` | 타입 | 공개 API 타입 |
| `dist/index.css` | CSS | 에디터 스타일 |

**번들에서 제외 (external):**
`react`, `react-dom`, `react/jsx-runtime`, `lexical`, `@lexical/*`, `yjs`

**Dynamic import로 분리 (chunk 분할):**
`features/code`, `features/list`, `features/table` → Rollup이 별도 chunk로 분리

> ⚠️ **현재 `vite.config.ts`의 `inlineDynamicImports: true` 설정 제거 필수**
>
> ```typescript
> // ❌ 현재 설정 — dynamic import를 메인 번들에 인라인 병합
> output: {
>   inlineDynamicImports: true,  // 이 설정이 feature chunk 분리를 막는다
> }
>
> // ✅ 수정 후 — 제거하면 Rollup이 dynamic import를 자동으로 별도 chunk로 분리
> output: {
>   // inlineDynamicImports 없음
> }
> ```
>
> 이 설정이 남아 있으면 `loadFeatures()`의 `import('./code')` 등이 모두 메인 번들에 포함되어
> Feature Registry 아키텍처가 의미 없어진다.

---

## 7. 의존성 분류

| 분류 | 패키지 | 처리 |
|------|--------|------|
| 필수 peer | react, react-dom, lexical, @lexical/react, @lexical/rich-text 등 | peerDependencies + external |
| Optional peer | @lexical/table, @lexical/list, @lexical/code, @lexical/yjs, yjs | peerDependenciesMeta.optional + external + **feature 모듈 내부에서만** 정적 import |
| 직접 번들 | @dnd-kit/core, katex, date-fns, @floating-ui/react 등 | dependencies (번들 포함) |

---

## 8. 다른 라이브러리와 비교

| 항목 | **lexical-editor-kit (목표)** | **Tiptap** | **Plate.js** |
|------|-------------------------------|------------|--------------|
| optional 기능 격리 | Feature Registry + dynamic import | 별도 npm 패키지 | createPlugins() 레지스트리 |
| 번들 사이즈 제어 | dynamic import code splitting | 패키지 분리 | tree-shaking |
| 런타임 조건부 기능 | `features.code?.formatCode()` | extension 설치 여부 | plugin 포함 여부 |
| 단일 패키지 | ✅ (사용자 편의) | ❌ (패키지 파편화) | ✅ |

---

## 9. 수정 대상 파일 목록

| 파일 | 수정 내용 |
|------|-----------|
| `features/index.ts` | Feature Registry 신규 작성 |
| `features/code/index.ts` | @lexical/code 로직 이전 (신규) |
| `features/list/index.ts` | @lexical/list 로직 이전 (신규) |
| `features/table/index.ts` | @lexical/table 로직 이전 (기존 리팩터) |
| `src/features/code.ts`, `src/features/list.ts`, `src/features/table.ts` | 삭제 (새 구조 `src/features/*/index.ts`로 대체) |
| `utils/optional.ts` | CJS 전용으로 범위 축소 또는 삭제 |
| `editor/Editor.tsx` | `import { Doc } from "yjs"` 제거 |
| `editor/plugins/ToolbarPlugin/utils.ts` | @lexical/code, @lexical/list 정적 import 제거 → features 위임 |
| `editor/plugins/ToolbarPlugin/index.tsx` | 동일 |
| `editor/plugins/ComponentPickerPlugin/index.tsx` | 동일 |
| `editor/plugins/MarkdownTransformers/index.ts` | features 조건부 transformer |
| `editor/config/EditorConfig.ts` | features.*.getNodes() 사용 |
| `createEditorKit.ts` | loadFeatures() 호출로 재설계 |
| `index.ts` | loadFeatures 공개 export 추가 |
