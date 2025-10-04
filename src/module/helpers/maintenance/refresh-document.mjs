import { toCamelCase } from "../string.mjs";

export function refreshDocument(doc) {
  if (
    doc.type === "ability" &&
    TERIOCK.index.abilities[toCamelCase(doc.type)]
  ) {
  }
}
