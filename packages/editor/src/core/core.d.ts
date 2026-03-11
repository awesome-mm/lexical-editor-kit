import { ComponentType, ReactNode } from "react";
import { EditorThemeClasses, LexicalNode, KlassConstructor } from "lexical";

export type PluginComponent = ComponentType<{}>;
export type ProviderComponent = ComponentType<{ children: ReactNode }>;
export type NodeClass = KlassConstructor<typeof LexicalNode>;

export type EditorConfig = {
  plugins?: PluginComponent[];
  nodes?: NodeClass[];
  providers?: ProviderComponent[];
  theme?: EditorThemeClasses;
};
