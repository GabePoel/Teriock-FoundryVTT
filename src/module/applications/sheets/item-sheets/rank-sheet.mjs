import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIcon, makeIconClass } from "../../../helpers/icon.mjs";
import { ChildSheet } from "../utility-sheets/_module.mjs";

/**
 * Creates context menu entries for selecting a rank's archetype.
 * Generates options for all available archetypes with appropriate hit and mana dice.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {ContextMenuEntry[]}
 */
function archetypeContextMenu(rank) {
  const options = [];
  for (const [aKey, aData] of Object.entries(TERIOCK.config.class.archetypes)) {
    const firstClass = Object.keys(TERIOCK.config.class.classes).find(cKey =>
      TERIOCK.config.class.classes[cKey].archetype === aKey
    );
    const option = {
      icon: makeIcon(aData.icon, "contextMenu"),
      label: aData.label,
      onClick: async () => {
        await rank.update({
          system: {
            archetype: aKey,
            class: firstClass,
            "statDice.hp.formula": `1d${aData.stats.hp}`,
            "statDice.mp.formula": `1d${aData.stats.mp}`,
          },
        });
      },
    };
    options.push(option);
  }
  return options;
}

/**
 * Creates context menu entries for selecting a rank's class.
 * Generates options for all classes within the current archetype.
 * @param {TeriockRank} rank - The rank item to create the context menu for.
 * @returns {ContextMenuEntry[]}
 */
export function classContextMenu(rank) {
  const options = [];
  for (const [cKey, cData] of Object.entries(TERIOCK.config.class.classes)) {
    const aKey = cData.archetype;
    const option = {
      icon: makeIcon(cData.icon, "contextMenu"),
      label: cData.label,
      onClick: async () => await rank.update({ system: { archetype: aKey, class: cKey } }),
      visible: () => rank.system._source.archetype === aKey,
    };
    options.push(option);
  }
  return options;
}

/**
 * Sheet for a {@link TeriockRank}.
 * @extends {ChildSheet}
 * @property {TeriockRank} document
 */
export default class RankSheet extends ChildSheet {
  /**
   * Toggle whether this is innate.
   * @returns {Promise<void>}
   */
  static async #onToggleInnate() {
    await this.document.update({ "system.innate": !this.document.system.innate });
  }

  /** @type {string[]} */
  static BARS = [
    "teriock/sheets/items/rank/class-bar",
    "teriock/sheets/shared/bars/stat-bar",
    "teriock/sheets/items/rank/restrictions-bar",
  ];

  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { toggleInnate: this.#onToggleInnate },
    classes: ["rank"],
    window: { icon: makeIconClass(documentConfig.rank.icon, "title") },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.isEditable) { return; }

    [{ menu: classContextMenu, selector: ".class-box" }, { menu: archetypeContextMenu, selector: ".archetype-box" }]
      .forEach(({ menu, selector }) => {
        this._connectContextMenu(selector, menu(this.document));
      });
  }
}
