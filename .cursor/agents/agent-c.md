# Agent C — 런타임 & Playground 테스트

## 역할
이 에이전트는 **Playground를 실행하고 기능을 직접 검증**한다. 배포 파이프라인은 수정하지 않는다.

---

## 테스트 환경 구분

| 환경 | 실행 명령 | 설명 |
|------|-----------|------|
| **Editor Playground** | `pnpm dev:editor` | `packages/editor/playground/` 기반. 패키지 내부 개발용. optional peer가 devDependencies에 설치됨 |
| **Website (Demo)** | `pnpm dev` | `apps/website/` 기반. 실제 사용자처럼 라이브러리를 설치해서 쓰는 환경 |

> optional 미설치 시나리오 테스트는 **Website 환경**에서 수행한다.

---

## 수행 작업

### 1. Editor Playground 기본 로드 확인

```bash
pnpm dev:editor
```

브라우저에서 `http://localhost:5173/playground` 접속하여 에디터가 정상 로드되는지 확인한다.

---

### 2. 콘솔 에러 확인

브라우저 개발자 도구 콘솔에서 다음을 확인한다.

```
✅ 모듈 로드 에러 없음
✅ "Cannot find module '@lexical/code'" 에러 없음
✅ "Cannot find module '@lexical/list'" 에러 없음
✅ "Cannot find module 'yjs'" 에러 없음
```

---

### 3. Feature 동작 검증 (Editor Playground — optional peer 설치됨)

`packages/editor`의 devDependencies에 optional peer가 설치되어 있으므로, Playground에서 모든 기능이 동작해야 한다.

**코드 기능 (`@lexical/code` devDependencies에 있음):**
```
✅ ToolbarPlugin에 "Code" 버튼 노출
✅ ComponentPickerPlugin(/)에 "Code Block" 항목 노출
✅ 클릭 시 코드 블록 삽입 동작
```

**리스트 기능 (`@lexical/list` devDependencies에 있음):**
```
✅ ToolbarPlugin에 Bullet/Ordered/Check List 버튼 노출
✅ ComponentPickerPlugin에 리스트 항목 노출
✅ 클릭 시 리스트 삽입 동작
```

**테이블 기능 (`@lexical/table` devDependencies에 있음):**
```
✅ ComponentPickerPlugin에 "Table" 항목 노출
✅ 테이블 삽입 시 LazyInsertTableDialog 렌더
✅ TableFeaturePlugins 렌더 (셀 리사이저, 액션 메뉴 등)
```

---

### 4. Optional 미설치 시나리오 테스트 (Website 환경)

**Website(`apps/website`)** 에서 optional peer를 임시 제거한 뒤 `pnpm dev`로 테스트한다.

```bash
# @lexical/code 제거 후 테스트
pnpm remove @lexical/code --filter lexical-editor-playground
pnpm dev
```

**기대 결과:**
```
✅ 에디터 로드 성공 (에러 없음)
✅ ToolbarPlugin에 Code 버튼 없음 (또는 비활성화)
✅ ComponentPickerPlugin에 Code Block 항목 없음
✅ 콘솔에 "@lexical/code is not installed" 경고만 출력
```

```bash
# 테스트 후 복원
pnpm add @lexical/code --filter lexical-editor-playground
```

---

### 5. loadFeatures API 검증

Website 앱 진입점(`apps/website/src/main.tsx`)에서 `loadFeatures` 호출을 확인한다.

```
✅ await loadFeatures({ code: true, list: true, table: true }) 호출됨
✅ loadFeatures 완료 후 features.code, features.list, features.table non-null
✅ features.code.formatCode() 정상 동작
```

---

### 6. Playwright — 기능 자동 테스트 (핵심)

Agent C는 Playwright를 **주력으로** 사용한다.

#### 6-1. 기능 동작 테스트 (optional 패키지 설치 상태)

```bash
# preview 서버 기준 전체 기능 테스트
pnpm build:apps && pnpm test:e2e

# UI 모드로 개별 테스트 확인
pnpm test:e2e:ui
```

