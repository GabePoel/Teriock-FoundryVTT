import { getRollIcon, makeIcon } from "../../../helpers/utils.mjs";
import { StatDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";

const { fields } = foundry.data;

/**
 * Rank-specific item data model.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {TeriockBaseItemData}
 * @mixes WikiDataMixin
 */
export default class TeriockRankData extends StatDataMixin(
  WikiDataMixin(TeriockBaseItemData),
) {
  /**
   * Metadata for this item.
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
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
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
      hpDice: this.defineStatDieField("hp", { faces: 10, value: 6 }),
      mpDice: this.defineStatDieField("mp", { faces: 10, value: 6 }),
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
    return schema;
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Roll Hit Die",
        icon: makeIcon(getRollIcon(this.hitDie.polyhedral), "contextMenu"),
        callback: async () => await this.hitDie.rollStatDie(),
        condition: !this.hitDie.spent,
        group: "usage",
      },
      {
        name: "Recover Hit Die",
        icon: makeIcon("rotate-left", "contextMenu"),
        callback: async () => await this.hitDie.unrollStatDie(),
        condition: this.hitDie.spent,
        group: "usage",
      },
      {
        name: "Roll Mana Die",
        icon: makeIcon(getRollIcon(this.manaDie.polyhedral), "contextMenu"),
        callback: async () => await this.manaDie.rollStatDie(),
        condition: !this.manaDie.spent,
        group: "usage",
      },
      {
        name: "Recover Mana Die",
        icon: makeIcon("rotate-left", "contextMenu"),
        callback: async () => await this.manaDie.unrollStatDie(),
        condition: this.manaDie.spent,
        group: "usage",
      },
    ];
  }

  /**
   * The singular hit die.
   * @returns {StatDieModel}
   */
  get hitDie() {
    return Object.values(this.hpDice)[0];
  }

  /**
   * The singular mana die.
   * @returns {StatDieModel}
   */
  get manaDie() {
    return Object.values(this.mpDice)[0];
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
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
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }
}
