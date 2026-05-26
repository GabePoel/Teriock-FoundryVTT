import { documentConfig } from "../../../constants/config/document-config.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { getIdentifierIcon, makeIcon, makeIconClass } from "../../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockRank}.
 * @extends {BaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockRank} document
 * @property {TeriockRank} item
 */
export default class RankSheet extends mixClasses(BaseItemSheet, mixins.WikiButtonSheetMixin) {
  /**
   * Toggle whether this is innate.
   * @returns {Promise<void>}
   */
  static async #onToggleInnate() {
    await this.document.update({ "system.innate": !this.document.system.innate });
  }

  /** @inheritDoc */
  static BARS = [
    "teriock/sheets/items/rank/class-bar",
    "teriock/sheets/shared/bars/stat-bar",
    "teriock/sheets/items/rank/restrictions-bar",
  ];

  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    actions: { toggleInnate: this.#onToggleInnate },
    classes: ["rank"],
    window: { icon: makeIconClass(documentConfig.rank.icon, "title") },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) return;

    /** @type {TeriockJournalEntryPage[]} */
    const classes = await Promise.all(
      Object.values(game.teriock.identifiers.getUuids("class")).map(uuid => fromUuid(uuid)),
    );
    const archetypeOptions = Object.entries(game.teriock.identifiers.getNames("archetype")).map(([k, v]) => {
      const updateData = {
        system: { archetype: k, class: classes.find(c => c.system.archetype === `archetype:${k}`)?.system.identifier },
      };
      if (TERIOCK.config.rank[k]) {
        updateData.system["statDice.hp.formula"] = `1d${TERIOCK.config.rank[k].hp}`;
        updateData.system["statDice.mp.formula"] = `1d${TERIOCK.config.rank[k].mp}`;
      }
      return {
        icon: makeIcon(getIdentifierIcon(`archetype:${k}`)),
        label: v,
        onClick: async () => await this.document.update(updateData),
      };
    });
    const classOptions = classes.map(c => {
      return {
        icon: makeIcon(getIdentifierIcon(c.typedIdentifier)),
        label: c.name,
        onClick: async () => await this.document.update({ system: { class: c.system.identifier } }),
        visible: () => this.document.system.archetype === c.system.archetype,
      };
    });
    this._connectContextMenu(".archetype-box", archetypeOptions, "click");
    this._connectContextMenu(".class-box", classOptions, "click");
  }
}
