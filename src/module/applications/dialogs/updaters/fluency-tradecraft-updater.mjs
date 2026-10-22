import { makeIconClass } from "../../../utils/_module.mjs";
import BaseUpdater from "./base-updater.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Dialog for updating a fluency's field and tradecraft.
 * @property {TeriockActiveEffect<"fluency">} document
 */
export default class FluencyTradecraftUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.document.fluency, "title"),
      title: "TERIOCK.COMMON.Tradecraft",
    },
  };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.field", "system.tradecraft"];
  }

  /** @inheritDoc */
  _getChoicesForPath(path) {
    if (path === "system.tradecraft") {
      const field = this._currentData.system.field;
      const choices = {};
      for (const [key, config] of Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts)) {
        if (config.field === field) { choices[key] = _loc(config.label); }
      }
      return choices;
    }
    return super._getChoicesForPath(path);
  }

  /** @inheritDoc */
  _normalizeCurrentData() {
    const field = this._currentData.system.field;
    if (TERIOCK.CONFIG.tradecraft.tradecrafts[this._currentData.system.tradecraft]?.field !== field) {
      this._currentData.system.tradecraft = Object.keys(TERIOCK.CONFIG.tradecraft.tradecrafts).find(k =>
        TERIOCK.CONFIG.tradecraft.tradecrafts[k].field === field
      );
    }
  }
}
