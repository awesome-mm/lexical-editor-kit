/**
 * Table feature plugins bundle. Loaded only when @lexical/table is available.
 * Do not import this file statically in the main Editor - use dynamic import.
 */
import type { JSX } from "react";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import TableCellResizer from "./TableCellResizer";
import TableScrollShadowPlugin from "./TableScrollShadowPlugin";
import TableCellActionMenuPlugin from "./TableActionMenuPlugin";
import TableHoverActionsV2Plugin from "./TableHoverActionsV2Plugin";

export type TableFeaturePluginsProps = {
  tableCellMerge?: boolean;
  tableCellBackgroundColor?: boolean;
  tableHorizontalScroll?: boolean;
  hasNestedTables?: boolean;
  anchorElem: HTMLElement | null;
  isSmallWidthViewport: boolean;
};

export function TableFeaturePlugins({
  tableCellMerge,
  tableCellBackgroundColor,
  tableHorizontalScroll,
  hasNestedTables,
  anchorElem,
  isSmallWidthViewport,
}: TableFeaturePluginsProps): JSX.Element {
  return (
    <>
      <TablePlugin
        hasCellMerge={tableCellMerge}
        hasCellBackgroundColor={tableCellBackgroundColor}
        hasHorizontalScroll={tableHorizontalScroll}
        hasNestedTables={hasNestedTables}
      />
      <TableCellResizer />
      <TableScrollShadowPlugin />
      {anchorElem && (
        <>
          <TableCellActionMenuPlugin anchorElem={anchorElem} cellMerge={true} />
          {!isSmallWidthViewport && <TableHoverActionsV2Plugin anchorElem={anchorElem} />}
        </>
      )}
    </>
  );
}
