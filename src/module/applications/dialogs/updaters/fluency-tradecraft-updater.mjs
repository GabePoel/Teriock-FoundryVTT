import documentConfig from "../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * Dialog for updating a fluency's field and tradecraft.
 * @property {TeriockFluency} document
 */
export default class FluencyTradecraftUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(documentConfig.fluency.icon, "title") } };

  /**
   * Keep the selected tradecraft inside the selected field, so switching field doesn't leave a tradecraft from the
   * previous one selected.
   */
  #normalizeCurrentData() {
    const field = this._currentData.system.field;
    if (TERIOCK.config.tradecraft.tradecrafts[this._currentData.system.tradecraft]?.field !== field) {
      this._currentData.system.tradecraft = Object.keys(TERIOCK.config.tradecraft.tradecrafts).find(k =>
        TERIOCK.config.tradecraft.tradecrafts[k].field === field
      );
    }
  }

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.field", "system.tradecraft"];
  }

  /** @inheritDoc */
  _getChoicesForPath(path) {
    if (path === "system.tradecraft") {
      const field = this._currentData.system.field;
      const choices = {};
      for (const [key, config] of Object.entries(TERIOCK.config.tradecraft.tradecrafts)) {
        if (config.field === field) { choices[key] = _loc(config.label); }
      }
      return choices;
    }
    return super._getChoicesForPath(path);
  }

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    this.#normalizeCurrentData();
  }
}
