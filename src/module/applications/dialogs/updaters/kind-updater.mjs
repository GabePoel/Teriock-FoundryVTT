import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * Dialog for updating a document's kind.
 * @property {AnyChildDocument} document
 */
export default class KindUpdater extends BaseUpdater {
  /**
   * Kind entry for the value currently shown in the form.
   * @returns {Teriock.Config.KindEntry | undefined}
   */
  get #kindEntry() {
    const kind = foundry.utils.getProperty(this._currentData, "system.kind");
    return this.document.system.constructor.kinds()?.[kind];
  }

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.kind"];
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    const icon = this.#kindEntry?.icon;
    if (icon && this.window?.icon) { this.window.icon.className = makeIconClass(icon, "title"); }
  }
}
