import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { CAN_UNDO_COMMAND, UNDO_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LowPriority } from "@/editor/constants/constants";

export function UndoButton() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor]);

  return (
    <button
      disabled={!canUndo}
      onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      className="toolbar-item spaced"
      aria-label="Undo"
    >
      <i className="format undo" />
    </button>
  );
}
