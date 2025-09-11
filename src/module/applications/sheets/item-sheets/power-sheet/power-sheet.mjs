import { documentOptions } from "../../../../constants/options/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import { powerContextMenu } from "./connections/_context-menus.mjs";

/**
 * Sheet for a {@link TeriockPower}.
 *
 * @property {TeriockPower} document
 * @property {TeriockPower} item
 */
export default class TeriockPowerSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: [ "power" ],
    actions: {
      toggleProficient: this._toggleProficient,
    },
    window: {
      icon: "fa-solid fa-" + documentOptions.power.icon,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/document-templates/item-templates/power-template/power-template.hbs",
      scrollable: [
        ".window-content",
        ".tsheet-page",
        ".ab-sheet-everything",
      ],
    },
  };

  /**
   * Toggles the proficient state of the power.
   * @returns {Promise<void>} Promise that resolves when proficient state is toggled.
   * @static
   */
  static async _toggleProficient() {
    if (this.editable) {
      await this.item.update({
        "system.proficient": !this.item.system.proficient,
      });
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }
    const powerContextMenuOptions = powerContextMenu(this.item);
    this._connectContextMenu(".power-box", powerContextMenuOptions, "click");
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    if (this.document.getFlag("teriock", "effectWrapper")) {
      /** @type {TeriockEffect} */
      const effect = this.document.effects.getName(this.document.name);
      await effect.sheet.render(true);
      await this.close();
    }
    const context = await super._prepareContext(options);
    await this._enrichAll(context, {
      description: this.item.system.description,
      flaws: this.item.system.flaws,
    });
    return context;
  }
}
