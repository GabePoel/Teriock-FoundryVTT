import BaseFieldSetter from "./base-field-setter.mjs";

/**
 * Dialog for setting an ability's delivery and piercing.
 * @property {TeriockAbility} document
 */
export default class AbilityDeliverySetter extends BaseFieldSetter {
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

  /** @inheritDoc */
  get _titlePrefix() {
    return "TERIOCK.SYSTEMS.Ability.FIELDS.delivery.label";
  }
}
