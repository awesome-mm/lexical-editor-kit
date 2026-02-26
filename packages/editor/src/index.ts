import "./editor/style/style.css";
import "./editor/style/editor.css";

export { default as Editor } from "./EditorRoot";
export { EditorConfig } from "./editor/config/EditorConfig";
export type { InitialConfigType } from "@lexical/react/LexicalComposer";

export { createEditorKit } from "./createEditorKit";
export type { EditorKit, EditorKitOptions } from "./createEditorKit";
export { registerTable, getTableNodes } from "./features/table";
export { registerList, getListNodes } from "./features/list";
export { registerCode, getCodeNodes } from "./features/code";
