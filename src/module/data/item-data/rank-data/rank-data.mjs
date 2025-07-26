const { fields } = foundry.data;
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _rollHitDie, _rollManaDie } from "./methods/_rolling.mjs";

/**
 * Rank-specific item data model.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {TeriockBaseItemData}
 */
export default class TeriockRankData extends WikiDataMixin(
  TeriockBaseItemData,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "rank",
    });
  }

  /**
   * Gets the wiki page URL for the rank.
   *
   * @returns {string} The wiki page URL for the class.
   * @override
   */
  get wikiPage() {
    return `Class:${CONFIG.TERIOCK.rankOptions[this.archetype].classes[this.className].name}`;
  }

  /**
   * Gets the message parts for the rank.
   * Combines base message parts with rank-specific message parts.
   *
   * @returns {object} Object containing message parts for the rank.
   * @override
   */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }

  /**
   * Defines the schema for the rank data model.
   *
   * @returns {object} The schema definition for the rank data.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({
        initial: "Class",
        gmOnly: true,
      }),
      description: new fields.HTMLField({
        initial:
          "<p>Every adventurer is a journeyman before they join their first class.</p>",
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
    });
  }

  /**
   * Parses raw HTML content for the rank.
   *
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<object>} Promise that resolves to the parsed HTML content.
   * @override
   */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /**
   * Rolls the hit die for the rank.
   *
   * Relevant wiki pages:
   * - [Hit Points and Mana Points](https://wiki.teriock.com/index.php/Core:Hit_Points_and_Mana_Points)
   *
   * @returns {Promise<object>} Promise that resolves to the hit die roll result.
   */
  async rollHitDie() {
    return await _rollHitDie(this.parent);
  }

  /**
   * Rolls the mana die for the rank.
   *
   * Relevant wiki pages:
   * - [Hit Points and Mana Points](https://wiki.teriock.com/index.php/Core:Hit_Points_and_Mana_Points)
   *
   * @returns {Promise<object>} Promise that resolves to the mana die roll result.
   */
  async rollManaDie() {
    return await _rollManaDie(this.parent);
  }
}
