/**
 * Collaboration provider factory stub.
 * Replace with a real WebSocket/sync implementation (e.g. Yjs + Hocuspocus)
 * when enabling collaborative editing.
 */
import type { Provider } from "@lexical/yjs";
import type { Doc } from "yjs";

export function createWebsocketProvider(_id: string, _yjsDocMap: Map<string, Doc>): Provider {
  throw new Error(
    "Collaboration is not configured. Implement createWebsocketProvider in editor/collaboration.ts (e.g. with Yjs + Hocuspocus) to enable collaborative editing.",
  );
}
