import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LowPriority } from "@/editor/constants/constants";

export function ItalicButton() {
  const [editor] = useLexicalComposerContext();
  const [isItalic, setIsItalic] = useState(false);

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsItalic(selection.hasFormat("italic"));
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
      onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      className={"toolbar-item spaced " + (isItalic ? "active" : "")}
      aria-label="Format Italics"
    >
      <i className="format italic" />
    </button>
  );
}
