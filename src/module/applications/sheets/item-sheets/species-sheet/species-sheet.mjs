import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { makeIconClass, mix } from "../../../../helpers/utils.mjs";
import { setStatDiceDialog } from "../../../dialogs/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSheet from "../base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 * @extends {BaseItemSheet}
 * @mixes WikiButtonSheet
 * @property {TeriockSpecies} document
 * @property {TeriockSpecies} item
 */
export default class SpeciesSheet extends mix(
  BaseItemSheet,
  mixins.WikiButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["species"],
    window: {
      icon: makeIconClass(documentOptions.species.icon, "title"),
    },
    actions: {
      setHpDice: this._onSetHpDice,
      setMpDice: this._onSetMpDice,
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
   */
  static async _onSetHpDice() {
    await setStatDiceDialog(
      this.document,
      "hp",
      this.document._source.system.statDice.hp.number.raw,
      this.document.system.statDice.hp.faces,
    );
  }

  /**
   * Set an MP dice formula.
   * @returns {Promise<void>}
   */
  static async _onSetMpDice() {
    await setStatDiceDialog(
      this.document,
      "mp",
      this.document._source.system.statDice.mp.number.raw,
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
    if (!this.isEditable) {
      return;
    }
    this._activateTags();
  }
}
