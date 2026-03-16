import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellHeaderStates,
  TableNode,
} from "@lexical/table";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  IS_BOLD,
  IS_ITALIC,
  IS_STRIKETHROUGH,
  IS_UNDERLINE,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";

const EXCEL_NAMESPACE_RE =
  /urn:schemas-microsoft-com:office:(excel|spreadsheet)|ProgId\s+content="?Excel/i;

/**
 * Excel에서 복사한 HTML인지 감지
 */
function isExcelHTML(html: string): boolean {
  return EXCEL_NAMESPACE_RE.test(html);
}

/**
 * hex 색상(#RRGGBB)을 rgb(r, g, b)로 변환
 */
function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 색상 값을 정규화 (hex → rgb, 빈값/투명/white 필터)
 */
function normalizeColor(value: string): string {
  if (!value || value === "transparent" || value === "window" || value === "windowtext") {
    return "";
  }
  if (value.startsWith("#")) {
    return hexToRgb(value);
  }
  return value;
}

/**
 * px/pt 문자열에서 px 숫자 추출
 */
function parseDimensionToPx(value: string): number {
  const match = value.match(/^([\d.]+)\s*(px|pt|cm|in)?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const unit = (match[2] || "px").toLowerCase();
  switch (unit) {
    case "pt":
      return Math.round((num * 4) / 3);
    case "cm":
      return Math.round(num * 37.8);
    case "in":
      return Math.round(num * 96);
    default:
      return Math.round(num);
  }
}

/**
 * font-size를 px 문자열로 정규화
 */
function normalizeFontSize(value: string): string {
  if (!value) return "";
  const px = parseDimensionToPx(value);
  if (px <= 0) return "";
  return `${px}px`;
}

type TextStyles = {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  color: string;
  fontSize: string;
};

/**
 * td 요소 및 자식 요소에서 텍스트 스타일 추출
 */
function extractTextStyles(td: HTMLElement): TextStyles {
  const styles: TextStyles = {
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    color: "",
    fontSize: "",
  };

  // td 자체 스타일 확인
  const computeFromElement = (el: HTMLElement) => {
    const fontWeight = el.style.fontWeight;
    if (fontWeight === "bold" || fontWeight === "700" || parseInt(fontWeight) >= 700) {
      styles.isBold = true;
    }
    if (el.style.fontStyle === "italic") {
      styles.isItalic = true;
    }
    const textDecoration = el.style.textDecoration || el.style.textDecorationLine || "";
    if (textDecoration.includes("underline")) {
      styles.isUnderline = true;
    }
    if (textDecoration.includes("line-through")) {
      styles.isStrikethrough = true;
    }
    const color = normalizeColor(el.style.color);
    if (color && !styles.color) {
      styles.color = color;
    }
    const fontSize = normalizeFontSize(el.style.fontSize);
    if (fontSize && !styles.fontSize) {
      styles.fontSize = fontSize;
    }
  };

  computeFromElement(td);

  // <b>, <strong>, <i>, <em>, <u>, <s>, <strike>, <span>, <font> 자식 확인
  const childElements = td.querySelectorAll("b, strong, i, em, u, s, strike, del, span, font");
  for (const child of Array.from(childElements)) {
    const tagName = child.tagName.toLowerCase();
    if (tagName === "b" || tagName === "strong") styles.isBold = true;
    if (tagName === "i" || tagName === "em") styles.isItalic = true;
    if (tagName === "u") styles.isUnderline = true;
    if (tagName === "s" || tagName === "strike" || tagName === "del") styles.isStrikethrough = true;
    if (child instanceof HTMLElement) {
      computeFromElement(child);
    }
  }

  // <font> 태그의 color 속성
  const fontEl = td.querySelector("font[color]");
  if (fontEl && !styles.color) {
    const fontColor = normalizeColor(fontEl.getAttribute("color") || "");
    if (fontColor) styles.color = fontColor;
  }

  // <font> 태그의 size 속성 (HTML font size → px 매핑)
  const fontSizeEl = td.querySelector("font[size]");
  if (fontSizeEl && !styles.fontSize) {
    const sizeAttr = fontSizeEl.getAttribute("size") || "";
    const sizeMap: Record<string, string> = {
      "1": "8px",
      "2": "10px",
      "3": "12px",
      "4": "14px",
      "5": "18px",
      "6": "24px",
      "7": "36px",
    };
    if (sizeMap[sizeAttr]) {
      styles.fontSize = sizeMap[sizeAttr];
    }
  }

  return styles;
}

/**
 * td 요소의 텍스트를 <br> 기준으로 분할하여 추출
 */
function extractTextParts(td: HTMLElement): string[] {
  const html = td.innerHTML;
  // <br> 태그로 분할
  const parts = html
    .split(/<br\s*\/?>/gi)
    .map((part) => {
      // HTML 태그 제거하고 텍스트만 추출
      const temp = document.createElement("div");
      temp.innerHTML = part;
      return temp.textContent || "";
    });

  // 빈 배열이면 최소 하나의 빈 문자열 반환
  if (parts.length === 0) return [""];
  return parts;
}

/**
 * Excel HTML을 파싱하여 TableNode 생성
 */
function parseExcelHTMLToTableNode(html: string): TableNode | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const tableEl = doc.querySelector("table");
  if (!tableEl) return null;

  const tableNode = $createTableNode();

  // 1. <col> 요소에서 컬럼 너비 추출
  const colElements = tableEl.querySelectorAll("col");
  const columnWidths: number[] = [];
  colElements.forEach((col) => {
    const width =
      (col as HTMLElement).style.width || col.getAttribute("width") || "";
    const px = parseDimensionToPx(width);
    columnWidths.push(px > 0 ? px : 0);
  });

  // 2. 행 순회
  const trElements = tableEl.querySelectorAll("tr");
  let isFirstRow = true;

  trElements.forEach((tr) => {
    const rowNode = $createTableRowNode();
    const tdElements = tr.querySelectorAll("td, th");

    tdElements.forEach((tdRaw, colIndex) => {
      const td = tdRaw as HTMLElement;
      const tagName = td.tagName.toLowerCase();

      // colspan / rowspan
      const colSpan = parseInt(td.getAttribute("colspan") || "1", 10);
      const rowSpan = parseInt(td.getAttribute("rowspan") || "1", 10);

      // 헤더 상태
      const headerState =
        tagName === "th"
          ? TableCellHeaderStates.ROW
          : TableCellHeaderStates.NO_STATUS;

      const cellNode = $createTableCellNode(headerState, colSpan);
      if (rowSpan > 1) {
        cellNode.setRowSpan(rowSpan);
      }

      // 셀 배경색
      const bgColor = normalizeColor(td.style.backgroundColor);
      if (bgColor) {
        cellNode.setBackgroundColor(bgColor);
      }

      // 셀 너비 (첫 행에서 <col> 없을 때 fallback)
      if (isFirstRow && columnWidths.length === 0) {
        const width = td.style.width || td.getAttribute("width") || "";
        const px = parseDimensionToPx(width);
        if (px > 0) columnWidths.push(px);
      }

      // 셀 너비 설정
      const cellWidth =
        columnWidths[colIndex] ||
        parseDimensionToPx(td.style.width || td.getAttribute("width") || "");
      if (cellWidth > 0) {
        cellNode.setWidth(cellWidth);
      }

      // 텍스트 스타일 추출
      const textStyles = extractTextStyles(td);

      // 텍스트 파트 추출 (br 기준 분할)
      const textParts = extractTextParts(td);

      textParts.forEach((text) => {
        const paragraph = $createParagraphNode();
        const textNode = $createTextNode(text);

        // format 플래그 적용
        let format = 0;
        if (textStyles.isBold) format |= IS_BOLD;
        if (textStyles.isItalic) format |= IS_ITALIC;
        if (textStyles.isUnderline) format |= IS_UNDERLINE;
        if (textStyles.isStrikethrough) format |= IS_STRIKETHROUGH;
        if (format) textNode.setFormat(format);

        // 인라인 스타일 적용
        let style = "";
        if (textStyles.color) style += `color: ${textStyles.color};`;
        if (textStyles.fontSize) style += `font-size: ${textStyles.fontSize};`;
        if (style) textNode.setStyle(style);

        paragraph.append(textNode);
        cellNode.append(paragraph);
      });

      rowNode.append(cellNode);
    });

    tableNode.append(rowNode);
    isFirstRow = false;
  });

  // 컬럼 너비 설정
  if (columnWidths.length > 0 && columnWidths.some((w) => w > 0)) {
    tableNode.setColWidths(columnWidths);
  }

  return tableNode;
}

export default function TableExcelPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent>(
      PASTE_COMMAND,
      (event) => {
        const htmlString = event.clipboardData?.getData("text/html");
        if (!htmlString || !isExcelHTML(htmlString)) {
          return false;
        }

        event.preventDefault();

        editor.update(() => {
          const tableNode = parseExcelHTMLToTableNode(htmlString);
          if (!tableNode) return;

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([tableNode]);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
