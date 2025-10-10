import { documentOptions } from "../../../../constants/options/document-options.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockMount}.
 * @property {TeriockMount} document
 * @property {TeriockMount} item
 */
export default class TeriockMountSheet extends TeriockBaseItemSheet {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["mount"],
    actions: {
      toggleMounted: this._toggleMounted,
    },
    window: {
      icon: "fa-solid fa-" + documentOptions.mount.icon,
    },
  };

  /** @inheritDoc */
  static PARTS = {
    all: {
      template:
        "systems/teriock/src/templates/document-templates/item-templates/mount-template/mount-template.hbs",
      scrollable: [".ab-sheet-everything"],
    },
  };

  /**
   * Toggles the mounted state of the mount.
   * @returns {Promise<void>} - Promise that resolves when the mounted state is toggled.
   * @private
   */
  static async _toggleMounted() {
    if (this.document.system.mounted) {
      await this.document.system.unmount();
    } else {
      await this.document.system.mount();
    }
  }
}
