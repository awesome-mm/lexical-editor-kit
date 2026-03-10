# 프로젝트 트리 구조

```
lexical-editor-kit/
├── apps/
│   └── website/                          # 데모/플레이그라운드 앱 (Vite)
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           └── vite-env.d.ts
│
├── packages/
│   └── editor/                           # 핵심 에디터 패키지
│       ├── playground/
│       └── src/
│           ├── index.ts                  # 패키지 진입점
│           ├── createEditorKit.ts        # 에디터 키트 생성 함수
│           ├── EditorRoot.tsx            # 에디터 루트 컴포넌트
│           │
│           ├── features/                 # Optional 기능 모듈
│           │   ├── code.ts
│           │   ├── list.ts
│           │   └── table.ts
│           │
│           ├── utils/
│           │   └── optional.ts           # Optional 패키지 유틸
│           │
│           └── editor/                   # 에디터 코어
│               ├── Editor.tsx            # 메인 에디터 컴포넌트
│               ├── appSettings.ts
│               ├── buildHTMLConfig.tsx
│               │
│               ├── assets/               # 정적 리소스
│               │   ├── emoji/
│               │   ├── icons/
│               │   └── images/
│               │
│               ├── config/               # 에디터 설정
│               │   ├── EditorConfig.ts
│               │   ├── initialEditorState.ts
│               │   ├── initialText.ts
│               │   ├── node/             # 노드 설정
│               │   └── themes/           # 테마 설정
│               │
│               ├── constants/
│               │   └── constants.ts
│               │
│               ├── context/              # React Context
│               │   ├── FlashMessageContext.tsx
│               │   ├── SettingsContext.tsx
│               │   ├── SharedHistoryContext.tsx
│               │   └── ToolbarContext.tsx
│               │
│               ├── data/
│               │   └── data.ts
│               │
│               ├── hooks/                # 커스텀 훅
│               │   ├── useDebounce.ts
│               │   ├── useFlashMessage.tsx
│               │   ├── useModal.tsx
│               │   └── useReport.ts
│               │
│               ├── nodes/               # Lexical 커스텀 노드
│               │   ├── AutocompleteNode/
│               │   ├── EmojiNode/
│               │   ├── ImageNode/
│               │   │   ├── ImageNode.tsx
│               │   │   ├── ImageNode.css
│               │   │   └── ImageComponent/
│               │   ├── KeywordNode/
│               │   ├── LayoutContainerNode/
│               │   ├── LayoutItemNode/
│               │   ├── MentionNode/
│               │   ├── PageBreakNode/
│               │   ├── SpecialTextNode/
│               │   ├── StickyNode/
│               │   │   ├── StickyNode.tsx
│               │   │   ├── StickyNode.css
│               │   │   └── StickyComponent/
│               │   └── YouTubeNode/
│               │
│               ├── plugins/             # Lexical 플러그인
│               │   ├── ActionsPlugin/
│               │   ├── AutocompletePlugin/
│               │   ├── AutoEmbedPlugin/
│               │   ├── AutoLinkPlugin/
│               │   ├── CodeActionMenuPlugin/
│               │   │   └── components/
│               │   │       ├── CopyButton/
│               │   │       └── PrettierButton/
│               │   ├── CodeHighlightPrismPlugin/
│               │   ├── CodeHighlightShikiPlugin/
│               │   ├── CollapsiblePlugin/
│               │   ├── ComponentPickerPlugin/
│               │   ├── ContextMenuPlugin/
│               │   ├── DragDropPastePlugin/
│               │   ├── DraggableBlockPlugin/
│               │   ├── EmojiPickerPlugin/
│               │   ├── EmojisPlugin/
│               │   ├── FloatingLinkEditorPlugin/
│               │   ├── FloatingTextFormatToolbarPlugin/
│               │   ├── ImagesPlugin/
│               │   ├── InsertHTMLPlugin/
│               │   ├── KeywordsPlugin/
│               │   ├── LayoutPlugin/
│               │   ├── LinkPlugin/
│               │   ├── MarkdownShortcutPlugin/
│               │   ├── MarkdownTransformers/
│               │   ├── MaxLengthPlugin/
│               │   ├── MentionsPlugin/
│               │   ├── PageBreakPlugin/
│               │   ├── PasteLogPlugin/
│               │   ├── ShortcutsPlugin/
│               │   ├── SpecialTextPlugin/
│               │   ├── StickyPlugin/
│               │   ├── TabFocusPlugin/
│               │   ├── TableActionMenuPlugin/
│               │   ├── TableCellResizer/
│               │   ├── TableHoverActionsV2Plugin/
│               │   │   └── dnd/
│               │   ├── TableOfContentsPlugin/
│               │   ├── TableScrollShadowPlugin/
│               │   ├── TestRecorderPlugin/
│               │   ├── ToolbarPlugin/
│               │   ├── TreeViewPlugin/
│               │   ├── TypingPerfPlugin/
│               │   └── YouTubePlugin/
│               │
│               ├── provider/
│               │   └── EditorContextProvider.tsx
│               │
│               ├── style/               # 글로벌 스타일
│               │   ├── editor.css
│               │   └── style.css
│               │
│               ├── types/
│               │   └── global.d.ts
│               │
│               ├── ui/                  # 공통 UI 컴포넌트
│               │   ├── Button.tsx
│               │   ├── ColorPicker.tsx
│               │   ├── ContentEditable.tsx
│               │   ├── Dialog.tsx
│               │   ├── DropDown.tsx
│               │   ├── DropdownColorPicker.tsx
│               │   ├── FileInput.tsx
│               │   ├── FlashMessage.tsx
│               │   ├── ImageResizer.tsx
│               │   ├── Modal.tsx
│               │   ├── Placeholder.tsx
│               │   ├── Select.tsx
│               │   ├── Switch.tsx
│               │   └── TextInput.tsx
│               │
│               └── utils/               # 유틸리티 함수
│                   ├── debounce.ts
│                   ├── docSerialization.ts
│                   ├── emoji-list.ts
│                   ├── focusUtils.ts
│                   ├── getDOMRangeRect.ts
│                   ├── getSelectedNode.ts
│                   ├── getThemeSelector.ts
│                   ├── insertHTML.ts
│                   ├── joinClasses.ts
│                   ├── setFloatingElemPosition.ts
│                   ├── setFloatingElemPositionForLinkEditor.ts
│                   ├── swipe.ts
│                   ├── url.ts
│                   ├── utils.ts
│                   └── uuid.ts
│
├── e2e/                                 # E2E 테스트 (Playwright)
│   ├── editor-load.spec.ts
│   ├── features-insert.spec.ts
│   ├── features-toolbar.spec.ts
│   └── optional-missing.spec.ts
│
├── package.json
├── pnpm-workspace.yaml                  # pnpm 모노레포 설정
├── tsconfig.json
├── eslint.config.js
├── playwright.config.ts
├── ARCHITECTURE.md
├── AGENTS.md
└── README.md
```
