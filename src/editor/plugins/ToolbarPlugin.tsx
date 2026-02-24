/**
 * ToolbarPlugin – Lexical 툴바/링크 에디터
 *
 * [필수] $getSelection() 등 Lexical read API는 반드시 editor.read() 또는 newEditor.read() 콜백 안에서만 호출.
 * editorState.read() / getEditorState().read() 사용 시 "Unable to find an active editor" 에러 발생.
 */
import { Divider } from "@/editor/components/toolbar/Divider";
import { UndoButton } from "@/editor/components/undo/UndoButton";
import { RedoButton } from "@/editor/components/redo/RedoButton";
import { BlockTypeDropdown } from "@/editor/components/drop-down/BlockTypeDropdown";
import { ToolbarFormatSection } from "@/editor/components/toolbar/ToolbarFormatSection";

export default function ToolbarPlugin() {
  return (
    <div className="toolbar">
      <UndoButton />
      <RedoButton />
      <Divider />
      <BlockTypeDropdown />
      <Divider />
      <ToolbarFormatSection />
    </div>
  );
}
