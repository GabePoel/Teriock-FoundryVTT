import { getRank } from "../../../helpers/fetch.mjs";
import { getRollIcon, makeIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import { StatGiverDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";

const { fields } = foundry.data;

/**
 * Rank-specific item data model.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes StatGiverDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockRankModel extends StatGiverDataMixin(
  WikiDataMixin(TeriockBaseItemModel),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Class",
    pageNameKey: "system.className",
    type: "rank",
    indexCategoryKey: "classes",
    indexCompendiumKey: "classes",
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
      innate: new fields.BooleanField({
        initial: false,
        label: "Innate",
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
    return schema;
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Roll Hit Die",
        icon: makeIcon(getRollIcon(this.hpDie.polyhedral), "contextMenu"),
        callback: async () => await this.hpDie.use(),
        condition: !this.hpDie.spent,
        group: "usage",
      },
      {
        name: "Recover Hit Die",
        icon: makeIcon("rotate-left", "contextMenu"),
        callback: async () => await this.hpDie.unuse(),
        condition: this.hpDie.spent,
        group: "usage",
      },
      {
        name: "Roll Mana Die",
        icon: makeIcon(getRollIcon(this.mpDie.polyhedral), "contextMenu"),
        callback: async () => await this.mpDie.use(),
        condition: !this.mpDie.spent,
        group: "usage",
      },
      {
        name: "Recover Mana Die",
        icon: makeIcon("rotate-left", "contextMenu"),
        callback: async () => await this.mpDie.unuse(),
        condition: this.mpDie.spent,
        group: "usage",
      },
    ];
  }

  /** @inheritDoc */
  get color() {
    if (this.innate) {
      return "#9141AC";
    } else {
      return "#77767b";
    }
  }

  /**
   * The singular hit die.
   * @returns {StatDieModel}
   */
  get hpDie() {
    return this.statDice.hp.dice[0];
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * The singular mana die.
   * @returns {StatDieModel}
   */
  get mpDie() {
    return this.statDice.mp.dice[0];
  }

  /** @inheritDoc */
  get wikiPage() {
    const prefix = this.constructor.metadata.namespace;
    const pageName =
      TERIOCK.index.classes[
        foundry.utils.getProperty(
          this.parent,
          this.constructor.metadata.pageNameKey,
        )
      ];
    return `${prefix}:${pageName}`;
  }

  /** @inheritDoc */
  async getIndexReference() {
    return await getRank(this.system.className, this.system.classRank);
  }

  /** @inheritDoc */
  async hardRefreshFromIndex() {
    await this.refreshFromIndex();
    const reference = await this.getIndexReference();
    const toDelete = this.parent
      .getAbilities()
      .filter(
        (a) =>
          !reference.parent
            .getAbilities()
            .map((a) => a.name)
            .includes(a.name),
      )
      .map((a) => a.id);
    await this.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    for (const pool of Object.values(this.statDice)) {
      if (this.innate) {
        pool.disabled = true;
      }
    }
  }

  /** @inheritDoc */
  async refreshFromIndex() {
    for (const a of this.parent.abilities) {
      await a.system.refreshFromIndex();
    }
  }
}
