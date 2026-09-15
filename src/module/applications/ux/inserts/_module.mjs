import { default as noteInserts } from "./note-inserts.mjs";

/**
 * Register custom inserts.
 */
export function registerInserts() {
  CONFIG.TextEditor.inserts.push(noteInserts);
}
