import { makeIconClass, objectMap } from "../../../../utils/_module.mjs";
import BaseUpdater from "../base-updater.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * Dialog for updating an ability's expansion type and feat save attribute.
 * @property {TeriockActiveEffect<"ability">} document
 */
export default class AbilityExpansionUpdater extends BaseUpdater {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = {
    window: {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ability.expansion, "title"),
      title: "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.label",
    },
  };

  /**
   * The currently selected expansion type.
   * @returns {Teriock.Keys.Expansion | null}
   */
  get #expansionType() {
    return this._currentData.system.expansion.type || null;
  }

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.expansion.type", "system.expansion.featSaveAttribute"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.expansion.type"];
    if (TERIOCK.CONFIG.ability.expansion[this.#expansionType]?.needsSaveAttribute) {
      paths.push("system.expansion.featSaveAttribute");
    }
    return paths;
  }

  /** @inheritDoc */
  _getChoicesForPath(path) {
    if (path === "system.expansion.type") {
      return {
        "": _loc("TERIOCK.SCHEMA.Competence.choices.0"),
        ...objectMap(TERIOCK.CONFIG.ability.expansion, v => v.label, { localize: true }),
      };
    }
    return super._getChoicesForPath(path);
  }

  /** @inheritDoc */
  _normalizeCurrentData() {
    if (this._currentData.system.expansion.type === "") { this._currentData.system.expansion.type = null; }
  }
}
