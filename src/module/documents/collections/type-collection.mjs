const { Collection } = foundry.utils;

//noinspection JSClosureCompilerSyntax,JSUnresolvedReference
/**
 * @inheritDoc
 * @template K
 * @template V
 * @extends {Collection<ID<K>, V>}
 */
export default class TypeCollection extends Collection {
  /**
   * An object with the children sorted by their type.
   * @returns {Record<Teriock.Documents.CommonType, TeriockCommon[]>}
   */
  get typeMap() {
    const documentTypeMap = {};
    const documentTypes = new Set(this.contents.map((d) => d.type));
    for (const documentType of documentTypes) {
      documentTypeMap[documentType] = this.contents.filter(
        (d) => d.type === documentType,
      );
    }
    return documentTypeMap;
  }
}

/**
 * @template T
 * @typedef {TypeCollection<TeriockCommon, TeriockCommon | Index<TeriockCommon>>} IndexCollection
 */
