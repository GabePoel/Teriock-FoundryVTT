import documentConfig from "../../../../constants/config/document-config.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import { toCamelCase, toKebabCase } from "../../../../helpers/string.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * Dialog for updating a rank's archetype and class.
 * @property {TeriockRank} document
 */
export default class RankClassUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(documentConfig.rank.icon, "title") } };

  /**
   * Keep the selected class inside the selected archetype, so switching archetype doesn't leave a class from the
   * previous one selected.
   */
  #normalizeCurrentData() {
    const archetype = this._currentData.system.archetype;
    if (TERIOCK.config.class.classes[toCamelCase(this._currentData.system.class)]?.archetype !== archetype) {
      this._currentData.system.class = toKebabCase(
        Object.keys(TERIOCK.config.class.classes).find(k => TERIOCK.config.class.classes[k].archetype === archetype),
      );
    }
  }

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.archetype", "system.class"];
  }

  /** @inheritDoc */
  _getChoicesForPath(path) {
    if (path === "system.class") {
      const archetype = this._currentData.system.archetype;
      const choices = {};
      for (const [key, config] of Object.entries(TERIOCK.config.class.classes)) {
        if (config.archetype === archetype) { choices[toKebabCase(key)] = _loc(config.label); }
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
