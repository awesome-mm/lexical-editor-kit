import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LowPriority } from "../../constants/constants";

export function InlineCodeButton() {
  const [editor] = useLexicalComposerContext();
  const [isCode, setIsCode] = useState(false);

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsCode(selection.hasFormat("code"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.read(updateState);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          editor.read(updateState);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateState]);

  return (
    <button
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
      className={"toolbar-item spaced " + (isCode ? "active" : "")}
      aria-label="Insert Code"
    >
      <i className="format code" />
    </button>
  );
}
