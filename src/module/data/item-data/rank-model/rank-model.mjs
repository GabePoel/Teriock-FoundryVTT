import { toCamelCase } from "../../../helpers/string.mjs";
import {
  getRollIcon,
  isOwnerAndCurrentUser,
  makeIcon,
  resolveDocument,
} from "../../../helpers/utils.mjs";
import {
  ProficiencyDataMixin,
  StatGiverDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import { TextField } from "../../fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { _parse } from "./methods/_parsing.mjs";

const { fields } = foundry.data;

/**
 * Rank-specific item data model.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes StatGiverData
 * @mixes WikiData
 */
export default class TeriockRankModel extends StatGiverDataMixin(
  WikiDataMixin(ProficiencyDataMixin(TeriockBaseItemModel)),
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      namespace: "Class",
      pageNameKey: "system.className",
      type: "rank",
      indexCategoryKey: "classes",
      indexCompendiumKey: "classes",
    });
  }

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
        initial: "",
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
        label: "Maximum AV",
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
  getCardContextMenuEntries(doc) {
    return [
      ...super.getCardContextMenuEntries(doc),
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
      return TERIOCK.display.colors.purple;
    } else {
      return TERIOCK.display.colors.grey;
    }
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", "system.flaws"];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = TERIOCK.options.rank[this.archetype].name;
    return parts;
  }

  /**
   * The singular hit die.
   * @returns {StatDieModel}
   */
  get hpDie() {
    return this.statDice.hp.dice[0];
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (this.actor && this.actor.system.isTransformed) {
      if (
        this.parent.elder?.documentName === "Actor" &&
        this.actor.system.transformation.suppression.ranks
      ) {
        suppressed = true;
      }
    }
    if (
      game.settings.get("teriock", "armorSuppressesRanks") &&
      this.actor &&
      !this.innate &&
      this.actor.system.defense.av.base > this.maxAv
    ) {
      suppressed = true;
    }
    return suppressed;
  }

  get messageBars() {
    return [
      {
        icon:
          "fa-" +
          TERIOCK.options.rank[this.archetype].classes[this.className].icon,
        label: "Class",
        wrappers: [
          TERIOCK.options.rank[this.archetype].name,
          TERIOCK.options.rank[this.archetype].classes[this.className].name,
          "Rank " + this.classRank,
        ],
      },
      {
        icon: "fa-dice",
        label: "Stat Dice",
        wrappers: [
          this.statDice.hp.formula + " Hit Dice",
          this.statDice.mp.formula + " Mana Dice",
        ],
      },
      {
        icon: "fa-helmet-battle",
        label: "Details",
        wrappers: [
          this.maxAv === 0 ? "No Armor" : this.maxAv + " Max AV",
          this.innate ? "Innate" : "Learned",
        ],
      },
    ];
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
  async _createFromChildDeltaMap(createMap) {
    if (this.classRank < 3 || this.parent.abilities.length !== 2) {
      await super._createFromChildDeltaMap(createMap);
    }
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (
      isOwnerAndCurrentUser(this.parent, userId) &&
      this.actor &&
      this.classRank === 1
    ) {
      const needsArchetype =
        !this.actor.itemKeys.power.has(this.archetype) &&
        this.archetype !== "everyman";
      if (needsArchetype) {
        const archetypeName = TERIOCK.options.rank[this.archetype].name;
        resolveDocument(
          game.teriock.packs.classes.index.getName(archetypeName),
        ).then((p) =>
          this.actor.createChildDocuments(
            "Item",
            [game.items.fromCompendium(p, { clearSort: true, keepId: true })],
            { keepId: true },
          ),
        );
      }
    }
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (isOwnerAndCurrentUser(this.parent, userId) && this.actor) {
      const archetypePowers = this.actor.powers.filter(
        (p) => toCamelCase(p.name) === this.archetype,
      );
      const needsArchetype =
        this.actor.ranks.filter((r) => r.system.archetype === this.archetype)
          .length > 0;
      if (!needsArchetype && archetypePowers.length > 0) {
        this.actor
          .deleteChildDocuments(
            "Item",
            archetypePowers.map((p) => p.id),
          )
          .then();
      }
    }
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (this.parent.sup?.type === "species") {
      this.innate = true;
    }
    if (
      game.settings.get("teriock", "armorWeakensRanks") &&
      this.actor &&
      this.actor.system.defense.av.base > this.maxAv
    ) {
      this.proficient = false;
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const pool of Object.values(this.statDice)) {
      if (this.innate) {
        pool.disabled = true;
      }
    }
  }

  /** @inheritDoc */
  prepareSpecialData() {
    if (this.parent.actor && this.parent.actor.system.isTransformed) {
      if (this.parent.actor.system.transformation.suppression.ranks) {
        this.statDice.hp.disabled = true;
        if (this.parent.actor.system.transformation.level === "greater") {
          this.statDice.mp.disabled = true;
        }
      }
    }
    super.prepareSpecialData();
  }
}
