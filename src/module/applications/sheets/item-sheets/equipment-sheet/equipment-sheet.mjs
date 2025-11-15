import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { cleanCapitalization } from "../../../../helpers/clean.mjs";
import {
  UseButtonSheetMixin,
  WikiButtonSheetMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";
import {
  fontContextMenu,
  powerLevelContextMenu,
} from "./connections/_context-menus.mjs";

/**
 * Sheet for a {@link TeriockEquipment}.
 * @extends {TeriockBaseItemSheet}
 * @property {TeriockEquipment} document
 * @property {TeriockEquipment} item
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class TeriockEquipmentSheet extends WikiButtonSheetMixin(
  UseButtonSheetMixin(TeriockBaseItemSheet),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    actions: {
      toggleEquipped: this._toggleEquipped,
      toggleShattered: this._toggleShattered,
      toggleDampened: this._toggleDampened,
    },
    window: {
      icon: `fa-solid fa-${documentOptions.equipment.icon}`,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/equipment-template/equipment-template.hbs",
      scrollable: [".ab-sheet-everything"],
    },
  };

  /**
   * Toggles the dampened state of the equipment.
   * @returns {Promise<void>} Promise that resolves when dampened state is toggled.
   * @static
   */
  static async _toggleDampened() {
    if (this.document.system.dampened) {
      await this.document.system.undampen();
    } else {
      await this.document.system.dampen();
    }
  }

  /**
   * Toggles the equipped state of the equipment.
   * @returns {Promise<void>} Promise that resolves when equipped state is toggled.
   * @static
   */
  static async _toggleEquipped() {
    if (this.document.system.equipped) {
      await this.document.system.unequip();
    } else {
      await this.document.system.equip();
    }
  }

  /**
   * Toggles the shattered state of the equipment.
   * @returns {Promise<void>} Promise that resolves when shattered state is toggled.
   * @static
   */
  static async _toggleShattered() {
    if (this.document.system.shattered) {
      await this.document.system.repair();
    } else {
      await this.document.system.shatter();
    }
  }

  /**
   * Activates tag management.
   */
  _activateTags() {
    const doc = this.document;
    const root = this.element;

    const flagTags = {
      ".flag-tag-glued": "system.glued",
    };

    for (const [selector, path] of Object.entries(flagTags)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", async (e) => {
          e.preventDefault();
          await doc.update({ [path]: false });
        });
      });
    }

    const arrayTags = {
      ".equipment-class-tag": "equipmentClasses",
    };

    for (const [selector, path] of Object.entries(arrayTags)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", async () => {
          const val = el.getAttribute("data-value");
          const current = doc.system[path].filter((v) => v !== val);
          await doc.update({ [`system.${path}`]: current });
        });
      });
    }

    const staticUpdates = {
      ".ab-damage-button": { "system.damage.base.saved": 1 },
      ".ab-two-handed-damage-button": {
        "system.damage.twoHanded.saved": this.item.system.damage.base.saved,
      },
      ".ab-short-range-button": { "system.range.short.saved": 5 },
      ".ab-range-button": { "system.range.long.saved": 5 },
      ".ab-av-button": { "system.av.saved": 1 },
      ".ab-bv-button": { "system.bv.saved": 1 },
      ".ab-weight-button": { "system.weight": 1 },
      ".ab-tier-button": { "system.tier.saved": "1" },
    };

    for (const [selector, update] of Object.entries(staticUpdates)) {
      root.querySelectorAll(selector).forEach((el) => {
        el.addEventListener("click", () => doc.update(update));
      });
    }

    const dampenedEls = root.querySelectorAll(".flag-tag-dampened");
    dampenedEls.forEach((el) =>
      el.addEventListener(
        "click",
        async () => await doc.update({ "system.dampened": false }),
      ),
    );

    const shatteredEls = root.querySelectorAll(".flag-tag-shattered");
    shatteredEls.forEach((el) =>
      el.addEventListener(
        "click",
        async () => await doc.update({ "system.shattered": false }),
      ),
    );
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    if (!this.editable) {
      return;
    }

    const item = this.item;

    this._connectContextMenu(
      ".power-level-box",
      powerLevelContextMenu(item),
      "click",
    );
    this._connectContextMenu(".ab-title", fontContextMenu(item), "contextmenu");

    this.element.querySelectorAll(".capitalization-input").forEach((el) => {
      this._connectInput(el, el.getAttribute("name"), cleanCapitalization);
    });

    this._activateTags();
    const buttonMap = {
      ".ab-special-rules-button": "system.specialRules",
      ".ab-description-button": "system.description",
      ".ab-flaws-button": "system.flaws",
      ".ab-notes-button": "system.notes",
    };
    this._connectButtonMap(buttonMap);
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
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
