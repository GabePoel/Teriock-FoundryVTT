import { getRollIcon, makeIcon } from "../../../helpers/utils.mjs";
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import { TextField } from "../../shared/fields.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _rollHitDie, _rollManaDie } from "./methods/_rolling.mjs";

const { fields } = foundry.data;

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
  /**
   * Metadata for this item.
   *
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    namespace: "Class",
    pageNameKey: "system.className",
    type: "rank",
    usable: false,
    wiki: true,
  });

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Roll Hit Die",
        icon: makeIcon(getRollIcon(this.hitDie), "contextMenu"),
        callback: this.rollHitDie.bind(this),
        condition: !this.hitDieSpent,
        group: "usage",
      },
      {
        name: "Recover Hit Die",
        icon: makeIcon("rotate-left", "contextMenu"),
        callback: async () =>
          await this.parent.update({ "system.hitDieSpent": false }),
        condition: this.hitDieSpent,
        group: "usage",
      },
      {
        name: "Roll Mana Die",
        icon: makeIcon(getRollIcon(this.manaDie), "contextMenu"),
        callback: this.rollManaDie.bind(this),
        condition: !this.manaDieSpent,
        group: "usage",
      },
      {
        name: "Recover Mana Die",
        icon: makeIcon("rotate-left", "contextMenu"),
        callback: async () =>
          await this.parent.update({ "system.manaDieSpent": false }),
        condition: this.manaDieSpent,
        group: "usage",
      },
    ];
  }

  /** @inheritDoc */
  get wikiPage() {
    const prefix = this.constructor.metadata.namespace;
    const pageName =
      CONFIG.TERIOCK.rankOptionsList[
        foundry.utils.getProperty(
          this.parent,
          this.constructor.metadata.pageNameKey,
        )
      ];
    return `${prefix}:${pageName}`;
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Index of this in parent order.
   * @returns {number|null}
   */
  get order() {
    return this.actor?.system.orderings.ranks.findIndex(
      (id) => id === this.parent.id,
    );
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      description: new TextField({
        initial:
          "<p>Every adventurer is a journeyman before they join their first class.</p>",
        label: "Description",
      }),
      flaws: new TextField({
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

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /**
   * Rolls the hit die for the rank.
   *
   * Relevant wiki pages:
   * - [Hit Points and Mana Points](https://wiki.teriock.com/index.php/Core:Hit_Points_and_Mana_Points)
   *
   * @returns {Promise<void>} Promise that resolves to the hit die roll result.
   */
  async rollHitDie() {
    await _rollHitDie(this);
  }

  /**
   * Rolls the mana die for the rank.
   *
   * Relevant wiki pages:
   * - [Hit Points and Mana Points](https://wiki.teriock.com/index.php/Core:Hit_Points_and_Mana_Points)
   *
   * @returns {Promise<void>} Promise that resolves to the mana die roll result.
   */
  async rollManaDie() {
    await _rollManaDie(this);
  }
}
