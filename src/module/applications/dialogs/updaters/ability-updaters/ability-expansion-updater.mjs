import { icons } from "../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * Dialog for updating an ability's expansion type and feat save attribute.
 * @property {TeriockAbility} document
 */
export default class AbilityExpansionUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ability.expansion, "title") } };

  /**
   * The currently selected expansion type.
   * @returns {Teriock.Keys.Expansion | null}
   */
  get #expansionType() {
    return this._currentData.system.expansion.type || null;
  }

  /**
   * Ensure expansion data stays consistent with the selected type.
   */
  #normalizeCurrentData() {
    if (this._currentData.system.expansion.type === "") { this._currentData.system.expansion.type = null; }
  }

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.expansion.type", "system.expansion.featSaveAttribute"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.expansion.type"];
    if (TERIOCK.config.ability.expansion[this.#expansionType]?.needsSaveAttribute) {
      paths.push("system.expansion.featSaveAttribute");
    }
    return paths;
  }

  /** @inheritDoc */
  _getChoicesForPath(path) {
    if (path === "system.expansion.type") {
      return {
        "": _loc("TERIOCK.SCHEMA.Competence.choices.0"),
        ...objectMap(TERIOCK.config.ability.expansion, v => v.label, { localize: true }),
      };
    }
    return super._getChoicesForPath(path);
  }

  /** @inheritDoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    this.#normalizeCurrentData();
  }
}
