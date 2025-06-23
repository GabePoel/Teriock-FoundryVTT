/** @import { MessageParts } from "../../../types/messages" */
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 * @extends {WikiDataMixin}
 */
export default class TeriockAbilityData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "ability",
    });
  }

  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      ..._defineSchema(),
    };
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    _prepareDerivedData(this);
  }

  /** @override */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
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
