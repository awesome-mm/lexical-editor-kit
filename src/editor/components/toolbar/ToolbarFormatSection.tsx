import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import { $getSelection, $isRangeSelection } from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LowPriority } from "@/editor/constants/constants";
import { Divider } from "./Divider";
import { CodeLanguageSelect } from "../language-select/CodeLanguageSelect";
import { BoldButton } from "../bold/BoldButton";
import { ItalicButton } from "../italic/ItalicButton";
import { UnderlineButton } from "../underline/UnderlineButton";
import { StrikethroughButton } from "../strikethrough/StrikethroughButton";
import { InlineCodeButton } from "../code-block/InlineCodeButton";
import { LinkButton } from "../link/LinkButton";
import { TableButton } from "../table/TableButton";
import {
  LeftAlignButton,
  CenterAlignButton,
  RightAlignButton,
  JustifyAlignButton,
} from "../align/AlignmentButtons";

/**
 * 코드 블록일 때는 언어 선택만, 그 외에는 텍스트 포맷 + 링크 + 테이블 + 정렬 버튼을 렌더링합니다.
 */
export function ToolbarFormatSection() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementDOM = editor.getElementByKey(element.getKey());
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          setBlockType($isHeadingNode(element) ? element.getTag() : element.getType());
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

  if (blockType === "code") {
    return (
      <>
        <CodeLanguageSelect />
      </>
    );
  }

  return (
    <>
      <BoldButton />
      <ItalicButton />
      <UnderlineButton />
      <StrikethroughButton />
      <InlineCodeButton />
      <LinkButton />
      <TableButton />
      <Divider />
      <LeftAlignButton />
      <CenterAlignButton />
      <RightAlignButton />
      <JustifyAlignButton />
    </>
  );
}
