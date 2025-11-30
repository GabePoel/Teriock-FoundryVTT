const { Collection } = foundry.utils;

//noinspection JSClosureCompilerSyntax
/**
 * @inheritDoc
 * @extends {Collection<ID<TeriockChild>, TeriockChild|Index<TeriockChild>>}
 */
export default class TypeCollection extends Collection {
  /**
   * Get documents of a given type.
   * @param {Teriock.Documents.CommonType} type
   * @returns {SyncDoc<TeriockChild>[]}
   */
  byType(type) {
    return this.contents.filter((d) => d.type === type);
  }
}
