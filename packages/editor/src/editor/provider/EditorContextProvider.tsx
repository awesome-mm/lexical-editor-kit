/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { defineExtension } from "lexical";
import { type JSX, useMemo } from "react";

import { buildHTMLConfig } from "@/editor/buildHTMLConfig";
import PlaygroundNodes from "@/editor/config/node/PlaygroundNodes";
import PlaygroundEditorTheme from "@/editor/config/themes/PlaygroundEditorTheme";
import { useSettings } from "@/editor/context/SettingsContext";
import { SharedHistoryContext } from "@/editor/context/SharedHistoryContext";
import { ToolbarContext } from "@/editor/context/ToolbarContext";
import { $prepopulatedRichText } from "@/editor/data/data";
import { TableContext } from "@/editor/plugins/TablePlugin";
import { FlashMessageContext } from "../context/FlashMessageContext";

export function EditorContextProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const {
    settings: { emptyEditor },
  } = useSettings();

  const app = useMemo(
    () =>
      defineExtension({
        // dev 일 때는 emptyEditor 설정 안함
        $initialEditorState: $prepopulatedRichText,
        // $initialEditorState: $prepopulatedRichText,
        // dependencies: [],
        html: buildHTMLConfig(),
        name: "@lexical/playground",
        namespace: "Playground",
        nodes: PlaygroundNodes,
        theme: PlaygroundEditorTheme,
      }),
    [emptyEditor],
  );

  return (
    <LexicalExtensionComposer extension={app} contentEditable={null}>
      <SharedHistoryContext>
        <FlashMessageContext>
          <TableContext>
            <ToolbarContext>
              <div className="editor-shell">{children}</div>
            </ToolbarContext>
          </TableContext>
        </FlashMessageContext>
      </SharedHistoryContext>
    </LexicalExtensionComposer>
  );
}
