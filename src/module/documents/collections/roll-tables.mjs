import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { RollTables } = foundry.documents.collections;

//noinspection JSClosureCompilerSyntax
/**
 * @implements {TypeCollection<TeriockRollTable, TeriockRollTable>}
 * @implements {DocumentCollection<TeriockRollTable>}
 * @property {TeriockRollTable|null} activeGM
 */
export default class TeriockRollTables extends BaseWorldCollectionMixin(
  RollTables,
) {}
