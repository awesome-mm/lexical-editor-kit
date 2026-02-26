import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import React, { useEffect, useState } from "react";

type Props = { activeEditor: LexicalEditor; onClose: () => void };

/**
 * Lazy-loaded InsertTableDialog. Only loads @lexical/table and TablePlugin when rendered.
 * Use this in toolbar/picker so the main bundle does not depend on @lexical/table.
 */
export function LazyInsertTableDialog({ activeEditor, onClose }: Props): JSX.Element | null {
  const [Comp, setComp] = useState<React.ComponentType<Props> | null>(null);
  useEffect(() => {
    import("@lexical/table")
      .then(() => import("./TablePlugin"))
      .then((m) => setComp(() => m.InsertTableDialog))
      .catch(() => setComp(() => () => null));
  }, []);
  return Comp ? <Comp activeEditor={activeEditor} onClose={onClose} /> : null;
}
