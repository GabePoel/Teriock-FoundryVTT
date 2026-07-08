import { icons } from "../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import BaseFieldSetter from "./base-field-setter.mjs";

/**
 * Dialog for setting an ability's delivery and piercing.
 * @property {TeriockAbility} document
 */
export default class AbilityDeliverySetter extends BaseFieldSetter {
  /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(icons.ability.delivery, "title") } };

  /** @inheritDoc */
  get _dataPaths() {
    return ["system.delivery", "system.piercing.raw"];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["system.delivery"];
    if (TERIOCK.config.ability.delivery[this._currentData.system.delivery]?.allowPiercing) {
      paths.push("system.piercing.raw");
    }
    return paths;
  }
}
