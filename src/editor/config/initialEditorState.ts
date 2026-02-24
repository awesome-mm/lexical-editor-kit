import { $createParagraphNode, $getRoot } from "lexical";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import type { LexicalEditor } from "lexical";

export const initialEditorState = (editor: LexicalEditor) => {
  const root = $getRoot();

  // 루트 초기화
  root.clear();

  // 커서 위치용 문단
  root.append($createParagraphNode()).selectEnd();

  // 테이블 삽입
  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
    columns: "3",
    rows: "3",
    includeHeaders: true,
  });
};
