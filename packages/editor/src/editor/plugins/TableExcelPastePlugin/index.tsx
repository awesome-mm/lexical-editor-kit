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
  ElementFormatType,
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
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) {
    return hexToRgb(trimmed);
  }
  return trimmed;
}

/**
 * 원시 style 속성 문자열에서 특정 CSS 속성 값을 추출
 * DOMParser가 mso-* 등 비표준 속성을 무시하므로 직접 파싱
 */
function getStylePropertyFromRaw(styleAttr: string, property: string): string {
  if (!styleAttr) return "";
  // property: value 패턴 매칭 (세미콜론 또는 문자열 끝까지)
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, "i");
  const match = styleAttr.match(re);
  return match ? match[1].trim() : "";
}

/**
 * px/pt 문자열에서 px 숫자 추출
 */
function parseDimensionToPx(value: string): number {
  if (!value) return 0;
  const match = value.match(/([\d.]+)\s*(px|pt|cm|in)?/i);
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

/**
 * 요소에서 배경색 추출 (style 속성 직접 파싱 포함)
 * Excel HTML은 background 속성을 여러 형태로 사용:
 * - style="background-color: #RRGGBB"
 * - style="background: #RRGGBB"
 * - bgcolor 속성
 */
function extractBackgroundColor(el: HTMLElement): string {
  const rawStyle = el.getAttribute("style") || "";

  // 1. background-color 직접 파싱
  let bg = getStylePropertyFromRaw(rawStyle, "background-color");
  if (bg) {
    const color = normalizeColor(bg);
    if (color) return color;
  }

  // 2. background 단축 속성
  bg = getStylePropertyFromRaw(rawStyle, "background");
  if (bg) {
    // background 값에서 색상만 추출 (#hex 또는 rgb(...))
    const hexMatch = bg.match(/#[0-9a-fA-F]{3,6}/);
    if (hexMatch) {
      const color = normalizeColor(hexMatch[0]);
      if (color) return color;
    }
    const rgbMatch = bg.match(/rgb\([^)]+\)/i);
    if (rgbMatch) {
      return rgbMatch[0];
    }
  }

  // 3. bgcolor HTML 속성
  const bgAttr = el.getAttribute("bgcolor");
  if (bgAttr) {
    const color = normalizeColor(bgAttr);
    if (color) return color;
  }

  // 4. element.style 객체 (브라우저가 파싱한 경우)
  if (el.style.backgroundColor) {
    const color = normalizeColor(el.style.backgroundColor);
    if (color) return color;
  }

  return "";
}

/**
 * 요소에서 폰트 색상 추출 (style 속성 직접 파싱 포함)
 */
function extractFontColor(el: HTMLElement): string {
  const rawStyle = el.getAttribute("style") || "";

  // 1. style 속성에서 color 직접 파싱
  const colorValue = getStylePropertyFromRaw(rawStyle, "color");
  if (colorValue) {
    const color = normalizeColor(colorValue);
    if (color) return color;
  }

  // 2. element.style 객체
  if (el.style.color) {
    const color = normalizeColor(el.style.color);
    if (color) return color;
  }

  return "";
}

/**
 * 요소에서 font-size 추출 (style 속성 직접 파싱 포함)
 */
function extractFontSize(el: HTMLElement): string {
  const rawStyle = el.getAttribute("style") || "";

  // 1. style 속성에서 font-size 직접 파싱
  const fsValue = getStylePropertyFromRaw(rawStyle, "font-size");
  if (fsValue) {
    const fs = normalizeFontSize(fsValue);
    if (fs) return fs;
  }

  // 2. element.style 객체
  if (el.style.fontSize) {
    const fs = normalizeFontSize(el.style.fontSize);
    if (fs) return fs;
  }

  return "";
}

/**
 * 요소에서 너비(px) 추출
 */
function extractWidth(el: HTMLElement): number {
  const rawStyle = el.getAttribute("style") || "";

  // 1. style 속성에서 width 직접 파싱
  const widthValue = getStylePropertyFromRaw(rawStyle, "width");
  if (widthValue) {
    const px = parseDimensionToPx(widthValue);
    if (px > 0) return px;
  }

  // 2. element.style.width
  if (el.style.width) {
    const px = parseDimensionToPx(el.style.width);
    if (px > 0) return px;
  }

  // 3. width HTML 속성
  const widthAttr = el.getAttribute("width");
  if (widthAttr) {
    const px = parseDimensionToPx(widthAttr);
    if (px > 0) return px;
  }

  return 0;
}

/**
 * 요소에서 높이(px) 추출
 */
function extractHeight(el: HTMLElement): number {
  const rawStyle = el.getAttribute("style") || "";

  // 1. style 속성에서 height 직접 파싱
  const heightValue = getStylePropertyFromRaw(rawStyle, "height");
  if (heightValue) {
    const px = parseDimensionToPx(heightValue);
    if (px > 0) return px;
  }

  // 2. element.style.height
  if (el.style.height) {
    const px = parseDimensionToPx(el.style.height);
    if (px > 0) return px;
  }

  // 3. height HTML 속성
  const heightAttr = el.getAttribute("height");
  if (heightAttr) {
    const px = parseDimensionToPx(heightAttr);
    if (px > 0) return px;
  }

  return 0;
}

type TextStyles = {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  color: string;
  fontSize: string;
  textAlign: ElementFormatType;
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
    textAlign: "",
  };

  // td에서 text-align 추출 (Excel은 td의 style 또는 align 속성에 정렬 정보를 넣음)
  const rawTdStyle = td.getAttribute("style") || "";
  const textAlignValue =
    getStylePropertyFromRaw(rawTdStyle, "text-align") ||
    td.style.textAlign ||
    td.getAttribute("align") ||
    "";
  const alignMap: Record<string, ElementFormatType> = {
    center: "center",
    right: "right",
    left: "left",
    justify: "justify",
  };
  if (alignMap[textAlignValue]) {
    styles.textAlign = alignMap[textAlignValue];
  }

  // td 자체 스타일 확인
  const computeFromElement = (el: HTMLElement) => {
    const rawStyle = el.getAttribute("style") || "";

    // font-weight (raw style 파싱 + style 객체)
    const fontWeight =
      getStylePropertyFromRaw(rawStyle, "font-weight") || el.style.fontWeight;
    if (fontWeight === "bold" || fontWeight === "700" || parseInt(fontWeight) >= 700) {
      styles.isBold = true;
    }

    // font-style
    const fontStyle =
      getStylePropertyFromRaw(rawStyle, "font-style") || el.style.fontStyle;
    if (fontStyle === "italic") {
      styles.isItalic = true;
    }

    // text-decoration
    const textDecoration =
      getStylePropertyFromRaw(rawStyle, "text-decoration") ||
      getStylePropertyFromRaw(rawStyle, "text-decoration-line") ||
      el.style.textDecoration ||
      el.style.textDecorationLine ||
      "";
    if (textDecoration.includes("underline")) {
      styles.isUnderline = true;
    }
    if (textDecoration.includes("line-through")) {
      styles.isStrikethrough = true;
    }

    // 색상
    if (!styles.color) {
      const color = extractFontColor(el);
      if (color) styles.color = color;
    }

    // 폰트 크기
    if (!styles.fontSize) {
      const fontSize = extractFontSize(el);
      if (fontSize) styles.fontSize = fontSize;
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
 * colspan 범위의 열 너비 합산
 */
function getSpanWidth(columnWidths: number[], startIndex: number, colSpan: number): number {
  let total = 0;
  for (let i = 0; i < colSpan; i++) {
    total += columnWidths[startIndex + i] || 0;
  }
  return total;
}

/**
 * Excel HTML의 <style> 블록에서 CSS 클래스 규칙을 파싱하여
 * 각 요소의 inline style 속성에 병합한다.
 *
 * Excel은 배경색, 폰트색 등을 <td>의 inline style이 아니라
 * <style> 블록의 클래스(.xl65 등)에 정의하는데,
 * DOMParser는 CSS 클래스를 element.style에 적용하지 않으므로
 * 직접 병합해야 한다.
 *
 * 병합 순서: inline style(최우선) → class styles(후순위)
 * getStylePropertyFromRaw()가 첫 번째 매칭을 반환하므로
 * inline이 앞에 오면 자동으로 우선 적용됨.
 */
function resolveExcelClassStyles(doc: Document): void {
  const styleEl = doc.querySelector("style");
  if (!styleEl) return;

  const cssText = styleEl.textContent || "";

  // 1. td 요소 기본 규칙 파싱 (font-size, color 등 기본값)
  // Excel은 td { font-size:11.0pt; color:windowtext; ... } 형태로 기본 스타일 정의
  const tdRuleMatch = cssText.match(/(?:^|\n)\s*td\s*\{([^}]+)\}/i);
  const tdDefaultStyles = tdRuleMatch
    ? tdRuleMatch[1].replace(/[\n\r\t]/g, "").trim()
    : "";

  // 2. CSS 클래스 규칙 파싱 (.xl65 { background:#ED7D31; mso-pattern:black none; })
  const classStyles = new Map<string, string>();
  const ruleRe = /\.([a-zA-Z_][\w-]*)\s*\{([^}]+)\}/g;
  let match;
  while ((match = ruleRe.exec(cssText)) !== null) {
    classStyles.set(match[1], match[2].replace(/[\n\r\t]/g, "").trim());
  }

  // 3. td/th 요소에 스타일 병합
  // 우선순위: inline(최우선) → class → td 기본(최하위)
  // getStylePropertyFromRaw()가 첫 번째 매칭을 반환하므로 앞에 올수록 우선
  const tdElements = doc.querySelectorAll("td, th");
  for (const el of Array.from(tdElements)) {
    if (!(el instanceof HTMLElement)) continue;
    const inlineStyle = el.getAttribute("style") || "";
    const classList = el.getAttribute("class")?.split(/\s+/).filter(Boolean) || [];

    const classStyleParts: string[] = [];
    for (const cls of classList) {
      const styles = classStyles.get(cls);
      if (styles) classStyleParts.push(styles);
    }

    // inline → class → td 기본 순서로 병합
    const parts = [inlineStyle, classStyleParts.join(";"), tdDefaultStyles].filter(Boolean);
    if (parts.length > 1) {
      el.setAttribute("style", parts.join(";"));
    }
  }

  // 4. class를 가진 나머지 요소(tr, font, span 등)에도 클래스 스타일 병합
  if (classStyles.size > 0) {
    const otherElements = doc.querySelectorAll("[class]:not(td):not(th)");
    for (const el of Array.from(otherElements)) {
      if (!(el instanceof HTMLElement)) continue;
      const inlineStyle = el.getAttribute("style") || "";
      const classList = el.getAttribute("class")?.split(/\s+/).filter(Boolean) || [];

      const classStyleParts: string[] = [];
      for (const cls of classList) {
        const styles = classStyles.get(cls);
        if (styles) classStyleParts.push(styles);
      }

      if (classStyleParts.length > 0) {
        el.setAttribute("style", inlineStyle + ";" + classStyleParts.join(";"));
      }
    }
  }
}

/**
 * Excel HTML을 파싱하여 TableNode 생성
 */
function parseExcelHTMLToTableNode(html: string): TableNode | null {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Excel <style> 블록의 클래스 스타일을 inline style로 병합
  resolveExcelClassStyles(doc);

  const tableEl = doc.querySelector("table");
  if (!tableEl) return null;

  const tableNode = $createTableNode();

  // 1. <col> 요소에서 컬럼 너비 추출
  // Excel은 <col span=N>으로 동일 너비의 연속 열을 표현하므로 span만큼 반복 추가
  const colElements = tableEl.querySelectorAll("col");
  const columnWidths: number[] = [];
  colElements.forEach((col) => {
    const px = extractWidth(col as HTMLElement);
    const span = parseInt(col.getAttribute("span") || "1", 10);
    const width = px > 0 ? px : 0;
    for (let i = 0; i < span; i++) {
      columnWidths.push(width);
    }
  });

  // 2. 행 순회 (:scope > 사용하여 중첩 테이블의 tr을 가져오지 않도록 함)
  const tbody = tableEl.querySelector("tbody") || tableEl;
  const trElements = tbody.querySelectorAll(":scope > tr");
  let isFirstRow = true;

  trElements.forEach((tr) => {
    const rowNode = $createTableRowNode();

    // 행 높이 추출 및 설정
    const rowHeight = extractHeight(tr as HTMLElement);
    if (rowHeight > 0) {
      rowNode.setHeight(rowHeight);
    }

    // :scope > 를 사용하여 직계 자식 td/th만 선택
    const tdElements = tr.querySelectorAll(":scope > td, :scope > th");

    // 실제 시각적 열 인덱스 (colspan 고려)
    let visualColIndex = 0;

    tdElements.forEach((tdRaw) => {
      const td = tdRaw as HTMLElement;
      const tagName = td.tagName.toLowerCase();

      // colspan / rowspan
      const colSpan = parseInt(td.getAttribute("colspan") || "1", 10);
      const rowSpan = parseInt(td.getAttribute("rowspan") || "1", 10);

      // 엑셀 데이터는 일반 셀(NO_STATUS)로 처리
      // Lexical 내부에서 th(hasHeader) + backgroundColor===null 일 때 #f2f3f5를 강제 적용하고,
      // CSS .tableCellHeader에도 background-color: #f2f3f5가 있어 엑셀 배경색이 덮어씌워지는 문제 방지
      const headerState =
        tagName === "th"
          ? TableCellHeaderStates.ROW
          : TableCellHeaderStates.NO_STATUS;

      const cellNode = $createTableCellNode(headerState, colSpan);
      if (rowSpan > 1) {
        cellNode.setRowSpan(rowSpan);
      }

      // 셀 배경색 (raw style 속성에서 직접 추출)
      const bgColor = extractBackgroundColor(td);
      if (bgColor) {
        cellNode.setBackgroundColor(bgColor);
      }

      // 첫 행에서 <col>이 없을 때 셀 너비로 columnWidths fallback 구성
      if (isFirstRow && columnWidths.length === 0) {
        const px = extractWidth(td);
        if (px > 0) {
          // colspan이 있는 셀은 각 열에 균등 분배
          const perColWidth = Math.round(px / colSpan);
          for (let i = 0; i < colSpan; i++) {
            columnWidths[visualColIndex + i] = perColWidth;
          }
        }
      }

      // 셀 너비 설정 (colspan 범위의 열 너비 합산)
      const widthFromCols = getSpanWidth(columnWidths, visualColIndex, colSpan);
      const cellWidth = widthFromCols || extractWidth(td);
      if (cellWidth > 0) {
        cellNode.setWidth(cellWidth);
      }

      // 텍스트 스타일 추출
      const textStyles = extractTextStyles(td);

      // 텍스트 파트 추출 (br 기준 분할)
      const textParts = extractTextParts(td);

      // 행 높이를 텍스트 파트 수로 나눠 각 paragraph의 line-height 계산
      // ParagraphNode.createDOM()은 __style을 DOM에 적용하지 않으므로
      // TextNode(span)에 line-height를 설정하여 부모 <p>의 높이를 제어
      // CSS padding(상하 1px × 2 = 2px)과 border(1px)를 차감
      const CELL_VERTICAL_OVERHEAD = 3;
      const availableHeight = rowHeight > CELL_VERTICAL_OVERHEAD
        ? rowHeight - CELL_VERTICAL_OVERHEAD
        : rowHeight;
      const lineHeightPx = availableHeight > 0
        ? Math.floor(availableHeight / textParts.length)
        : 0;

      textParts.forEach((text) => {
        const paragraph = $createParagraphNode();
        // 텍스트 정렬 적용
        if (textStyles.textAlign) {
          paragraph.setFormat(textStyles.textAlign);
        }
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
        if (lineHeightPx > 0) style += `line-height: ${lineHeightPx}px;`;
        if (style) textNode.setStyle(style);

        paragraph.append(textNode);
        cellNode.append(paragraph);
      });

      rowNode.append(cellNode);

      // 다음 셀의 실제 시각적 열 인덱스로 이동
      visualColIndex += colSpan;
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

        // [DEBUG] 엑셀 원본 HTML 확인 (문제 해결 후 제거)
        console.group("[ExcelPaste] 원본 HTML");
        console.log(htmlString);
        console.groupEnd();

        editor.update(() => {
          const tableNode = parseExcelHTMLToTableNode(htmlString);
          if (!tableNode) return;

          // [DEBUG] 파싱 결과 확인 (문제 해결 후 제거)
          console.group("[ExcelPaste] 파싱 결과");
          console.log("colWidths:", tableNode.getColWidths?.());
          tableNode.getChildren().forEach((row: any, ri: number) => {
            console.log(`row[${ri}] height:`, row.getHeight?.());
            row.getChildren().forEach((cell: any, ci: number) => {
              console.log(`  cell[${ri}][${ci}]`, {
                width: cell.getWidth?.(),
                bg: cell.getBackgroundColor?.(),
                colSpan: cell.getColSpan?.(),
              });
            });
          });
          console.groupEnd();

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
