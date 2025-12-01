const { Collection } = foundry.utils;

//noinspection JSClosureCompilerSyntax
/**
 * @inheritDoc
 * @extends {Collection<ID<TeriockCommon>, TeriockCommon|Index<TeriockCommon>>}
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
