// -- style --
import "./index.css";

// ── core ──
export type { PluginComponent, ProviderComponent, NodeClass } from "./core/core";
export { createEditor } from "./core/createEditor";
export { EditorBuilder } from "./core/EditorBuilder";
export { buildHTMLConfig } from "./editor/buildHTMLConfig";
export { EditorConfig } from "./editor/config/EditorConfig";

// ── settings ──
export { DEFAULT_SETTINGS, INITIAL_SETTINGS } from "./editor/appSettings";
export type { SettingName, Settings } from "./editor/appSettings";

// ── context (re-export for convenience) ──
export {
  FlashMessageContext,
  useFlashMessageContext,
} from "./editor/context/FlashMessageContext";
export type { ShowFlashMessage } from "./editor/context/FlashMessageContext";
export { SettingsContext, useSettings } from "./editor/context/SettingsContext";
export {
  SharedHistoryContext,
  useSharedHistoryContext,
} from "./editor/context/SharedHistoryContext";
export {
  ToolbarContext,
  useToolbarState,
  blockTypeToBlockName,
  MIN_ALLOWED_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  DEFAULT_FONT_SIZE,
} from "./editor/context/ToolbarContext";

// ── nodes (re-export for convenience) ──
export {
  getPlaygroundNodes,
  default as PlaygroundNodes,
} from "./editor/config/node/PlaygroundNodes";

// ── themes ──
export { default as PlaygroundEditorTheme } from "./editor/config/themes/PlaygroundEditorTheme";
