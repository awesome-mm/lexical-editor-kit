// types.ts
/**
 * 테이블 컬럼 Drag & Drop 관련 타입 정의
 */

export type ColumnDragData = {
  columnIndex: number;
  tableKey: string | null;
  type: "table-column";
};

export type DropIndicatorState = {
  edge: "left" | "right";
  height: number;
  left: number;
  top: number;
};

export type TableHoverActionsProps = {
  anchorElem?: HTMLElement;
};
