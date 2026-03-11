import { createEditor } from "./createEditor";
import { LexicalNode } from "lexical";
import { ComponentType, ReactNode } from "react";

type Plugin = ComponentType<any>;

type Provider = ComponentType<{
  children: ReactNode;
}>;

export class EditorBuilder {
  private plugins: Plugin[] = [];
  private nodes: (typeof LexicalNode)[] = [];
  private providers: Provider[] = [];

  usePlugin(plugin: Plugin) {
    this.plugins.push(plugin);
    return this;
  }

  useNode(node: typeof LexicalNode) {
    this.nodes.push(node);
    return this;
  }

  useProvider(provider: Provider) {
    this.providers.push(provider);
    return this;
  }

  build() {
    return createEditor({
      plugins: this.plugins,
      nodes: this.nodes,
      providers: this.providers,
    });
  }
}
