import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { $getSelection, $isRangeSelection } from "lexical";
import { $getNodeByKey } from "lexical";
import { $isCodeNode } from "@lexical/code";
import { getDefaultCodeLanguage, getCodeLanguages } from "@lexical/code";
import { SELECTION_CHANGE_COMMAND } from "lexical";
import { mergeRegister } from "@lexical/utils";
import { LowPriority } from "@/editor/constants/constants";
import { Select } from "@/editor/components/toolbar/Select";

export function CodeLanguageSelect() {
  const [editor] = useLexicalComposerContext();
  const [codeLanguage, setCodeLanguage] = useState("");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null);
  const [isCodeBlock, setIsCodeBlock] = useState(false);

  const updateState = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isCodeNode(element)) {
          setIsCodeBlock(true);
          setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
        } else {
          setIsCodeBlock(false);
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

  const codeLanguages = useMemo(() => getCodeLanguages(), []);

  const onCodeLanguageSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(e.target.value);
          }
        }
      });
    },
    [editor, selectedElementKey],
  );

  if (!isCodeBlock) {
    return null;
  }

  return (
    <>
      <Select
        className="toolbar-item code-language"
        onChange={onCodeLanguageSelect}
        options={codeLanguages}
        value={codeLanguage}
      />
      <i className="chevron-down inside" />
    </>
  );
}
