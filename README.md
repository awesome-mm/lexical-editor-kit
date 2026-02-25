# Lexical Editor Kit

이 레포지토리는 [Lexical](https://lexical.dev/) 에디터를 기반으로 합니다. Lexical은 Meta에서 만든 확장 가능한 웹 텍스트 에디터 프레임워크입니다.

## 이 프로젝트를 만든 이유

Lexical은 확장성이 넓고 강력하지만, 초기 설정과 테이블·리스트·코드 블록 같은 기능을 붙이는 과정이 꽤 어렵다고 느꼈습니다.  
**단순한 설정으로 설치해서 바로 쓸 수 있는 에디터**를 만드는 것이 이 프로젝트의 목적입니다.

이 코드는 **오픈소스**이며, 누구나 자유롭게 사용할 수 있습니다.

## 데모

- **플레이그라운드 (배포):** [https://lexical-editor-kit-playground.vercel.app/](https://lexical-editor-kit-playground.vercel.app/)

## 레포지토리 구조

| 경로 | 설명 |
|------|------|
| **`apps/website`** | 에디터 패키지를 **실제로 설치해서 사용**하는 웹 앱입니다. 배포된 플레이그라운드가 이 앱을 기반으로 합니다. |
| **`packages/editor`** | **npm에 배포되는 에디터 패키지** (`lexical-editor-kit`) 코드가 들어 있습니다. 동시에 Vite 기반 **개발용 플레이그라운드**가 포함되어 있어, npm 배포 없이 로컬에서 패키지를 수정하면서 바로 확인할 수 있습니다. |

## 참고 자료

- [Lexical 공식 사이트](https://lexical.dev/)
- [Lexical Playground](https://playground.lexical.dev/) — 이 프로젝트의 UI/기능 구성 시 참고했습니다.
- [Lexical 문서 (Introduction)](https://lexical.dev/docs/intro) — 에디터 개념과 수정 방법을 문서로 학습할 수 있습니다.

---

## 설치 방법

현재 패키지는 **npm에 배포되어 있지 않습니다.** 아래 방법 중 하나로 사용할 수 있습니다.

### 1) 모노레포 내부에서 사용 (workspace)

이 레포지토리를 클론한 뒤, `apps/website`에서 `lexical-editor-kit`을 workspace 프로토콜로 의존합니다.

```json
{
  "dependencies": {
    "lexical-editor-kit": "workspace:*"
  }
}
```

### 2) npm 배포 후 설치 (추후)

npm에 배포한 뒤에는 다음처럼 설치할 수 있습니다.

```bash
# npm
npm install lexical-editor-kit

# pnpm
pnpm add lexical-editor-kit

# yarn
yarn add lexical-editor-kit
```

---

## 프로젝트 실행 방법

필수: [Node.js](https://nodejs.org/)와 [pnpm](https://pnpm.io/)이 설치되어 있어야 합니다.

```bash
# 의존성 설치
pnpm install

# 플레이그라운드(웹 앱) 개발 서버 실행 — apps/website 기반
pnpm dev

# 에디터 패키지(packages/editor)만 Vite로 개발 — 패키지 수정 시 사용
pnpm dev:editor
```

### 기타 스크립트

```bash
# 에디터 패키지 빌드
pnpm build:editor

# 플레이그라운드 빌드
pnpm build:apps

# 플레이그라운드 빌드 결과 미리보기
pnpm preview

# 린트
pnpm lint

# 테스트
pnpm test
```

---

에디터 확장·커스터마이징 방법은 [Lexical 문서](https://lexical.dev/docs/intro)를 참고
깃허브 [Github 문서](https://github.com/facebook/lexical)를 참고
