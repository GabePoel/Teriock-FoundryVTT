import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { setStatDiceDialog } from "../../../dialogs/_module.mjs";
import { WikiButtonSheetMixin } from "../../mixins/_module.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 * @extends {TeriockBaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockSpecies} document
 * @property {TeriockSpecies} item
 */
export default class TeriockSpeciesSheet extends WikiButtonSheetMixin(
  TeriockBaseItemSheet,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["species"],
    window: {
      icon: "fa-solid fa-" + documentOptions.species.icon,
    },
    actions: {
      setHpDice: this._setHpDice,
      setMpDice: this._setMpDice,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/species-template/species-template.hbs",
      scrollable: [".window-content", ".tsheet-page", ".ab-sheet-everything"],
    },
  };

  /**
   * Set an HP dice formula.
   * @returns {Promise<void>}
   * @private
   */
  static async _setHpDice() {
    await setStatDiceDialog(
      this.document,
      "hp",
      this.document.system.statDice.hp.number.saved,
      this.document.system.statDice.hp.faces,
    );
  }

  /**
   * Set an MP dice formula.
   * @returns {Promise<void>}
   * @private
   */
  static async _setMpDice() {
    await setStatDiceDialog(
      this.document,
      "mp",
      this.document.system.statDice.mp.number.saved,
      this.document.system.statDice.mp.faces,
    );
  }

  /**
   * Activates tag management.
   */
  _activateTags() {
    const doc = this.document;
    const root = this.element;

    const traitTags = {
      ".trait-tag": "traits",
    };

    for (const [selector, path] of Object.entries(traitTags)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", async () => {
          const val = el.getAttribute("value");
          const current = doc.system[path].filter((v) => v !== val);
          await doc.update({ [`system.${path}`]: current });
        });
      });
    }

    const buttonUpdates = {
      ".ab-size-button": {
        "system.size.min": this.item.system.size.value,
        "system.size.max": this.item.system.size.value,
      },
      ".ab-lifespan-button": {
        "system.adult": 20,
        "system.lifespan": 100,
      },
    };

    for (const [selector, update] of Object.entries(buttonUpdates)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => doc.update(update));
      });
    }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }
    this._activateTags();
  }
}