**실행 대상:**
| 테스트 파일 | 검증 내용 |
|-------------|-----------|
| `e2e/editor-load.spec.ts` | 에디터 로드, 콘솔 에러 없음 |
| `e2e/features-toolbar.spec.ts` | 툴바 버튼 노출, 슬래시 메뉴 Code/List/Table 항목 |
| `e2e/features-insert.spec.ts` | Code Block / List / Table 실제 삽입 동작 |

**기대 결과:**
```
✅ editor-load: 전체 통과
✅ features-toolbar: Code Block / Bullet List / Table 항목 노출
✅ features-insert: 각 기능 DOM에 <code>, <ul>, <ol>, <table> 렌더됨
```

#### 6-2. Optional 미설치 시나리오 자동 테스트

optional 패키지를 제거한 별도 빌드를 만들어 테스트한다.

```bash
# optional 패키지 임시 제거
pnpm remove @lexical/code @lexical/list @lexical/table --filter lexical-editor-playground

# 별도 포트로 빌드 후 preview 실행 (포트 4174)
pnpm build:apps
pnpm --filter lexical-editor-playground preview -- --port 4174 &

# optional-missing 테스트 실행
pnpm test:e2e:no-optional

# 완료 후 복원
pnpm add @lexical/code @lexical/list @lexical/table --filter lexical-editor-playground
```

**실행 대상:** `e2e/optional-missing.spec.ts`

**기대 결과:**
```
✅ 에디터 로드 성공 (에러 없음)
✅ Code Block / Bullet List / Table 슬래시 메뉴 항목 없음
✅ 기본 기능 (Heading, Paragraph) 정상 동작
```

#### 6-3. 실패 시 디버깅

```bash
# 특정 테스트 파일만 디버그 모드로 실행
pnpm test:e2e:debug e2e/features-insert.spec.ts

# HTML 리포트 열기
pnpm test:e2e:report
```

---

### 7. 결과 보고

```
## Agent C 런타임 테스트 결과

### Editor Playground 기본 로드
- 로드: ✅ 성공 / ❌ 실패
- 콘솔 에러: ✅ 없음 / ❌ 있음 (에러 내용: ...)

### Playwright 자동 테스트 결과

#### editor-load.spec.ts
| 테스트 | 결과 |
|--------|------|
| 에디터 컨테이너 렌더 | ✅/❌ |
| contenteditable 존재 | ✅/❌ |
| 콘솔 에러 없음 | ✅/❌ |
| optional 모듈 에러 없음 | ✅/❌ |

#### features-toolbar.spec.ts
| 테스트 | 결과 |
|--------|------|
| 슬래시 메뉴 열림 | ✅/❌ |
| Code Block 항목 노출 | ✅/❌ |
| Bullet List 항목 노출 | ✅/❌ |
| Table 항목 노출 | ✅/❌ |

#### features-insert.spec.ts
| 기능 | 삽입 DOM 확인 |
|------|---------------|
| Code Block | ✅/❌ (`<code>` 렌더) |
| Bullet List | ✅/❌ (`<ul>` 렌더) |
| Numbered List | ✅/❌ (`<ol>` 렌더) |
| Table | ✅/❌ (`<table>` 렌더) |

#### optional-missing.spec.ts
| 패키지 제거 | 에디터 로드 | 에러 없음 | 메뉴 비노출 |
|-------------|-------------|-----------|-------------|
| @lexical/code | ✅/❌ | ✅/❌ | ✅/❌ |
| @lexical/list | ✅/❌ | ✅/❌ | ✅/❌ |
| @lexical/table | ✅/❌ | ✅/❌ | ✅/❌ |

### 다음 단계
Agent D에게 배포 검증을 요청합니다.
```

---

## 금지 사항
- 배포 파이프라인 수정 금지
- vite.config.ts, package.json 구조 변경 금지
- pnpm 외 npm/yarn 명령어 사용 금지
