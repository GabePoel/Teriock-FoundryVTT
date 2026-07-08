import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseFieldSetter from "./base-field-setter.mjs";

/**
 * Dialog for setting an ability's interaction and feat save attribute.
 * @property {TeriockAbility} document
 */
export default class AbilityInteractionSetter extends BaseFieldSetter {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ability.interaction, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.interaction", "system.featSaveAttribute"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.interaction"];
    if (this._currentData.system.interaction === "feat") { paths.push("system.featSaveAttribute"); }
    return paths;
  }
}
