import { $createParagraphNode, $getRoot } from "lexical";
import type { LexicalEditor } from "lexical";
import { INSERT_TABLE_COMMAND } from "@lexical/table";

export const initialEditorState = (editor: LexicalEditor) => {
  const root = $getRoot();

  root.clear();
  root.append($createParagraphNode()).selectEnd();

  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
    columns: "3",
    rows: "3",
    includeHeaders: true,
  });
};
