import { _defineSchema } from "./schema/_schema.mjs";
import { _messageParts } from "./_message-parts.mjs";
import { _parse } from "./_parsing.mjs";
import { _roll } from "./_rolling.mjs";
import { _migrateData } from "./_migrate-data.mjs";
import { TeriockBaseEffectData } from "../base-data/base-data.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";

export class TeriockAbilityData extends WikiDataMixin(TeriockBaseEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      ..._defineSchema(),
    }
  }

  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @override */
  async roll(options) {
    return await _roll(this.parent, options);
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }

  /** @override */
  get wikiPage() {
    return `Ability:${this.parent.name}`;
  }

  /** @override */
  async parse(rawHTML) {
    return await _parse(this.parent, rawHTML);
  }
}