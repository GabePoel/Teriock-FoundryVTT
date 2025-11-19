import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Folder } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Folder} implementation.
 * @extends {ClientDocument}
 * @extends {Folder}
 * @mixes BaseDocument
 */
export default class TeriockFolder extends BaseDocumentMixin(Folder) {
  /**
   * Get all the entries recursively from a child node.
   * @param {FolderChildNode} node
   * @returns {Array}
   */
  static getAllEntries(node) {
    const entries = node.entries;
    for (const child of node.children) {
      entries.push(...this.getAllEntries(child));
    }
    return entries;
  }

  /**
   * All contents of this folder and its descendants.
   * @returns {ClientDocument[]}
   */
  get allContents() {
    const contents = [...this.contents];
    for (const child of this.children) {
      contents.push(...this.constructor.getAllEntries(child));
    }
    return contents;
  }
}
