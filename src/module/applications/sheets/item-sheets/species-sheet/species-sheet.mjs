import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockSpecies}.
 *
 * @property {TeriockSpecies} document
 * @property {TeriockSpecies} item
 */
export default class TeriockSpeciesSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["species"],
    window: {
      icon: "fa-solid fa-" + documentOptions.species.icon,
    },
    actions: {
      addHitDie: this._addHitDie,
      addManaDie: this._addManaDie,
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

  /** Add hit die. */
  static async _addHitDie() {
    await this.document.system.addHitDie(8);
  }

  /** Add mana die. */
  static async _addManaDie() {
    await this.document.system.addManaDie(8);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    await this._enrichAll(context, {
      description: this.item.system.description,
      appearance: this.item.system.appearance,
    });
    return context;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) return;
    this._activateTags();
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
}
