import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import {
  archetypeContextMenu,
  classContextMenu,
  hitDieContextMenu,
  manaDieContextMenu,
  rankContextMenu,
} from "./connections/_context-menus.mjs";

const { DialogV2 } = foundry.applications.api;

/**
 * Sheet for a {@link TeriockRank}.
 *
 * @property {TeriockRank} document
 * @property {TeriockRank} item
 */
export default class TeriockRankSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["rank"],
    window: {
      icon: "fa-solid fa-" + documentOptions.rank.icon,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/rank-template/rank-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.enrichedDescription = await this._editor(
      this.item.system.description,
    );
    context.enrichedFlaws = await this._editor(this.item.system.flaws);
    return context;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) return;
    [
      { selector: ".rank-box", menu: rankContextMenu },
      { selector: ".class-box", menu: classContextMenu },
      { selector: ".archetype-box", menu: archetypeContextMenu },
      { selector: ".hit-die-box", menu: hitDieContextMenu },
      { selector: ".mana-die-box", menu: manaDieContextMenu },
    ].forEach(({ selector, menu }) => {
      this._connectContextMenu(selector, menu(this.item), "click");
    });
    [
      {
        selector: ".hit-die-box",
        confirmText:
          "Are you sure you want to re-roll how much HP you gain from this rank?",
        dieKey: "hitDie",
        updateKey: "hp",
      },
      {
        selector: ".mana-die-box",
        confirmText:
          "Are you sure you want to re-roll how much mana you gain from this rank?",
        dieKey: "manaDie",
        updateKey: "mp",
      },
    ].forEach(({ selector, confirmText, dieKey, updateKey }) => {
      const el = this.element.querySelector(selector);
      if (el) {
        el.addEventListener("contextmenu", async () => {
          const proceed = await DialogV2.confirm({
            content: confirmText,
            rejectClose: false,
            modal: true,
          });
          if (proceed) {
            const die = this.item.system[dieKey];
            const maxRoll = parseInt(die.slice(1), 10);
            const newValue = Math.floor(Math.random() * maxRoll) + 1;
            await this.item.update({ [`system.${updateKey}`]: newValue });
          }
        });
      }
    });
  }
}
