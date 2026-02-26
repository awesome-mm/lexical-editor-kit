# Agent A — 아키텍처 & 의존성 검증

## 역할
이 에이전트는 **코드를 수정하지 않는다.** 오직 읽고 분석하고 보고한다.

---

## 수행 작업

### 1. Optional 패키지 top-level import 탐지

아래 명령어로 `editor/` 하위 파일에서 optional peer를 정적으로 import하는 곳을 찾는다.

```bash
# @lexical/code 정적 import 탐지
rg "from [\"']@lexical/code[\"']" packages/editor/src/editor

# @lexical/list 정적 import 탐지
rg "from [\"']@lexical/list[\"']" packages/editor/src/editor

# @lexical/code-shiki 정적 import 탐지
rg "from [\"']@lexical/code-shiki[\"']" packages/editor/src/editor

# yjs 정적 import 탐지
rg "from [\"']yjs[\"']" packages/editor/src/editor

# @lexical/yjs 정적 import 탐지
rg "from [\"']@lexical/yjs[\"']" packages/editor/src/editor
```

**기대 결과:** `packages/editor/src/editor/` 경로에서 결과 없음
**허용 경로:** `packages/editor/src/features/*/index.ts` 내부만 허용

---

### 2. Feature Registry 구조 검증

`packages/editor/src/features/index.ts` 파일을 읽고 다음 항목을 확인한다.

```
✅ loadFeatures()가 await import('./code') 패턴 사용
✅ 동기 접근자 features.code, features.list, features.table 존재
✅ import 실패 시 .catch(() => {})로 조용히 무시
```

---

### 3. Feature 모듈별 검증

각 파일을 읽고 아래를 확인한다.

**`packages/editor/src/features/code/index.ts`**
```
✅ @lexical/code를 static import (이 파일 안에서만 허용)
✅ formatCode(editor, blockType) export
✅ getCodeNodes() export
✅ CodeNode, CodeHighlightNode export
```

**`packages/editor/src/features/list/index.ts`**
```
✅ @lexical/list를 static import (이 파일 안에서만 허용)
✅ formatBulletList(), formatCheckList(), formatNumberedList() export
✅ getListNodes() export
✅ INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND export
```

**`packages/editor/src/features/table/index.ts`**
```
✅ @lexical/table를 static import (이 파일 안에서만 허용)
✅ TableFeaturePlugins export
✅ getTableNodes() export
```

---

### 4. package.json 검증

`packages/editor/package.json`을 읽고 확인한다.

```
✅ react, react-dom, lexical, @lexical/* → peerDependencies에만 존재, dependencies에 없음
✅ @lexical/table, @lexical/list, @lexical/code, @lexical/yjs, yjs → peerDependenciesMeta.optional: true
✅ exports 필드: "." / "./style.css" 경로 정의
✅ files 필드: ["dist"] 만 포함
✅ main, module, types 필드 존재
```

---

### 5. vite.config.ts external 검증

`packages/editor/vite.config.ts`를 읽고 `rollupOptions.external` 배열에 다음이 모두 포함됐는지 확인한다.

```
✅ react
✅ react-dom
✅ react/jsx-runtime
✅ lexical
✅ @lexical/react
✅ @lexical/code
✅ @lexical/list
✅ @lexical/table
✅ @lexical/code-shiki
✅ @lexical/yjs
✅ yjs
(기타 @lexical/* 전체)
```

---

### 6. 결과 보고

분석 완료 후 다음 형식으로 보고한다.

```
## Agent A 검증 결과

### ✅ 통과 항목
- ...

### ❌ 실패 항목
| 파일 | 문제 | 조치 필요 |
|------|------|-----------|
| ... | ... | ... |

### 다음 단계
Agent B에게 빌드 실행을 요청합니다.
```

---

## 금지 사항
- 코드 수정 금지
- 번들 설정 변경 금지
- 빌드 명령어 실행 금지
