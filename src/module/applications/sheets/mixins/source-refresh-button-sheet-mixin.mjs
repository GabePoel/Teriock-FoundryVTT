import { icons } from "../../../constants/display/_module.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { SourceRefresher } from "../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, SourceRefreshButtonSheet>}
 */
export default function SourceRefreshButtonSheetMixin(Base) {
  /**
   * @mixin
   */
  class SourceRefreshButtonSheet extends Base {
    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: { sourceRefresh: this._onSourceRefresh },
      window: {
        controls: [{
          action: "sourceRefresh",
          icon: makeIconClass(icons.manifest.ui.compendium, "contextMenu"),
          label: "TERIOCK.SYSTEMS.Common.MENU.sourceRefresh",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }],
      },
    };

    /**
     * Refresh this document from the index.
     * @returns {Promise<void>}
     */
    static async _onSourceRefresh() {
      await SourceRefresher.create({ document: this.document });
    }
  }

  return SourceRefreshButtonSheet;
}
