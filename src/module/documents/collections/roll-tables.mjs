import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { RollTables } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {TypeCollection<TeriockRollTable, TeriockRollTable>}
 * @implements {DocumentCollection<TeriockRollTable>}
 * @property {TeriockRollTable|null} activeGM
 */
export default class TeriockRollTables extends BaseWorldCollectionMixin(RollTables) {}
