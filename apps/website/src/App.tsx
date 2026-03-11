import PlayGroundEditor from "./playground-editor/PlayGroundEditor";
import Editor from "./custom-editor/Editor";

import "lexical-editor-kit/index.css";
import "./App.css";

import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("playground");

  return (
    <div className="root-container">
      <div className="inner-container">
        <div className="tabs">
          <button
            id="playground-tab-button"
            className={`tab-button ${activeTab === "playground" ? "active" : ""}`}
            onClick={() => setActiveTab("playground")}
            title="Playground Editor"
          >
            Playground
          </button>
          <button
            id="custom-tab-button"
            className={`tab-button ${activeTab === "custom" ? "active" : ""}`}
            onClick={() => setActiveTab("custom")}
            title="Custom Editor"
          >
            Custom
          </button>
        </div>

        <div className="editor-container">
          {/* Playground Editor */}
          {activeTab === "playground" && (
            <div className="editor-item playground-editor">
              <h1>Lexical Editor Playground </h1>
              <PlayGroundEditor />
            </div>
          )}

          {/* Custom Editor */}
          {activeTab === "custom" && (
            <div className="editor-item custom-editor">
              <h1>Custom Editor </h1>
              <Editor />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
