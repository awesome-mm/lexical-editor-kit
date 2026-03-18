import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { EditorConfig } from "./core";
import PlaygroundEditorTheme from "../editor/config/themes/PlaygroundEditorTheme";
import { uuid } from "@/editor/utils/uuid";

export function createEditor(config: EditorConfig) {
  const { plugins = [], providers = [], nodes = [], theme } = config;

  const Editor = () => {
    const initialConfig = {
      namespace: "lexical-editor-kit",
      nodes,
      theme: theme ?? PlaygroundEditorTheme,
      onError(error: Error) {
        console.error(error);
      },
    };

    const pluginContent = (
      <>
        {plugins.map((Plugin, idx) => (
          <Plugin key={Plugin.displayName || Plugin.name || `plugin-${idx}`} />
        ))}
      </>
    );

    const withProviders = providers.reduceRight(
      (acc, Provider, idx) => (
        <Provider key={Provider.displayName || Provider.name || `provider-${idx}`}>
          {acc}
        </Provider>
      ),
      pluginContent,
    );

    return <LexicalComposer initialConfig={initialConfig}>{withProviders}</LexicalComposer>;
  };

  return Editor;
}
