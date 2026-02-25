import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { CAN_REDO_COMMAND, REDO_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LowPriority } from "@/editor/constants/constants";

export function RedoButton() {
  const [editor] = useLexicalComposerContext();
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor]);

  return (
    <button
      disabled={!canRedo}
      onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      className="toolbar-item"
      aria-label="Redo"
    >
      <i className="format redo" />
    </button>
  );
}
