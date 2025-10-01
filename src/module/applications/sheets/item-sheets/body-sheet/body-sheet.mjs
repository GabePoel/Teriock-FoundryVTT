import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

export default class TeriockBodySheet extends TeriockBaseItemSheet {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["body"],
    window: {
      icon: `fa-solid fa-hand`,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/body-template/body-template.hbs",
      scrollable: [".ab-sheet-everything"],
    },
  };

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }

    const staticUpdates = {
      ".ab-damage-button": { "system.damage.base.saved": 1 },
      ".ab-av-button": { "system.av.saved": 1 },
      ".ab-bv-button": { "system.bv.saved": 1 },
    };

    for (const [selector, update] of Object.entries(staticUpdates)) {
      this.element.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => this.document.update(update));
      });
    }

    const buttonMap = {
      ".ab-special-rules-button": "system.specialRules",
      ".ab-description-button": "system.description",
      ".ab-flaws-button": "system.flaws",
      ".ab-notes-button": "system.notes",
    };
    this._connectButtonMap(buttonMap);
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    await this._enrichAll(context, {
      specialRules: this.item.system.specialRules,
      description: this.item.system.description,
      flaws: this.item.system.flaws,
      notes: this.item.system.notes,
    });
    return context;
  }
}
