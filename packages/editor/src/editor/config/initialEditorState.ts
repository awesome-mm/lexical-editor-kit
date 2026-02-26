import { $createParagraphNode, $getRoot } from "lexical";
import type { LexicalEditor } from "lexical";
import { getOptionalTable } from "../../utils/optional";

export const initialEditorState = (editor: LexicalEditor) => {
  const root = $getRoot();

  root.clear();
  root.append($createParagraphNode()).selectEnd();

  const table = getOptionalTable();
  if (table?.INSERT_TABLE_COMMAND) {
    editor.dispatchCommand(table.INSERT_TABLE_COMMAND, {
      columns: "3",
      rows: "3",
      includeHeaders: true,
    });
  }
};
