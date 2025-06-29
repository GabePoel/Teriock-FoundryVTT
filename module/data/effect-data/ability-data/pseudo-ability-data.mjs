/** @import { MessageParts } from "../../../types/messages" */
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { _suppressed } from "./methods/_suppression.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
const { DataModel } = foundry.abstract;

/**
 * @extends {TeriockBaseEffectData}
 * @extends {WikiDataMixin}
 */
export default class TeriockPseudoAbilityData extends WikiDataMixin(DataModel) {
  static DEPTH = 0;

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "pseudo-ability",
      embedded: {
        PseudoAbility: "system.children",
      },
    });
  }

  /** @override */
  static defineSchema(depth = this.DEPTH) {
    return _defineSchema(depth);
  }

  // /** @override */
  // prepareDerivedData() {
  //   super.prepareDerivedData();
  //   _prepareDerivedData(this);
  // }

  /** @override */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  // /** @override */
  // get parent() {
  //   return this.parent;
  // }

  /** @override */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  /** @override */
  async roll(options) {
    return await _roll(this, options);
  }

  /**
   * @returns {MessageParts}
   * @override
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /** @override */
  get wikiPage() {
    return `${this.wikiNamespace}:${this.parent.name}`;
  }

  /** @override */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }
}
