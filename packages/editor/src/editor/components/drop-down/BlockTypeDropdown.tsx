import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { $getSelection, $isRangeSelection } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { BlockOptionsDropdownList } from "@/editor/components/drop-down/list/BlockOptionsDropdownList";
import {
  supportedBlockTypes,
  blockTypeToBlockName,
  LowPriority,
} from "@/editor/constants/constants";

export function BlockTypeDropdown() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [blockType, setBlockType] = useState("paragraph");
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = useState(false);

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

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

  if (!supportedBlockTypes.has(blockType)) {
    return null;
  }

  return (
    <>
      <div ref={toolbarRef}>
        <button
          className="toolbar-item block-controls"
          onClick={() => setShowBlockOptionsDropDown(!showBlockOptionsDropDown)}
          aria-label="Formatting Options"
        >
          <span className={"icon block-type " + blockType} />
          <span className="text">{blockTypeToBlockName[blockType] ?? blockType}</span>
          <i className="chevron-down" />
        </button>
      </div>
      {showBlockOptionsDropDown &&
        createPortal(
          <BlockOptionsDropdownList
            editor={editor}
            blockType={blockType}
            toolbarRef={toolbarRef}
            setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
          />,
          document.body,
        )}
    </>
  );
}
