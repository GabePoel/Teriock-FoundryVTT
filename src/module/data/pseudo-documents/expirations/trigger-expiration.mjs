import { mixClasses } from "../../../helpers/construction.mjs";
import { TriggerMechanicMixin } from "../mixins/_module.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

/**
 * @mixes TriggerMechanic
 */
export default class TriggerExpiration extends mixClasses(BaseExpiration, TriggerMechanicMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Trigger"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "trigger" });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, ...this._triggerPaths];
  }

  /** @inheritDoc */
  _validateExpirationAttempt(type, context) {
    return super._validateExpirationAttempt(type, context) && this.triggeredBy(context.trigger, context);
  }

  /** @inheritDoc */
  getTriggerLabel(context) {
    return context.trigger ?? super.getTriggerLabel(context);
  }
}
