import { documentOptions } from "../../../../constants/options/document-options.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
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
 * @mixes EquipmentDropSheet
 * @mixes UseButtonSheet
 * @mixes WikiButtonSheet
 */
export default class TeriockEquipmentSheet extends mix(
  TeriockBaseItemSheet,
  mixins.EquipmentDropSheetMixin,
  mixins.UseButtonSheetMixin,
  mixins.WikiButtonSheetMixin,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["equipment"],
    actions: {
      toggleEquipped: this.#onToggleEquipped,
      toggleShattered: this.#onToggleShattered,
      toggleDampened: this.#onToggleDampened,
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
  static async #onToggleDampened() {
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
  static async #onToggleEquipped() {
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
  static async #onToggleShattered() {
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
      ".ab-damage-button": { "system.damage.base.raw": "1" },
      ".ab-two-handed-damage-button": {
        "system.damage.twoHanded.raw":
          this.item.system.damage.base.formula || "1",
      },
      ".ab-short-range-button": { "system.range.short.raw": "5" },
      ".ab-range-button": { "system.range.long.raw": "5" },
      ".ab-av-button": { "system.av.raw": "1" },
      ".ab-bv-button": { "system.bv.raw": "1" },
      ".ab-hit-button": { "system.hit.raw": "1" },
      ".ab-weight-button": { "system.weight.raw": "1" },
      ".ab-tier-button": { "system.tier.raw": "1" },
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
    this._connectContextMenu(
      ".power-level-box",
      powerLevelContextMenu(this.item),
      "click",
    );
    this._connectContextMenu(
      ".ab-title",
      fontContextMenu(this.item),
      "contextmenu",
    );
    this._activateTags();
  }
}
