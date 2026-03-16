# Lexical Editor Kit

A ready-to-use rich text editor built on top of [Lexical](https://lexical.dev/) — Meta's extensible text editor framework.

> **Built with the open-source [Lexical Playground](https://playground.lexical.dev/) as a reference.**
> If you're familiar with Lexical, you can **customize every plugin, node, and context** provided by this kit to build your own editor from scratch.

## Demo

[Live Playground](https://lexical-editor-kit-playground.vercel.app/)

---

## Installation

```bash
npm install lexical-editor-kit
```

You also need to install Lexical peer dependencies:

```bash
npm install lexical @lexical/react @lexical/rich-text @lexical/html @lexical/clipboard \
  @lexical/markdown @lexical/mark @lexical/overflow @lexical/history @lexical/link \
  @lexical/selection @lexical/utils @lexical/extension @lexical/file @lexical/hashtag \
  @lexical/code-shiki react react-dom
```

**Optional packages** (install only the features you need):

```bash
npm install @lexical/table   # Table support
npm install @lexical/list    # List support (bullet, numbered, checklist)
npm install @lexical/code    # Code block support
```

---

## Quick Start

### Option 1: Use the Playground Editor (Fastest)

Drop in a fully-configured editor with all plugins and nodes pre-wired:

```tsx
import { PlaygroundEditorRoot, PlaygroundEditorPlugin } from "lexical-editor-kit/playground";
import { EditorContextProvider, PlaygroundNodes } from "lexical-editor-kit/playground";
import "lexical-editor-kit/index.css";

function App() {
  return (
    <EditorContextProvider>
      <PlaygroundEditorRoot nodes={PlaygroundNodes}>
        <PlaygroundEditorPlugin />
      </PlaygroundEditorRoot>
    </EditorContextProvider>
  );
}
```

### Option 2: Build Your Own Editor with `createEditor`

Pick only the plugins and nodes you need:

```tsx
import { createEditor } from "lexical-editor-kit";
import { AutoLinkPlugin, CollapsiblePlugin, ImagesPlugin } from "lexical-editor-kit/plugins";
import { HeadingNode, QuoteNode, ImageNode } from "lexical-editor-kit/nodes";
import { SettingsContext, SharedHistoryContext } from "lexical-editor-kit/providers";
import "lexical-editor-kit/index.css";

const MyEditor = createEditor({
  nodes: [HeadingNode, QuoteNode, ImageNode],
  plugins: [AutoLinkPlugin, CollapsiblePlugin, ImagesPlugin],
  providers: [SettingsContext, SharedHistoryContext],
});

function App() {
  return <MyEditor />;
}
```

### Option 3: Use the `EditorBuilder` (Fluent API)

```tsx
import { EditorBuilder } from "lexical-editor-kit";
import { CollapsiblePlugin, ImagesPlugin } from "lexical-editor-kit/plugins";
import { HeadingNode, ImageNode } from "lexical-editor-kit/nodes";
import { SettingsContext } from "lexical-editor-kit/providers";
import "lexical-editor-kit/index.css";

const MyEditor = new EditorBuilder()
  .usePlugin(CollapsiblePlugin)
  .usePlugin(ImagesPlugin)
  .useNode(HeadingNode)
  .useNode(ImageNode)
  .useProvider(SettingsContext)
  .build();

function App() {
  return <MyEditor />;
}
```

---

## Customization

> This library is built on top of the **open-source Lexical Playground**.
> Every plugin, node, and context is exported individually — if you know how Lexical works,
> you can **mix, match, extend, or replace** any component to create a fully custom editor.
>
> See the [Lexical Documentation](https://lexical.dev/docs/intro) and
> [Lexical GitHub](https://github.com/facebook/lexical) for details on the core framework.

---

## Available Plugins

All plugins are available via `lexical-editor-kit/plugins`.

| Plugin | Description |
|--------|-------------|
| [AutocompletePlugin](packages/editor/src/editor/plugins/AutocompletePlugin) | Text autocomplete suggestions |
| [AutoEmbedPlugin](packages/editor/src/editor/plugins/AutoEmbedPlugin) | Auto-embed URLs (YouTube, etc.) |
| [AutoLinkPlugin](packages/editor/src/editor/plugins/AutoLinkPlugin) | Auto-detect and linkify URLs |
| [CodeActionMenuPlugin](packages/editor/src/editor/plugins/CodeActionMenuPlugin) | Action menu for code blocks |
| [CodeHighlightPrismPlugin](packages/editor/src/editor/plugins/CodeHighlightPrismPlugin) | Code syntax highlighting (Prism) |
| [CodeHighlightShikiPlugin](packages/editor/src/editor/plugins/CodeHighlightShikiPlugin) | Code syntax highlighting (Shiki) |
| [CollapsiblePlugin](packages/editor/src/editor/plugins/CollapsiblePlugin) | Collapsible/accordion blocks |
| [ComponentPickerPlugin](packages/editor/src/editor/plugins/ComponentPickerPlugin) | Slash command menu (`/`) |
| [ContextMenuPlugin](packages/editor/src/editor/plugins/ContextMenuPlugin) | Right-click context menu |
| [DragDropPastePlugin](packages/editor/src/editor/plugins/DragDropPastePlugin) | Drag & drop file/image paste |
| [DraggableBlockPlugin](packages/editor/src/editor/plugins/DraggableBlockPlugin) | Drag handle for blocks |
| [EmojiPickerPlugin](packages/editor/src/editor/plugins/EmojiPickerPlugin) | Emoji picker (`:` trigger) |
| [EmojisPlugin](packages/editor/src/editor/plugins/EmojisPlugin) | Emoji rendering support |
| [FloatingLinkEditorPlugin](packages/editor/src/editor/plugins/FloatingLinkEditorPlugin) | Floating link editor popup |
| [ImagesPlugin](packages/editor/src/editor/plugins/ImagesPlugin) | Image insert & resize |
| [InsertHTMLPlugin](packages/editor/src/editor/plugins/InsertHTMLPlugin) | Insert raw HTML content |
| [KeywordsPlugin](packages/editor/src/editor/plugins/KeywordsPlugin) | Keyword highlighting |
| [LayoutPlugin](packages/editor/src/editor/plugins/LayoutPlugin) | Multi-column layouts |
| [LightToolbarPlugin](packages/editor/src/editor/plugins/LightToolbarPlugin) | Minimal toolbar |
| [LinkPlugin](packages/editor/src/editor/plugins/LinkPlugin) | Link support |
| [ListMaxIndentLevelPlugin](packages/editor/src/editor/plugins/ListMaxIndentLevelPlugin) | Limit list indent depth |
| [MarkdownShortcutPlugin](packages/editor/src/editor/plugins/MarkdownShortcutPlugin) | Markdown shortcuts |
| [MentionsPlugin](packages/editor/src/editor/plugins/MentionsPlugin) | `@mention` support |
| [PageBreakPlugin](packages/editor/src/editor/plugins/PageBreakPlugin) | Page break insertion |
| [SpecialTextPlugin](packages/editor/src/editor/plugins/SpecialTextPlugin) | Special text formatting |
| [StickyPlugin](packages/editor/src/editor/plugins/StickyPlugin) | Sticky note blocks |
| [TabFocusPlugin](packages/editor/src/editor/plugins/TabFocusPlugin) | Tab key focus management |
| [TableActionMenuPlugin](packages/editor/src/editor/plugins/TableActionMenuPlugin) | Table right-click actions |
| [TableCellResizerPlugin](packages/editor/src/editor/plugins/TableCellResizer) | Table column/row resizing |
| [TableExcelPastePlugin](packages/editor/src/editor/plugins/TableExcelPastePlugin) | Excel paste with cell styles (background color, font color, font size, bold/italic, text alignment, column widths, row heights) |
| [TableHoverActionsV2Plugin](packages/editor/src/editor/plugins/TableHoverActionsV2Plugin) | Table hover add row/column |
| [TableOfContentsPlugin](packages/editor/src/editor/plugins/TableOfContentsPlugin) | Table of contents sidebar |
| [TableScrollShadowPlugin](packages/editor/src/editor/plugins/TableScrollShadowPlugin) | Table horizontal scroll shadow |
| [YouTubePlugin](packages/editor/src/editor/plugins/YouTubePlugin) | YouTube embed support |

---

## Available Nodes

All nodes are available via `lexical-editor-kit/nodes`.

### Lexical Built-in Nodes

| Node | Package |
|------|---------|
| [HeadingNode, QuoteNode](packages/editor/src/nodes.ts) | `@lexical/rich-text` |
| [ListNode, ListItemNode](packages/editor/src/nodes.ts) | `@lexical/list` |
| [CodeNode, CodeHighlightNode](packages/editor/src/nodes.ts) | `@lexical/code` |
| [TableNode, TableRowNode, TableCellNode](packages/editor/src/nodes.ts) | `@lexical/table` |
| [HashtagNode](packages/editor/src/nodes.ts) | `@lexical/hashtag` |
| [AutoLinkNode, LinkNode](packages/editor/src/nodes.ts) | `@lexical/link` |
| [OverflowNode](packages/editor/src/nodes.ts) | `@lexical/overflow` |
| [MarkNode](packages/editor/src/nodes.ts) | `@lexical/mark` |
| [HorizontalRuleNode](packages/editor/src/nodes.ts) | `@lexical/react` |

### Custom Nodes

| Node | Description |
|------|-------------|
| [AutocompleteNode](packages/editor/src/editor/nodes/AutocompleteNode) | Autocomplete suggestion node |
| [CollapsibleContainerNode](packages/editor/src/editor/plugins/CollapsiblePlugin) | Collapsible container |
| [CollapsibleContentNode](packages/editor/src/editor/plugins/CollapsiblePlugin) | Collapsible content area |
| [CollapsibleTitleNode](packages/editor/src/editor/plugins/CollapsiblePlugin) | Collapsible title |
| [EmojiNode](packages/editor/src/editor/nodes/EmojiNode) | Emoji node |
| [ImageNode](packages/editor/src/editor/nodes/ImageNode) | Image with caption & resize |
| [KeywordNode](packages/editor/src/editor/nodes/KeywordNode) | Highlighted keyword |
| [LayoutContainerNode](packages/editor/src/editor/nodes/LayoutContainerNode) | Multi-column container |
| [LayoutItemNode](packages/editor/src/editor/nodes/LayoutItemNode) | Column item in layout |
| [MentionNode](packages/editor/src/editor/nodes/MentionNode) | @mention node |
| [PageBreakNode](packages/editor/src/editor/nodes/PageBreakNode) | Page break |
| [SpecialTextNode](packages/editor/src/editor/nodes/SpecialTextNode) | Special formatted text |
| [StickyNode](packages/editor/src/editor/nodes/StickyNode) | Sticky note |
| [YouTubeNode](packages/editor/src/editor/nodes/YouTubeNode) | YouTube embed |

---

## Available Contexts / Providers

All providers are available via `lexical-editor-kit/providers`.

| Provider | Description |
|----------|-------------|
| [EditorContextProvider](packages/editor/src/editor/provider) | Root context wrapping all editor state |
| [FlashMessageContext](packages/editor/src/editor/context/FlashMessageContext) | Flash notification messages |
| [SettingsContext](packages/editor/src/editor/context/SettingsContext) | Editor settings state |
| [SharedHistoryContext](packages/editor/src/editor/context/SharedHistoryContext) | Shared undo/redo history |
| [ToolbarContext](packages/editor/src/editor/context/ToolbarContext) | Toolbar state (block type, font, format) |
| [TableContext](packages/editor/src/editor/plugins/TablePlugin) | Table cell selection state |

---

## Package Exports

| Import Path | Description |
|-------------|-------------|
| `lexical-editor-kit` | Core API: `createEditor`, `EditorBuilder`, settings, contexts, themes |
| `lexical-editor-kit/plugins` | All editor plugins |
| `lexical-editor-kit/nodes` | All Lexical node classes |
| `lexical-editor-kit/providers` | All context providers |
| `lexical-editor-kit/playground` | Pre-configured playground editor |
| `lexical-editor-kit/index.css` | Editor styles |

---

## Custom & Modified Plugins

The following plugins are **newly added** or **modified** compared to the original [Lexical Playground](https://playground.lexical.dev/).

| Plugin | Status | Description |
|--------|--------|-------------|
| [TableExcelPastePlugin](packages/editor/src/editor/plugins/TableExcelPastePlugin) | **New** | Excel copy & paste support. Preserves cell styles including background color, font color, font size, bold/italic/underline/strikethrough, text alignment, column widths, and row heights. Parses Excel's `<style>` block and `<col span>` for accurate reproduction. |
| [TableHoverActionsV2Plugin](packages/editor/src/editor/plugins/TableHoverActionsV2Plugin) | **Modified** | Refactored from the original playground's legacy drag-and-drop library to [@dnd-kit](https://dndkit.com/) for table row/column hover actions (add, move, drag). |

---

## References

- [Lexical Documentation](https://lexical.dev/docs/intro)
- [Lexical GitHub](https://github.com/facebook/lexical)
- [Lexical Playground](https://playground.lexical.dev/) — The UI and feature structure of this project were built using this as a reference.

---

## License

Open source. Free to use.
