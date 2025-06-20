const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _rollHitDie, _rollManaDie } from "./methods/_rolling.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseItemData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseItemData}
 */
export default class TeriockRankData extends WikiDataMixin(TeriockBaseItemData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "rank",
    });
  }

  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({
        initial: "Class",
        gmOnly: true,
      }),
      description: new fields.HTMLField({
        initial: "<p>Every adventurer is a journeyman before they join their first class.</p>",
        label: "Description",
      }),
      flaws: new fields.HTMLField({
        initial: "<p>None.</p>",
        label: "Flaws",
      }),
      archetype: new fields.StringField({
        initial: "everyman",
        label: "Archetype",
      }),
      className: new fields.StringField({
        initial: "journeyman",
        label: "Class Name",
      }),
      classRank: new fields.NumberField({
        initial: 0,
        integer: true,
        label: "Class Rank",
        min: 0,
      }),
      hitDieSpent: new fields.BooleanField({
        initial: false,
        label: "Hit Die Spent",
      }),
      manaDieSpent: new fields.BooleanField({
        initial: false,
        label: "Mana Die Spent",
      }),
      hitDie: new fields.StringField({
        initial: "d10",
        label: "Hit Die",
        choices: {
          d4: "d4",
          d6: "d6",
          d8: "d8",
          d10: "d10",
          d12: "d12",
          d20: "d20",
        },
      }),
      manaDie: new fields.StringField({
        initial: "d10",
        label: "Mana Die",
        choices: {
          d4: "d4",
          d6: "d6",
          d8: "d8",
          d10: "d10",
          d12: "d12",
          d20: "d20",
        },
      }),
      hp: new fields.NumberField({
        initial: 6,
        integer: true,
        label: "HP",
        min: 0,
      }),
      mp: new fields.NumberField({
        initial: 6,
        integer: true,
        label: "MP",
        min: 0,
      }),
      maxAv: new fields.NumberField({
        initial: 2,
        integer: true,
        label: "Max AV",
        min: 0,
      }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
    };
  }

  /** @override */
  get wikiPage() {
    return `Class:${CONFIG.TERIOCK.rankOptions[this.archetype].classes[this.className].name}`;
  }

  /** @override */
  async parse(rawHTML) {
    return await _parse(this.parent, rawHTML);
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
