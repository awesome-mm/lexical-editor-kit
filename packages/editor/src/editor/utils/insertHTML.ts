import { $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, LexicalEditor } from "lexical";

export function insertHTML(editor: LexicalEditor, html: string) {
  editor.update(() => {
    const dom = new DOMParser().parseFromString(html, "text/html");
    const nodes = $generateNodesFromDOM(editor, dom);

    const root = $getRoot();
    root.clear();
    root.append(...nodes);
  });
}
