import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { EditorConfig } from "./core";
import PlaygroundEditorTheme from "../editor/config/themes/PlaygroundEditorTheme";

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
        {plugins.map((Plugin, i) => (
          <Plugin key={i} />
        ))}
      </>
    );

    const withProviders = providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      pluginContent,
    );

    return <LexicalComposer initialConfig={initialConfig}>{withProviders}</LexicalComposer>;
  };

  return Editor;
}
