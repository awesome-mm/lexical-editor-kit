import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTableNodeWithDimensions } from "@lexical/table";
import { $insertNodeToNearestRoot } from "@lexical/utils";

const DEFAULT_ROWS = 3;
const DEFAULT_COLUMNS = 3;

export function TableButton() {
  const [editor] = useLexicalComposerContext();

  const insertTable = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editor.update(
      () => {
        const tableNode = $createTableNodeWithDimensions(DEFAULT_ROWS, DEFAULT_COLUMNS, true);
        $insertNodeToNearestRoot(tableNode);
        const firstDescendant = tableNode.getFirstDescendant();
        if (firstDescendant && "select" in firstDescendant) {
          (firstDescendant as { select: () => void }).select();
        }
      },
      { tag: "insert-table" },
    );
  };

  // onMouseDown에서 처리해 버튼으로 포커스가 넘어가기 전에 삽입합니다.
  // editor.update()로 직접 삽입해 선택 상태와 무관하게 동작합니다.
  return (
    <button
      type="button"
      onMouseDown={insertTable}
      className="toolbar-item spaced"
      aria-label="Insert Table"
    >
      <i className="format table" />
    </button>
  );
}
