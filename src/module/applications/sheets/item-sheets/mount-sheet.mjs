import { documentConfig } from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

/**
 * Sheet for a {@link TeriockMount}.
 * @property {TeriockMount} document
 * @property {TeriockMount} item
 */
export default class MountSheet extends BaseItemSheet {
  /**
   * Toggles the mounted state of the mount.
   * @returns {Promise<void>}
   */
  static async #onToggleMounted() {
    if (this.document.system.mounted) {
      await this.document.system.unmount();
    } else {
      await this.document.system.mount();
    }
  }

  /** @inheritDoc */
  static BARS = ["teriock/sheets/shared/bars/stat-bar", "teriock/sheets/items/mount/status-bar"];

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      toggleMounted: this.#onToggleMounted,
    },
    classes: ["mount"],
    window: {
      icon: makeIconClass(documentConfig.mount.icon, "title"),
    },
  };
}
