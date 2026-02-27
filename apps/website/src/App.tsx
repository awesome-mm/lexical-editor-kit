import { Editor } from "lexical-editor-kit";
import "lexical-editor-kit/style.css";

export default function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Lexical Editor Playground </h1>
      <Editor />
    </div>
  );
}
