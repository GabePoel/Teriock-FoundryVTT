const { fields } = foundry.data;
import { _messageParts } from "./methods/_message-parts.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _rollHitDie, _rollManaDie } from "./methods/_rolling.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseItemData from "../base-data/base-data.mjs";

export default class TeriockRankData extends WikiDataMixin(TeriockBaseItemData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Class" }),
      description: new fields.HTMLField({ initial: "<p>Every adventurer is a journeyman before they join their first class.</p>" }),
      flaws: new fields.HTMLField({ initial: "<p>None.</p>" }),
      archetype: new fields.StringField({ initial: "everyman" }),
      className: new fields.StringField({ initial: "journeyman" }),
      classRank: new fields.NumberField({ initial: 0 }),
      hitDieSpent: new fields.BooleanField({ initial: false }),
      manaDieSpent: new fields.BooleanField({ initial: false }),
      hitDie: new fields.StringField({ initial: "d10" }),
      manaDie: new fields.StringField({ initial: "d10" }),
      hp: new fields.NumberField({ initial: 6 }),
      mp: new fields.NumberField({ initial: 6 }),
      maxAv: new fields.NumberField({ initial: 2 }),
      proficient: new fields.BooleanField({ initial: true }),
    }
  }

  /** @override */
  get wikiPage() {
    return `Class:${CONFIG.TERIOCK.rankOptions[this.archetype].classes[this.className].name}`;
  }

  /** @override */
  async parse(rawHTML) {
    return await _parse(this.parent, rawHTML)
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }

  async rollHitDie() {
    return await _rollHitDie(this.parent);
  }

  async rollManaDie() {
    return await _rollManaDie(this.parent);
  }
}