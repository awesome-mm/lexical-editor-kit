import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { $getSelection, $isRangeSelection } from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { getSelectedNode } from "@/editor/utils/utils";
import { FloatingLinkEditor } from "@/editor/components/floating-editor/FloatingLinkEditor";
import { LowPriority } from "@/editor/constants/constants";

export function LinkButton() {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
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

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <>
      <button
        onClick={insertLink}
        className={"toolbar-item spaced " + (isLink ? "active" : "")}
        aria-label="Insert Link"
      >
        <i className="format link" />
      </button>
      {isLink && createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
    </>
  );
}
