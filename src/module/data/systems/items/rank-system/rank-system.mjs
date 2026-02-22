import { icons } from "../../../../constants/display/icons.mjs";
import { resolveDocument } from "../../../../helpers/resolve.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import { getRollIcon, makeIcon, mix } from "../../../../helpers/utils.mjs";
import { TextField } from "../../../fields/_module.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Rank-specific item data model.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {BaseItemSystem}
 * @extends {CommonSystem}
 * @implements {Teriock.Models.RankSystemInterface}
 * @mixes CompetenceDisplaySystem
 * @mixes StatGiverSystem
 * @mixes WikiSystem
 */
export default class RankSystem extends mix(
  BaseItemSystem,
  mixins.CompetenceDisplaySystemMixin,
  mixins.WikiSystemMixin,
  mixins.StatGiverSystemMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Rank",
  ];

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
    return Object.assign(super.defineSchema(), {
      archetype: new fields.StringField({
        initial: "everyman",
      }),
      className: new fields.StringField({
        initial: "journeyman",
      }),
      classRank: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      competence: new fields.EmbeddedDataField(CompetenceModel, {
        initial: { raw: 1 },
      }),
      description: new TextField({
        initial: game.i18n.localize(
          "TERIOCK.SYSTEMS.Rank.FIELDS.description.initial",
        ),
      }),
      innate: new fields.BooleanField({ initial: false }),
      maxAv: new fields.NumberField({
        initial: 2,
        integer: true,
        min: 0,
      }),
    });
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
  get isOnWiki() {
    return this.classRank > 0 && this.classRank <= 5;
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

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: TERIOCK.options.rank[this.archetype].classes[this.className].icon,
        label: game.i18n.localize("TERIOCK.SYSTEMS.Rank.PANELS.class"),
        wrappers: [
          TERIOCK.options.rank[this.archetype].name,
          TERIOCK.options.rank[this.archetype].classes[this.className].name,
          game.i18n.format("TERIOCK.SYSTEMS.Rank.PANELS.rank", {
            value: this.classRank,
          }),
        ],
      },
      this._statBar,
      {
        icon: icons.armament.av,
        label: game.i18n.localize("TERIOCK.SYSTEMS.Rank.PANELS.details"),
        wrappers: [
          this.maxAv === 0
            ? game.i18n.localize("TERIOCK.SYSTEMS.Power.PANELS.noArmor")
            : game.i18n.format("TERIOCK.SYSTEMS.Power.PANELS.maxAv", {
                value: this.maxAv,
              }),
          this.innate
            ? game.i18n.localize("TERIOCK.SYSTEMS.Rank.PANELS.innate")
            : game.i18n.localize("TERIOCK.SYSTEMS.Rank.PANELS.learned"),
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
    if (this.parent.checkEditor(userId) && this.actor && this.classRank === 1) {
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
    if (this.parent.checkEditor(userId) && this.actor) {
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
  getCardContextMenuEntries(doc) {
    return [
      ...super.getCardContextMenuEntries(doc),
      {
        name: game.i18n.localize("TERIOCK.SYSTEMS.Rank.MENU.rollHpDie"),
        icon: makeIcon(
          getRollIcon(this.hpDie?.polyhedral || ""),
          "contextMenu",
        ),
        callback: async () => await this.hpDie.use(),
        condition: !!this.hpDie && !this.hpDie?.spent,
        group: "usage",
      },
      {
        name: game.i18n.localize("TERIOCK.SYSTEMS.Rank.MENU.recoverHpDie"),
        icon: makeIcon(TERIOCK.display.icons.ui.undo, "contextMenu"),
        callback: async () => await this.hpDie.unuse(),
        condition: !!this.hpDie && this.hpDie?.spent,
        group: "usage",
      },
      {
        name: game.i18n.localize("TERIOCK.SYSTEMS.Rank.MENU.rollMpDie"),
        icon: makeIcon(
          getRollIcon(this.mpDie?.polyhedral || ""),
          "contextMenu",
        ),
        callback: async () => await this.mpDie.use(),
        condition: !!this.mpDie && !this.mpDie?.spent,
        group: "usage",
      },
      {
        name: game.i18n.localize("TERIOCK.SYSTEMS.Rank.MENU.recoverMpDie"),
        icon: makeIcon(TERIOCK.display.icons.ui.undo, "contextMenu"),
        callback: async () => await this.mpDie.unuse(),
        condition: !!this.mpDie && this.mpDie?.spent,
        group: "usage",
      },
    ];
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      class: this.className,
      [`class.${this.className.slice(0, 3).toLowerCase()}`]: 1,
      number: this.classRank,
      innate: this.innate ? 1 : 0,
      maxAv: this.maxAv,
      av: this.maxAv,
      archetype: this.archetype,
      [`archetype.${this.archetype.slice(0, 3).toLowerCase()}`]: 1,
    };
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
