import { mixClasses } from "../../helpers/construction.mjs";
import BaseWorldCollectionMixin from "./base-world-collection-mixin.mjs";

const { RollTables } = foundry.documents.collections;

/**
 * @import { DocumentCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @mixes BaseWorldCollection
 * @implements {DocumentCollection<TeriockRollTable>}
 * @property {TeriockRollTable|null} activeGM
 */
export default class TeriockRollTables extends mixClasses(RollTables, BaseWorldCollectionMixin) {}
