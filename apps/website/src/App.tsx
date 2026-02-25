import { Editor } from "lexical-editor-kit";
import "lexical-editor-kit/style.css";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Lexical Editor Playground - 완성된 editor를 install하고 사용할거에요</h1>
      <Editor />
    </div>
  );
}
