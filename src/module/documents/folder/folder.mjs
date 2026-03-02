import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Folder } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock Folder implementation.
 * @implements {Teriock.Documents.FolderInterface}
 * @extends {ClientDocument}
 * @extends {Folder}
 * @mixes BaseDocument
 */
export default class TeriockFolder extends BaseDocumentMixin(Folder) {
  //noinspection JSValidateJSDoc
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
   * Get the contents of a folder from its UUID.
   * @param {UUID<TeriockFolder>|TeriockFolder} folder
   * @param {object} [options]
   * @param {Teriock.Documents.CommonType[]} [options.types] - Subset of types to filter for.
   * @param {boolean} [options.uuids] - Get the UUIDs instead of the documents.
   * @returns {Promise<UUID<TeriockDocument>[]|TeriockDocument[]>}
   */
  static async getContents(folder, options = {}) {
    const { types, uuids = true } = options;
    if (typeof folder === "string") {
      folder = await fromUuid(folder);
    }
    let out = [];
    if (folder) {
      out = folder.allContents;
      if (types) {
        out = out.filter((d) => types.includes(d.type));
      }
      if (uuids) {
        out = out.map((d) => d.uuid);
      } else if (folder.inCompendium) {
        out = Promise.all(out.map((d) => fromUuid(d.uuid)));
      }
    }
    return out;
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

  /** @inheritDoc */
  get contents() {
    return super.contents.filter((d) => !d.system?._sup);
  }
}
